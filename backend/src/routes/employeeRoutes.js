import { Router } from 'express';

import { login } from '../controllers/employeeAuthController.js';
import { listTasks, markDone, markNotDone } from '../controllers/employeeTaskController.js';
import { authenticate, employeeOnly } from '../middleware/authMiddleware.js';
import { validateRequest, validateMultipartRequest } from '../middleware/validateRequest.js';
import { uploadBillPdf } from '../middleware/fileUpload.js';
import fs from 'fs';
import { asyncHandler } from '../utils/asyncHandler.js';
import { employeeLoginSchema } from '../validators/authValidators.js';
import {
  listEmployeeTasksSchema,
  markTaskDoneSchema,
  markTaskNotDoneSchema
} from '../validators/taskValidators.js';

const router = Router();

router.post('/login', validateRequest(employeeLoginSchema), asyncHandler(login));
router.get(
  '/tasks',
  authenticate,
  employeeOnly,
  validateRequest(listEmployeeTasksSchema),
  asyncHandler(listTasks)
);
router.put(
  '/tasks/:id/done',
  authenticate,
  employeeOnly,
  uploadBillPdf.single('billPdf'),
  async (req, res, next) => {
    try {
      if (req.body.shouldProceedForBilling === 'true') req.body.shouldProceedForBilling = true;
      if (req.body.shouldProceedForBilling === 'false') req.body.shouldProceedForBilling = false;
      const parsed = markTaskDoneSchema.parse({
        params: req.params,
        body: req.body
      });
      req.validated = parsed;
      next();
    } catch (error) {
      if (req.file) fs.unlinkSync(req.file.path); // clean up uploaded file
      next(error);
    }
  },
  asyncHandler(markDone)
);
router.put(
  '/tasks/:id/not-done',
  authenticate,
  employeeOnly,
  validateRequest(markTaskNotDoneSchema),
  asyncHandler(markNotDone)
);

export default router;
