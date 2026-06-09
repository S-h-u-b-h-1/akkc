import { Resend } from 'resend';
import { env } from '../config/env.js';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const BACKEND_ROOT = path.join(__dirname, '../../');

const resend = env.resendApiKey ? new Resend(env.resendApiKey) : null;

import { AppError } from './appError.js';
import { HTTP_STATUS } from '../constants/api.js';

export const sendBillEmail = async (bill) => {
  if (!resend) {
    throw new AppError('Email service is not configured yet. Please add RESEND_API_KEY.', HTTP_STATUS.BAD_REQUEST);
  }
  if (!bill.clientEmail) {
    throw new AppError('No email address provided for the client.', HTTP_STATUS.BAD_REQUEST);
  }
  if (!bill.pdfUrl) {
    throw new AppError('PDF has not been generated for this bill.', HTTP_STATUS.BAD_REQUEST);
  }

  const pdfPath = path.join(BACKEND_ROOT, bill.pdfUrl);
  
  if (!fs.existsSync(pdfPath)) {
    throw new AppError('PDF file is missing from disk.', HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }

  const fileData = fs.readFileSync(pdfPath);

  const { data, error } = await resend.emails.send({
    from: env.smtpFrom,
    to: bill.clientEmail,
    subject: `Invoice/Bill for Completed Tasks - ${bill.billNumber}`,
    text: `Dear ${bill.clientName},\n\nPlease find attached the invoice/bill (${bill.billNumber}) for the recently completed tasks.\n\nThank you,\nA K Kataruka and Company`,
    attachments: [
      {
        filename: `${bill.billNumber.replace(/[^a-zA-Z0-9-]/g, '_')}.pdf`,
        content: fileData
      }
    ]
  });

  if (error) {
    console.error('Resend API Error:', error);
    throw new AppError(`Failed to send email: ${error.message}`, HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }

  return data;
};
