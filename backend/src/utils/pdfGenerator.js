import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { convertAmountToWords } from './currencyFormatter.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const UPLOADS_DIR = path.join(__dirname, '../../uploads/bills');

// Helper to draw a stroked rectangle
const drawBox = (doc, x, y, width, height) => {
  doc.rect(x, y, width, height).stroke();
};

export const generateBillPdf = async (bill) => {
  return new Promise((resolve, reject) => {
    try {
      if (!fs.existsSync(UPLOADS_DIR)) {
        fs.mkdirSync(UPLOADS_DIR, { recursive: true });
      }

      const fileName = `${bill.billNumber.replace(/\//g, '_')}.pdf`;
      const filePath = path.join(UPLOADS_DIR, fileName);
      const relativePath = `/uploads/bills/${fileName}`;

      const doc = new PDFDocument({ size: 'A4', margin: 40 });
      const stream = fs.createWriteStream(filePath);

      doc.pipe(stream);

      const entity = bill.billingEntity || {};
      const client = typeof bill.clientDetails === 'object' && bill.clientDetails ? bill.clientDetails : {};
      const invoice = typeof bill.invoiceDetails === 'object' && bill.invoiceDetails ? bill.invoiceDetails : {};
      const tax = typeof bill.taxDetails === 'object' && bill.taxDetails ? bill.taxDetails : {};

      // 1. HEADER (Letterhead)
      if (entity.name) {
        doc.font('Helvetica-Bold').fontSize(16).text(entity.name, 40, 40, { align: 'center' });
      }
      doc.font('Helvetica').fontSize(10);
      let headerAddress = '';
      if (entity.address) headerAddress += entity.address;
      if (entity.city) headerAddress += `, ${entity.city}`;
      if (entity.state) headerAddress += `, ${entity.state}`;
      if (entity.pincode) headerAddress += ` - ${entity.pincode}`;
      if (headerAddress) {
        doc.text(headerAddress, { align: 'center' });
      }

      const contactArr = [];
      if (entity.phone) contactArr.push(`Ph: ${entity.phone}`);
      if (entity.email) contactArr.push(`Email: ${entity.email}`);
      if (contactArr.length > 0) {
        doc.text(contactArr.join(' | '), { align: 'center' });
      }

      const taxArr = [];
      if (entity.gstNumber) taxArr.push(`GSTIN: ${entity.gstNumber}`);
      if (entity.panNumber) taxArr.push(`PAN: ${entity.panNumber}`);
      if (taxArr.length > 0) {
        doc.font('Helvetica-Bold').text(taxArr.join(' | '), { align: 'center' });
      }

      doc.moveDown(1);
      
      const isTaxInvoice = tax.totalTaxAmount && parseFloat(tax.totalTaxAmount) > 0;
      doc.font('Helvetica-Bold').fontSize(12).text(isTaxInvoice ? 'TAX INVOICE' : 'INVOICE', { align: 'center', underline: true });
      doc.moveDown(1);

      const startY = doc.y;

      // TOP BOX FOR CLIENT & INVOICE DETAILS
      drawBox(doc, 40, startY, 515, 120);

      // Vertical separator
      doc.moveTo(300, startY).lineTo(300, startY + 120).stroke();

      // Left Side: Client Details
      doc.font('Helvetica').fontSize(9);
      doc.text('To,', 45, startY + 5);
      doc.font('Helvetica-Bold').fontSize(10).text(bill.clientName, 45, startY + 18);
      
      doc.font('Helvetica').fontSize(9);
      let clientAddrY = startY + 32;
      
      if (client.address) {
        doc.text(client.address, 45, clientAddrY, { width: 245 });
        clientAddrY = doc.y;
      }
      if (client.state) {
        doc.text(`State: ${client.state}`, 45, clientAddrY);
        clientAddrY += 12;
      }
      if (client.gstNumber) {
        doc.font('Helvetica-Bold').text(`GSTIN: ${client.gstNumber}`, 45, clientAddrY);
        clientAddrY += 12;
      }
      if (client.panNumber) {
        doc.font('Helvetica-Bold').text(`PAN: ${client.panNumber}`, 45, clientAddrY);
      }

      // Right Side: Invoice Details
      let invY = startY + 5;
      doc.font('Helvetica-Bold').text(`Invoice No: ${bill.billNumber}`, 305, invY);
      doc.font('Helvetica').text(`Date: ${new Date(bill.billDate).toLocaleDateString('en-IN')}`, 425, invY);
      
      // Horizontal line in the right section
      doc.moveTo(300, invY + 15).lineTo(555, invY + 15).stroke();
      
      invY += 20;
      if (invoice.deliveryNote) {
        doc.text(`Delivery Note: ${invoice.deliveryNote}`, 305, invY);
        invY += 12;
      }
      if (invoice.modeOfPayment) {
        doc.text(`Mode of Payment: ${invoice.modeOfPayment}`, 305, invY);
        invY += 12;
      }
      if (invoice.referenceNumber) {
        doc.text(`Reference No: ${invoice.referenceNumber}`, 305, invY);
        invY += 12;
      }
      if (invoice.buyerOrderNumber) {
        doc.text(`Buyer Order No: ${invoice.buyerOrderNumber}`, 305, invY);
        invY += 12;
      }
      if (invoice.dispatchDocumentNumber) {
        doc.text(`Dispatch Doc No: ${invoice.dispatchDocumentNumber}`, 305, invY);
        invY += 12;
      }
      if (invoice.destination) {
        doc.text(`Destination: ${invoice.destination}`, 305, invY);
      }

      const tableTop = startY + 120 + 10;

      // Draw Main Table Headers
      doc.font('Helvetica-Bold').fontSize(9);
      drawBox(doc, 40, tableTop, 515, 20); // Header box
      
      const cols = {
        sn: 40,
        desc: 75,
        hsn: 300,
        qty: 360,
        rate: 400,
        per: 450,
        amt: 480
      };

      doc.text('S.N.', cols.sn + 5, tableTop + 5);
      doc.text('Description of Services', cols.desc + 5, tableTop + 5);
      doc.text('HSN/SAC', cols.hsn + 5, tableTop + 5);
      doc.text('Qty', cols.qty + 5, tableTop + 5);
      doc.text('Rate', cols.rate + 5, tableTop + 5);
      doc.text('Per', cols.per + 5, tableTop + 5);
      doc.text('Amount', cols.amt + 5, tableTop + 5);

      let rowY = tableTop + 20;
      doc.font('Helvetica').fontSize(9);

      let subtotal = 0;

      bill.items.forEach((item, index) => {
        const title = item.taskTitle || item.remarks || 'Professional Services';
        const hsn = item.hsnSac || '';
        const qty = item.quantity || 1;
        const rate = item.rate || Number(item.amount);
        const per = item.per || 'Nos';
        const amount = Number(item.amount);
        subtotal += amount;

        // Check page break
        if (rowY > 700) {
          doc.addPage();
          rowY = 40;
        }

        const textHeight = doc.heightOfString(title, { width: cols.hsn - cols.desc - 10 });

        doc.text((index + 1).toString(), cols.sn + 5, rowY + 5);
        doc.text(title, cols.desc + 5, rowY + 5, { width: cols.hsn - cols.desc - 10 });
        doc.text(hsn, cols.hsn + 5, rowY + 5);
        doc.text(qty.toString(), cols.qty + 5, rowY + 5);
        doc.text(rate.toFixed(2), cols.rate + 5, rowY + 5);
        doc.text(per, cols.per + 5, rowY + 5);
        doc.text(amount.toFixed(2), cols.amt + 5, rowY + 5, { width: 515 - cols.amt - 10, align: 'right' });

        rowY += textHeight + 10;
      });

      // Draw vertical lines for the table
      doc.moveTo(cols.desc, tableTop).lineTo(cols.desc, rowY).stroke();
      doc.moveTo(cols.hsn, tableTop).lineTo(cols.hsn, rowY).stroke();
      doc.moveTo(cols.qty, tableTop).lineTo(cols.qty, rowY).stroke();
      doc.moveTo(cols.rate, tableTop).lineTo(cols.rate, rowY).stroke();
      doc.moveTo(cols.per, tableTop).lineTo(cols.per, rowY).stroke();
      doc.moveTo(cols.amt, tableTop).lineTo(cols.amt, rowY).stroke();

      // Outer box for items
      drawBox(doc, 40, tableTop + 20, 515, rowY - (tableTop + 20));

      // TOTALS SECTION
      let totalsY = rowY;
      
      // Bottom border for items
      doc.moveTo(40, totalsY).lineTo(555, totalsY).stroke();

      if (isTaxInvoice) {
        doc.font('Helvetica-Bold');
        doc.text('Taxable Value', cols.rate + 5, totalsY + 5);
        doc.text(subtotal.toFixed(2), cols.amt + 5, totalsY + 5, { width: 515 - cols.amt - 10, align: 'right' });
        totalsY += 20;
        doc.moveTo(cols.rate, totalsY).lineTo(555, totalsY).stroke();

        if (tax.cgstAmount > 0) {
          doc.font('Helvetica');
          doc.text(`Add: CGST @ ${tax.cgstPercentage}%`, cols.hsn + 5, totalsY + 5);
          doc.text(Number(tax.cgstAmount).toFixed(2), cols.amt + 5, totalsY + 5, { width: 515 - cols.amt - 10, align: 'right' });
          totalsY += 15;
        }
        if (tax.sgstAmount > 0) {
          doc.font('Helvetica');
          doc.text(`Add: SGST @ ${tax.sgstPercentage}%`, cols.hsn + 5, totalsY + 5);
          doc.text(Number(tax.sgstAmount).toFixed(2), cols.amt + 5, totalsY + 5, { width: 515 - cols.amt - 10, align: 'right' });
          totalsY += 15;
        }
        if (tax.igstAmount > 0) {
          doc.font('Helvetica');
          doc.text(`Add: IGST @ ${tax.igstPercentage}%`, cols.hsn + 5, totalsY + 5);
          doc.text(Number(tax.igstAmount).toFixed(2), cols.amt + 5, totalsY + 5, { width: 515 - cols.amt - 10, align: 'right' });
          totalsY += 15;
        }
        doc.moveTo(cols.hsn, totalsY).lineTo(555, totalsY).stroke();
      }

      const grandTotal = Number(bill.totalAmount);
      doc.font('Helvetica-Bold');
      doc.text('Total Amount', cols.rate + 5, totalsY + 5);
      doc.text(grandTotal.toFixed(2), cols.amt + 5, totalsY + 5, { width: 515 - cols.amt - 10, align: 'right' });
      
      // Draw lines around totals
      drawBox(doc, cols.rate, rowY, 555 - cols.rate, totalsY + 20 - rowY);

      doc.moveDown(2);
      let bottomY = totalsY + 30;

      // Amount in Words
      doc.font('Helvetica-Bold').fontSize(9).text('Amount Chargeable (in words):', 40, bottomY);
      doc.font('Helvetica-Oblique').text(convertAmountToWords(grandTotal), 40, bottomY + 12);
      bottomY += 35;

      // Bank Details and Signature Block
      drawBox(doc, 40, bottomY, 515, 100);
      
      // Left Side: Bank Details
      doc.font('Helvetica-Bold').text('Bank Details:', 45, bottomY + 5);
      doc.font('Helvetica').fontSize(9);
      if (entity.bankName) doc.text(`Bank Name: ${entity.bankName}`, 45, bottomY + 20);
      if (entity.accountHolderName) doc.text(`A/c Holder: ${entity.accountHolderName}`, 45, bottomY + 35);
      if (entity.bankAccountNumber) doc.text(`A/c Number: ${entity.bankAccountNumber}`, 45, bottomY + 50);
      if (entity.ifscCode) doc.text(`IFSC Code: ${entity.ifscCode}`, 45, bottomY + 65);
      if (entity.branchName) doc.text(`Branch: ${entity.branchName}`, 45, bottomY + 80);

      // Vertical Separator
      doc.moveTo(300, bottomY).lineTo(300, bottomY + 100).stroke();

      // Right Side: Signature
      doc.font('Helvetica-Bold').text(`For ${entity.name || 'Company'}`, 305, bottomY + 5, { align: 'center', width: 245 });
      
      doc.font('Helvetica-Bold').fontSize(9).text('Authorised Signatory', 305, bottomY + 85, { align: 'center', width: 245 });

      // Declaration
      let declY = bottomY + 110;
      if (entity.declarationText) {
        doc.font('Helvetica-Bold').text('Declaration:', 40, declY);
        doc.font('Helvetica').fontSize(8).text(entity.declarationText, 40, declY + 12, { width: 515 });
      } else {
        doc.font('Helvetica-Bold').text('Declaration:', 40, declY);
        doc.font('Helvetica').fontSize(8).text('We declare that this invoice shows the actual value of services rendered and that all particulars are true and correct.', 40, declY + 12, { width: 515 });
      }

      doc.end();

      stream.on('finish', () => resolve(relativePath));
      stream.on('error', reject);
    } catch (err) {
      reject(err);
    }
  });
};
