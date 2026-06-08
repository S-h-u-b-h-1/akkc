import { Router } from 'express';

import {
  listEligibleTasks,
  generateBill,
  listBills,
  getBill,
  deleteBill,
  sendEmailForBill,
  viewBillPdf
} from '../controllers/billingController.js';
import { adminOnly, authenticate } from '../middleware/authMiddleware.js';
import { validateRequest } from '../middleware/validateRequest.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import {
  listEligibleTasksSchema,
  createBillSchema,
  listBillsSchema,
  billIdParamSchema
} from '../validators/billingValidators.js';

const router = Router();

router.use(authenticate, adminOnly);

router.get(
  '/eligible-tasks',
  validateRequest(listEligibleTasksSchema),
  asyncHandler(listEligibleTasks)
);

router.post(
  '/bills',
  validateRequest(createBillSchema),
  asyncHandler(generateBill)
);

router.get(
  '/bills',
  validateRequest(listBillsSchema),
  asyncHandler(listBills)
);

router.get(
  '/bills/:id',
  validateRequest(billIdParamSchema),
  asyncHandler(getBill)
);

router.delete(
  '/bills/:id',
  validateRequest(billIdParamSchema),
  asyncHandler(deleteBill)
);

router.get(
  '/bills/:id/pdf',
  validateRequest(billIdParamSchema),
  asyncHandler(viewBillPdf)
);

router.post(
  '/bills/:id/send-email',
  validateRequest(billIdParamSchema),
  asyncHandler(sendEmailForBill)
);

export default router;
