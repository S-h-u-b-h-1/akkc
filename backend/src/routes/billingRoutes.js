import { Router } from 'express';

import {
  listEligibleTasks,
  generateBill,
  generateManualBill,
  generateClubbedBill,
  updateBill,
  listBills,
  getBill,
  deleteBill,
  sendEmailForBill,
  viewBillPdf,
  listEntities,
  updateEntity
} from '../controllers/billingController.js';
import { adminOnly, authenticate } from '../middleware/authMiddleware.js';
import { validateRequest } from '../middleware/validateRequest.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import {
  listEligibleTasksSchema,
  createBillSchema,
  createManualBillSchema,
  createClubbedBillSchema,
  updateBillSchema,
  listBillsSchema,
  billIdParamSchema
} from '../validators/billingValidators.js';

import { z } from 'zod';

const router = Router();

router.use(authenticate, adminOnly);

router.get('/entities', asyncHandler(listEntities));
router.put('/entities/:id', validateRequest(z.object({
  params: z.object({ id: z.string().uuid() }),
  body: z.object({
    name: z.string().trim().min(1).max(120).optional(),
    code: z.string().trim().min(1).max(20).optional(),
    email: z.string().email().optional(),
    phone: z.string().optional().nullable(),
    address: z.string().optional().nullable(),
    gstNumber: z.string().optional().nullable(),
    panNumber: z.string().optional().nullable(),
    bankName: z.string().optional().nullable(),
    bankAccountNumber: z.string().optional().nullable(),
    ifscCode: z.string().optional().nullable()
  })
})), asyncHandler(updateEntity));

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

router.post(
  '/bills/manual',
  validateRequest(createManualBillSchema),
  asyncHandler(generateManualBill)
);

router.post(
  '/bills/clubbed',
  validateRequest(createClubbedBillSchema),
  asyncHandler(generateClubbedBill)
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

router.put(
  '/bills/:id',
  validateRequest(updateBillSchema),
  asyncHandler(updateBill)
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
