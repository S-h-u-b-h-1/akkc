import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const UPLOADS_DIR = path.join(__dirname, '../../uploads/bills');

export const generateBillPdf = async (bill) => {
  return new Promise((resolve, reject) => {
    try {
      if (!fs.existsSync(UPLOADS_DIR)) {
        fs.mkdirSync(UPLOADS_DIR, { recursive: true });
      }

      const fileName = `${bill.billNumber}.pdf`;
      const filePath = path.join(UPLOADS_DIR, fileName);
      const relativePath = `/uploads/bills/${fileName}`;

      const doc = new PDFDocument({ margin: 50 });
      const stream = fs.createWriteStream(filePath);

      doc.pipe(stream);

      // Header from Billing Entity
      const entity = bill.billingEntity || { name: 'A K Kataruka and Company' };

      doc.fontSize(20).text(entity.name, { align: 'center' }).moveDown(0.5);
      
      if (entity.address) {
        doc.fontSize(10).text(entity.address, { align: 'center' });
      }
      if (entity.email || entity.phone) {
        const contact = [entity.email, entity.phone].filter(Boolean).join(' | ');
        doc.fontSize(10).text(contact, { align: 'center' });
      }
      if (entity.gstNumber) {
        doc.fontSize(10).text(`GSTIN: ${entity.gstNumber}`, { align: 'center' });
      }
      if (entity.panNumber) {
        doc.fontSize(10).text(`PAN: ${entity.panNumber}`, { align: 'center' });
      }
      doc.moveDown(2);

      // Bill Info
      doc.fontSize(12)
        .text(`Bill Number: ${bill.billNumber}`)
        .text(`Date: ${bill.billDate ? new Date(bill.billDate).toLocaleDateString() : new Date().toLocaleDateString()}`)
        .text(`Client: ${bill.clientName}`)
        .text(`Email: ${bill.clientEmail || 'N/A'}`);
      
      if (bill.sourceType === 'CLUBBED') {
        doc.text(`Type: Clubbed Bill`);
      }
      doc.moveDown(2);

      // Table Header
      const tableTop = doc.y;
      doc.font('Helvetica-Bold');
      doc.text('Description', 50, tableTop, { width: 200 });
      doc.text('Qty', 260, tableTop, { width: 40 });
      doc.text('Rate', 310, tableTop, { width: 100, align: 'right' });
      doc.text('Amount (INR)', 450, tableTop, { width: 100, align: 'right' });
      doc.moveDown(0.5);
      
      doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
      doc.moveDown(0.5);

      // Table Rows
      doc.font('Helvetica');
      let y = doc.y;

      bill.items.forEach((item) => {
        const title = item.taskTitle || 'Service';
        const qty = item.quantity || 1;
        const rate = Number(item.amount).toFixed(2);
        const amount = (qty * Number(item.amount)).toFixed(2);

        // Calculate height needed for description
        const textHeight = doc.heightOfString(title, { width: 200 });
        
        doc.text(title, 50, y, { width: 200 });
        doc.text(qty.toString(), 260, y, { width: 40 });
        doc.text(rate, 310, y, { width: 100, align: 'right' });
        doc.text(amount, 450, y, { width: 100, align: 'right' });
        
        y += textHeight + 5; // next row
      });

      doc.moveTo(50, y).lineTo(550, y).stroke();
      doc.moveDown(1);
      y += 10;

      // Total
      doc.font('Helvetica-Bold');
      doc.text('Total Amount:', 300, y, { width: 100, align: 'right' });
      doc.text(`INR ${Number(bill.totalAmount).toFixed(2)}`, 450, y, { width: 100, align: 'right' });

      doc.moveDown(2);

      if (bill.notes) {
        doc.font('Helvetica');
        doc.text('Notes:', 50, doc.y, { underline: true });
        doc.text(bill.notes, 50, doc.y);
        doc.moveDown(2);
      }

      if (entity.bankName && entity.bankAccountNumber) {
        doc.font('Helvetica-Bold').text('Bank Details:');
        doc.font('Helvetica')
          .text(`Bank: ${entity.bankName}`)
          .text(`Account No: ${entity.bankAccountNumber}`)
          .text(`IFSC: ${entity.ifscCode || 'N/A'}`);
        doc.moveDown(2);
      }

      doc.font('Helvetica-Oblique');
      doc.text('Thank you for your business!', 50, doc.y, { align: 'center' });

      doc.end();

      stream.on('finish', () => resolve(relativePath));
      stream.on('error', reject);
    } catch (err) {
      reject(err);
    }
  });
};
