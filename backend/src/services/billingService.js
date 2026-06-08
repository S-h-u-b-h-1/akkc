import crypto from 'crypto';
import { AppError } from '../utils/appError.js';
import { HTTP_STATUS } from '../constants/api.js';
import {
  listEligibleTasksForBilling,
  getTasksByIds,
  createBillWithItems,
  listBills,
  getBillById,
  deleteBill,
  updateBillPdfStatus,
  updateBillEmailStatus
} from '../repositories/billingRepository.js';

export const getEligibleTasks = async (adminId, filters) => {
  return listEligibleTasksForBilling(adminId, filters);
};

export const createBill = async (adminId, taskIds) => {
  const tasks = await getTasksByIds(adminId, taskIds);
  
  if (tasks.length !== taskIds.length) {
    throw new AppError('One or more tasks are invalid or not eligible for billing.', HTTP_STATUS.BAD_REQUEST);
  }

  const clientName = tasks[0].clientName;
  const clientEmail = tasks[0].clientEmail;

  // Validate all tasks belong to the same client
  for (const task of tasks) {
    if (task.clientName !== clientName) {
      throw new AppError('All tasks in a single bill must belong to the same client.', HTTP_STATUS.BAD_REQUEST);
    }
  }

  // Generate unique Bill Number (e.g., INV-YYYYMMDD-RANDOM)
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const randomStr = crypto.randomBytes(3).toString('hex').toUpperCase();
  const billNumber = `INV-${dateStr}-${randomStr}`;

  // Calculate Total Amount
  const totalAmount = tasks.reduce((sum, task) => sum + Number(task.billAmount), 0);

  // Prepare Bill data
  const billData = {
    billNumber,
    clientName,
    clientEmail,
    totalAmount,
    status: 'DRAFT',
    createdByAdminId: adminId
  };

  // Prepare Bill Items data
  const itemsData = tasks.map(task => ({
    taskId: task.id,
    taskTitle: task.title,
    taskDomain: task.domain,
    clientName: task.clientName,
    amount: task.billAmount,
    remarks: task.billingRemarks
  }));

  const bill = await createBillWithItems(billData, itemsData);
  return bill;
};

export const getAllBills = async (adminId, filters) => {
  return listBills(adminId, filters);
};

export const getBillDetails = async (adminId, billId) => {
  const bill = await getBillById(adminId, billId);
  if (!bill) {
    throw new AppError('Bill not found.', HTTP_STATUS.NOT_FOUND);
  }
  return bill;
};

export const cancelBill = async (adminId, billId) => {
  const bill = await getBillById(adminId, billId);
  if (!bill) {
    throw new AppError('Bill not found.', HTTP_STATUS.NOT_FOUND);
  }
  
  if (bill.status !== 'DRAFT') {
    throw new AppError('Only DRAFT bills can be deleted.', HTTP_STATUS.BAD_REQUEST);
  }

  await deleteBill(adminId, billId);
  return bill;
};

import { generateBillPdf } from '../utils/pdfGenerator.js';
import { sendBillEmail } from '../utils/emailSender.js';

export const emailBillToClient = async (adminId, billId) => {
  let bill = await getBillById(adminId, billId);
  if (!bill) {
    throw new AppError('Bill not found.', HTTP_STATUS.NOT_FOUND);
  }

  if (!bill.clientEmail) {
    throw new AppError('Client email is missing from this bill.', HTTP_STATUS.BAD_REQUEST);
  }

  let pdfPath = bill.pdfUrl ? path.join(BACKEND_ROOT, bill.pdfUrl) : null;

  // Generate PDF if not already generated or if missing from ephemeral storage
  if (!pdfPath || !fs.existsSync(pdfPath)) {
    const pdfUrl = await generateBillPdf(bill);
    bill = await updateBillPdfStatus(bill.id, pdfUrl);
    // Reload bill to ensure pdfUrl is present in memory
    bill = await getBillById(adminId, billId);
  }

  // Send email
  await sendBillEmail(bill);

  // Update status
  const updatedBill = await updateBillEmailStatus(bill.id);
  return updatedBill;
};

import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const BACKEND_ROOT = path.join(__dirname, '../../');

export const getBillPdfPath = async (adminId, billId) => {
  let bill = await getBillById(adminId, billId);
  if (!bill) {
    throw new AppError('Bill not found.', HTTP_STATUS.NOT_FOUND);
  }

  let pdfPath = bill.pdfUrl ? path.join(BACKEND_ROOT, bill.pdfUrl) : null;

  // Generate PDF if not already generated, or if the file was deleted from ephemeral storage
  if (!pdfPath || !fs.existsSync(pdfPath)) {
    const pdfUrl = await generateBillPdf(bill);
    bill = await updateBillPdfStatus(bill.id, pdfUrl);
    bill = await getBillById(adminId, billId);
    pdfPath = path.join(BACKEND_ROOT, bill.pdfUrl);
  }

  return pdfPath;
};
