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

      // Header
      doc
        .fontSize(20)
        .text('A K Kataruka and Company', { align: 'center' })
        .moveDown(0.5);
      
      doc
        .fontSize(10)
        .text('Chartered Accountants', { align: 'center' })
        .moveDown(2);

      // Bill Info
      doc
        .fontSize(12)
        .text(`Bill Number: ${bill.billNumber}`)
        .text(`Date: ${new Date().toLocaleDateString()}`)
        .text(`Client: ${bill.clientName}`)
        .text(`Email: ${bill.clientEmail || 'N/A'}`)
        .moveDown(2);

      // Table Header
      const tableTop = doc.y;
      doc.font('Helvetica-Bold');
      doc.text('Task', 50, tableTop);
      doc.text('Domain', 250, tableTop);
      doc.text('Amount (INR)', 450, tableTop, { width: 100, align: 'right' });
      doc.moveDown(0.5);
      
      doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
      doc.moveDown(0.5);

      // Table Rows
      doc.font('Helvetica');
      let y = doc.y;

      bill.items.forEach((item) => {
        doc.text(item.taskTitle, 50, y, { width: 190 });
        doc.text(item.taskDomain, 250, y, { width: 190 });
        doc.text(Number(item.amount).toFixed(2), 450, y, { width: 100, align: 'right' });
        
        y = doc.y + 10; // next row
      });

      doc.moveTo(50, y).lineTo(550, y).stroke();
      doc.moveDown(1);
      y += 10;

      // Total
      doc.font('Helvetica-Bold');
      doc.text('Total Amount:', 300, y, { width: 100, align: 'right' });
      doc.text(`INR ${Number(bill.totalAmount).toFixed(2)}`, 450, y, { width: 100, align: 'right' });

      doc.moveDown(3);
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
