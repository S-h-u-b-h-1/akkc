import nodemailer from 'nodemailer';
import { env } from '../config/env.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const BACKEND_ROOT = path.join(__dirname, '../../');

let transporter = null;

const createTransporter = () => {
  if (!env.smtpHost || !env.smtpUser || !env.smtpPass) {
    return null;
  }
  return nodemailer.createTransport({
    host: env.smtpHost,
    port: env.smtpPort,
    secure: env.smtpPort === 465, // true for 465, false for 587
    auth: {
      user: env.smtpUser,
      pass: env.smtpPass
    }
  });
};

transporter = createTransporter();

import { AppError } from './appError.js';
import { HTTP_STATUS } from '../constants/api.js';

export const sendBillEmail = async (bill) => {
  if (!transporter) {
    throw new AppError('Email service is not configured yet. Please add SMTP credentials.', HTTP_STATUS.BAD_REQUEST);
  }
  if (!bill.clientEmail) {
    throw new AppError('No email address provided for the client.', HTTP_STATUS.BAD_REQUEST);
  }
  if (!bill.pdfUrl) {
    throw new AppError('PDF has not been generated for this bill.', HTTP_STATUS.BAD_REQUEST);
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
