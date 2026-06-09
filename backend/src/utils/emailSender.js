import { google } from 'googleapis';
import nodemailer from 'nodemailer';
import { env } from '../config/env.js';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const BACKEND_ROOT = path.join(__dirname, '../../');

import { AppError } from './appError.js';
import { HTTP_STATUS } from '../constants/api.js';

let gmail = null;

if (env.gmailClientId && env.gmailClientSecret && env.gmailRefreshToken) {
  const oAuth2Client = new google.auth.OAuth2(
    env.gmailClientId,
    env.gmailClientSecret,
    'https://developers.google.com/oauthplayground'
  );

  oAuth2Client.setCredentials({ refresh_token: env.gmailRefreshToken });
  gmail = google.gmail({ version: 'v1', auth: oAuth2Client });
}

export const sendBillEmail = async (bill) => {
  if (!gmail) {
    throw new AppError('Gmail API is not configured. Please add GMAIL_CLIENT_ID, GMAIL_CLIENT_SECRET, and GMAIL_REFRESH_TOKEN.', HTTP_STATUS.BAD_REQUEST);
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

  // Create MIME message using nodemailer
  const mailOptions = {
    from: env.smtpFrom,
    to: bill.clientEmail,
    subject: `Invoice/Bill for Completed Tasks - ${bill.billNumber}`,
    text: `Dear ${bill.clientName},\n\nPlease find attached the invoice/bill (${bill.billNumber}) for the recently completed tasks.\n\nThank you,\nA K Kataruka and Company`,
    attachments: [
      {
        filename: `${bill.billNumber.replace(/[^a-zA-Z0-9-]/g, '_')}.pdf`,
        path: pdfPath
      }
    ]
  };

  const mailComposer = new nodemailer.MailComposer(mailOptions);
  const messageBuffer = await mailComposer.compile().build();
  const encodedMessage = Buffer.from(messageBuffer)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, ''); // Base64URL encoding required by Gmail API

  try {
    const response = await gmail.users.messages.send({
      userId: 'me',
      requestBody: {
        raw: encodedMessage,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Gmail API Error:', error);
    throw new AppError(`Failed to send email via Gmail API: ${error.message}`, HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
};
