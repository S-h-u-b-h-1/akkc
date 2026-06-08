import nodemailer from 'nodemailer';
import { env } from '../config/env.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const BACKEND_ROOT = path.join(__dirname, '../../');

const transporter = nodemailer.createTransport({
  host: env.smtpHost,
  port: env.smtpPort,
  auth: {
    user: env.smtpUser,
    pass: env.smtpPass
  }
});

export const sendBillEmail = async (bill) => {
  if (!bill.clientEmail) {
    throw new Error('No email address provided for the client.');
  }
  if (!bill.pdfUrl) {
    throw new Error('PDF has not been generated for this bill.');
  }

  const pdfPath = path.join(BACKEND_ROOT, bill.pdfUrl);

  const mailOptions = {
    from: env.smtpFrom,
    to: bill.clientEmail,
    subject: `Invoice/Bill for Completed Tasks - ${bill.billNumber}`,
    text: `Dear ${bill.clientName},\n\nPlease find attached the invoice/bill (${bill.billNumber}) for the recently completed tasks.\n\nThank you,\nA K Kataruka and Company`,
    attachments: [
      {
        filename: `${bill.billNumber}.pdf`,
        path: pdfPath
      }
    ]
  };

  await transporter.sendMail(mailOptions);
};
