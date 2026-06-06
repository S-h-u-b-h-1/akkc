import { Router } from 'express';

import { login } from '../controllers/employeeAuthController.js';
import { listTasks, markDone, markNotDone } from '../controllers/employeeTaskController.js';
import { authenticate, employeeOnly } from '../middleware/authMiddleware.js';
import { validateRequest } from '../middleware/validateRequest.js';
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
  validateRequest(markTaskDoneSchema),
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
