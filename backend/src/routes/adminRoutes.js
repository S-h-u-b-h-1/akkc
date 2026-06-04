import { Router } from 'express';

import {
  createEmployee,
  deleteEmployee,
  listEmployees,
  updateEmployee
} from '../controllers/adminEmployeeController.js';
import { login, signup } from '../controllers/adminAuthController.js';
import { adminOnly, authenticate } from '../middleware/authMiddleware.js';
import { validateRequest } from '../middleware/validateRequest.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { adminSignupSchema, loginSchema } from '../validators/authValidators.js';
import {
  createEmployeeSchema,
  employeeIdParamSchema,
  listEmployeesSchema,
  updateEmployeeSchema
} from '../validators/employeeValidators.js';

const router = Router();

router.post('/signup', validateRequest(adminSignupSchema), asyncHandler(signup));
router.post('/login', validateRequest(loginSchema), asyncHandler(login));
router.post(
  '/employees',
  authenticate,
  adminOnly,
  validateRequest(createEmployeeSchema),
  asyncHandler(createEmployee)
);
router.get(
  '/employees',
  authenticate,
  adminOnly,
  validateRequest(listEmployeesSchema),
  asyncHandler(listEmployees)
);
router.put(
  '/employees/:id',
  authenticate,
  adminOnly,
  validateRequest(updateEmployeeSchema),
  asyncHandler(updateEmployee)
);
router.delete(
  '/employees/:id',
  authenticate,
  adminOnly,
  validateRequest(employeeIdParamSchema),
  asyncHandler(deleteEmployee)
);

export default router;
