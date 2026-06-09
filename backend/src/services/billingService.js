import { AppError } from '../utils/appError.js';
import { HTTP_STATUS } from '../constants/api.js';
import {
  listEligibleTasksForBilling,
  getTasksByIds,
  createBillWithTransaction,
  createClubbedBillWithTransaction,
  listBills,
  getBillById,
  updateBill,
  updateBillItemsWithTransaction,
  deleteBill,
  updateBillPdfStatus,
  updateBillEmailStatus
} from '../repositories/billingRepository.js';

export const getEligibleTasks = async (adminId, filters) => {
  return listEligibleTasksForBilling(adminId, filters);
};

export const createBill = async (adminId, taskIds, billingEntityId, billDate, extraDetails = {}) => {
  if (!billingEntityId) {
    throw new AppError('Billing entity ID is required.', HTTP_STATUS.BAD_REQUEST);
  }

  const tasks = await getTasksByIds(adminId, taskIds);
  
  if (tasks.length !== taskIds.length) {
    throw new AppError('One or more tasks are invalid or not eligible for billing.', HTTP_STATUS.BAD_REQUEST);
  }

  const clientName = tasks[0].clientName;
  const clientEmail = tasks[0].clientEmail;

  for (const task of tasks) {
    if (task.clientName !== clientName) {
      throw new AppError('All tasks in a single bill must belong to the same client.', HTTP_STATUS.BAD_REQUEST);
    }
  }

  const totalAmount = tasks.reduce((sum, task) => sum + Number(task.billAmount), 0);

  const billData = {
    billingEntityId,
    sourceType: 'TASK_BASED',
    billDate: billDate ? new Date(billDate) : new Date(),
    clientName,
    clientEmail,
    totalAmount,
    status: 'DRAFT',
    createdByAdminId: adminId,
    clientDetails: extraDetails.clientDetails,
    invoiceDetails: extraDetails.invoiceDetails,
    taxDetails: extraDetails.taxDetails
  };

  const itemsData = tasks.map(task => ({
    taskId: task.id,
    taskTitle: task.title,
    taskDomain: task.domain,
    clientName: task.clientName,
    amount: task.billAmount,
    quantity: 1,
    remarks: task.billingRemarks
  }));

  return createBillWithTransaction(billData, itemsData);
};

export const createManualBill = async (adminId, data) => {
  const { billingEntityId, billDate, clientName, clientEmail, notes, items, clientDetails, invoiceDetails, taxDetails } = data;

  if (!billingEntityId || !clientName || !items || !items.length) {
    throw new AppError('Billing entity, client name, and at least one item are required.', HTTP_STATUS.BAD_REQUEST);
  }

  const totalAmount = items.reduce((sum, item) => sum + (Number(item.amount) * (Number(item.quantity) || 1)), 0);

  const billData = {
    billingEntityId,
    sourceType: 'MANUAL',
    billDate: billDate ? new Date(billDate) : new Date(),
    clientName,
    clientEmail,
    totalAmount,
    notes,
    status: 'DRAFT',
    createdByAdminId: adminId,
    clientDetails,
    invoiceDetails,
    taxDetails
  };

  const itemsData = items.map(item => ({
    taskTitle: item.taskTitle,
    taskDomain: item.taskDomain || 'General',
    clientName: clientName,
    amount: item.amount,
    quantity: item.quantity || 1,
    rate: item.rate,
    per: item.per,
    hsnSac: item.hsnSac,
    remarks: item.remarks
  }));

  return createBillWithTransaction(billData, itemsData);
};

export const createClubbedBill = async (adminId, data) => {
  const { billingEntityId, billDate, billIds, notes, clientDetails, invoiceDetails, taxDetails } = data;

  if (!billingEntityId || !billIds || billIds.length < 2) {
    throw new AppError('Billing entity and at least two bills are required to club.', HTTP_STATUS.BAD_REQUEST);
  }

  const bills = [];
  for (const id of billIds) {
    const b = await getBillById(adminId, id);
    if (!b) throw new AppError(`Bill ${id} not found.`, HTTP_STATUS.NOT_FOUND);
    if (b.clubbedIntoId) throw new AppError(`Bill ${b.billNumber} is already clubbed.`, HTTP_STATUS.BAD_REQUEST);
    bills.push(b);
  }

  const clientName = bills[0].clientName;
  const clientEmail = bills[0].clientEmail;
  for (const b of bills) {
    if (b.clientName !== clientName) {
      throw new AppError('All bills to be clubbed must belong to the same client.', HTTP_STATUS.BAD_REQUEST);
    }
  }

  const totalAmount = bills.reduce((sum, b) => sum + Number(b.totalAmount), 0);

  const billData = {
    billingEntityId,
    sourceType: 'CLUBBED',
    billDate: billDate ? new Date(billDate) : new Date(),
    clientName,
    clientEmail,
    totalAmount,
    notes,
    status: 'DRAFT',
    createdByAdminId: adminId,
    clientDetails,
    invoiceDetails,
    taxDetails
  };

  const itemsData = bills.flatMap(b => b.items.map(item => ({
    taskId: item.taskId,
    taskTitle: item.taskTitle,
    taskDomain: item.taskDomain,
    clientName: item.clientName,
    amount: item.amount,
    quantity: item.quantity,
    rate: item.rate,
    per: item.per,
    hsnSac: item.hsnSac,
    remarks: item.remarks
  })));

  return createClubbedBillWithTransaction(billData, itemsData, billIds);
};

export const updateBillService = async (adminId, billId, data) => {
  const bill = await getBillById(adminId, billId);
  if (!bill) {
    throw new AppError('Bill not found.', HTTP_STATUS.NOT_FOUND);
  }

  if (bill.status === 'EMAILED') {
    throw new AppError('Cannot modify an emailed bill.', HTTP_STATUS.BAD_REQUEST);
  }

  const { items, ...billData } = data;
  
  if (items && items.length > 0 && bill.sourceType === 'MANUAL') {
    const totalAmount = items.reduce((sum, item) => sum + (Number(item.amount) * (Number(item.quantity) || 1)), 0);
    billData.totalAmount = totalAmount;

    const itemsData = items.map(item => ({
      taskTitle: item.taskTitle,
      taskDomain: item.taskDomain || 'General',
      clientName: billData.clientName || bill.clientName,
      amount: item.amount,
      quantity: item.quantity || 1,
      rate: item.rate,
      per: item.per,
      hsnSac: item.hsnSac,
      remarks: item.remarks
    }));

    await updateBillItemsWithTransaction(billId, itemsData);
  }

  // Clear the generated PDF so it gets regenerated with new details
  // Only do this if it's NOT an uploaded PDF
  if (!bill.pdfUrl || !bill.pdfUrl.includes('UPLOAD-')) {
    billData.pdfUrl = null;
  }

  return updateBill(billId, billData);
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
  
  if (bill.status === 'EMAILED') {
    throw new AppError('Cannot delete an emailed bill.', HTTP_STATUS.BAD_REQUEST);
  }

  await deleteBill(adminId, billId);
  return bill;
};

import { generateBillPdf } from '../utils/pdfGenerator.js';
import { sendBillEmail } from '../utils/emailSender.js';

export const emailBillToClient = async (adminId, billId) => {
  let bill = await getBillById(adminId, billId);
  if (!bill) throw new AppError('Bill not found.', HTTP_STATUS.NOT_FOUND);
  if (!bill.clientEmail) throw new AppError('Client email is missing.', HTTP_STATUS.BAD_REQUEST);

  let pdfPath = bill.pdfUrl ? path.join(BACKEND_ROOT, bill.pdfUrl) : null;

  if (!pdfPath || !fs.existsSync(pdfPath)) {
    const pdfUrl = await generateBillPdf(bill);
    bill = await updateBillPdfStatus(bill.id, pdfUrl);
    bill = await getBillById(adminId, billId);
  }

  await sendBillEmail(bill);
  return updateBillEmailStatus(bill.id);
};

import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const BACKEND_ROOT = path.join(__dirname, '../../');

export const getBillPdfPath = async (adminId, billId) => {
  let bill = await getBillById(adminId, billId);
  if (!bill) throw new AppError('Bill not found.', HTTP_STATUS.NOT_FOUND);

  let pdfPath = bill.pdfUrl ? path.join(BACKEND_ROOT, bill.pdfUrl) : null;

  if (!pdfPath || !fs.existsSync(pdfPath)) {
    // If this bill was uploaded by an employee, we cannot regenerate it
    if (bill.pdfUrl && bill.pdfUrl.includes('UPLOAD-')) {
      throw new AppError('The uploaded PDF for this bill is missing from the server (likely due to an ephemeral storage wipe). Please re-upload it.', HTTP_STATUS.NOT_FOUND);
    }

    const pdfUrl = await generateBillPdf(bill);
    bill = await updateBillPdfStatus(bill.id, pdfUrl);
    bill = await getBillById(adminId, billId);
    pdfPath = path.join(BACKEND_ROOT, bill.pdfUrl);
  }

  return pdfPath;
};
