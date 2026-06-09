import { API_MESSAGES } from '../constants/api.js';
import { sendSuccess } from '../utils/apiResponse.js';
import {
  getEligibleTasks,
  createBill,
  createManualBill,
  createClubbedBill,
  updateBillService,
  getAllBills,
  getBillDetails,
  cancelBill,
  emailBillToClient,
  getBillPdfPath
} from '../services/billingService.js';
import {
  listBillingEntities,
  updateBillingEntity
} from '../services/billingEntityService.js';

export const listEligibleTasks = async (req, res) => {
  const tasks = await getEligibleTasks(req.user.id, req.validated.query || {});
  return sendSuccess(res, {
    message: 'Eligible tasks fetched successfully',
    data: { tasks }
  });
};

export const generateBill = async (req, res) => {
  const { taskIds, billingEntityId, billDate, ...extraDetails } = req.validated.body;
  const bill = await createBill(req.user.id, taskIds, billingEntityId, billDate, extraDetails);
  return sendSuccess(res, {
    message: 'Bill created successfully',
    data: { bill }
  });
};

export const generateManualBill = async (req, res) => {
  const bill = await createManualBill(req.user.id, req.validated.body);
  return sendSuccess(res, {
    message: 'Manual bill created successfully',
    data: { bill }
  });
};

export const generateClubbedBill = async (req, res) => {
  const bill = await createClubbedBill(req.user.id, req.validated.body);
  return sendSuccess(res, {
    message: 'Clubbed bill created successfully',
    data: { bill }
  });
};

export const updateBill = async (req, res) => {
  const bill = await updateBillService(req.user.id, req.validated.params.id, req.validated.body);
  return sendSuccess(res, {
    message: 'Bill updated successfully',
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

export const sendEmailForBill = async (req, res) => {
  const bill = await emailBillToClient(req.user.id, req.validated.params.id);
  return sendSuccess(res, {
    message: 'Bill emailed successfully',
    data: { bill }
  });
};

export const viewBillPdf = async (req, res) => {
  const pdfPath = await getBillPdfPath(req.user.id, req.validated.params.id);
  res.sendFile(pdfPath);
};

export const listEntities = async (req, res) => {
  const entities = await listBillingEntities();
  return sendSuccess(res, {
    message: 'Entities fetched successfully',
    data: { entities }
  });
};

export const updateEntity = async (req, res) => {
  const entity = await updateBillingEntity(req.validated.params.id, req.validated.body);
  return sendSuccess(res, {
    message: 'Entity updated successfully',
    data: { entity }
  });
};
