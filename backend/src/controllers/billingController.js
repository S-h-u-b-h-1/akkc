import { API_MESSAGES } from '../constants/api.js';
import { sendSuccess } from '../utils/apiResponse.js';
import {
  getEligibleTasks,
  createBill,
  getAllBills,
  getBillDetails,
  cancelBill
} from '../services/billingService.js';

export const listEligibleTasks = async (req, res) => {
  const tasks = await getEligibleTasks(req.user.id, req.validated.query || {});
  return sendSuccess(res, {
    message: 'Eligible tasks fetched successfully',
    data: { tasks }
  });
};

export const generateBill = async (req, res) => {
  const bill = await createBill(req.user.id, req.validated.body.taskIds);
  return sendSuccess(res, {
    message: 'Bill created successfully',
    data: { bill }
  });
};

export const listBills = async (req, res) => {
  const bills = await getAllBills(req.user.id, req.validated.query || {});
  return sendSuccess(res, {
    message: 'Bills fetched successfully',
    data: { bills }
  });
};

export const getBill = async (req, res) => {
  const bill = await getBillDetails(req.user.id, req.validated.params.id);
  return sendSuccess(res, {
    message: 'Bill details fetched successfully',
    data: { bill }
  });
};

export const deleteBill = async (req, res) => {
  const bill = await cancelBill(req.user.id, req.validated.params.id);
  return sendSuccess(res, {
    message: 'Bill deleted successfully',
    data: { bill }
  });
};

import { emailBillToClient } from '../services/billingService.js';

export const sendEmailForBill = async (req, res) => {
  const bill = await emailBillToClient(req.user.id, req.validated.params.id);
  return sendSuccess(res, {
    message: 'Bill emailed successfully',
    data: { bill }
  });
};
