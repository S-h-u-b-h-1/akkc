import { Router } from 'express';

import {
  createEmployee,
  deleteEmployee,
  listEmployees,
  updateEmployee
} from '../controllers/adminEmployeeController.js';
import { login } from '../controllers/adminAuthController.js';
import {
  createAdmin,
  deleteAdmin,
  listAdmins,
  updateAdmin
} from '../controllers/adminManagementController.js';
import {
  createTask,
  deleteTask,
  getStats,
  getTask,
  listTasks,
  updateTask
} from '../controllers/adminTaskController.js';
import { adminOnly, authenticate } from '../middleware/authMiddleware.js';
import { validateRequest } from '../middleware/validateRequest.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { loginSchema } from '../validators/authValidators.js';
import {
  adminIdParamSchema,
  createAdminSchema,
  listAdminsSchema,
  updateAdminSchema
} from '../validators/adminValidators.js';
import {
  createEmployeeSchema,
  employeeIdParamSchema,
  listEmployeesSchema,
  updateEmployeeSchema
} from '../validators/employeeValidators.js';
import {
  createTaskSchema,
  listTasksSchema,
  taskIdParamSchema,
  updateTaskSchema
} from '../validators/taskValidators.js';


const router = Router();

router.post('/login', validateRequest(loginSchema), asyncHandler(login));
router.post(
  '/admins',
  authenticate,
  adminOnly,
  validateRequest(createAdminSchema),
  asyncHandler(createAdmin)
);
router.get(
  '/admins',
  authenticate,
  adminOnly,
  validateRequest(listAdminsSchema),
  asyncHandler(listAdmins)
);
router.put(
  '/admins/:id',
  authenticate,
  adminOnly,
  validateRequest(updateAdminSchema),
  asyncHandler(updateAdmin)
);
router.delete(
  '/admins/:id',
  authenticate,
  adminOnly,
  validateRequest(adminIdParamSchema),
  asyncHandler(deleteAdmin)
);

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
router.post(
  '/tasks',
  authenticate,
  adminOnly,
  validateRequest(createTaskSchema),
  asyncHandler(createTask)
);
router.get(
  '/tasks',
  authenticate,
  adminOnly,
  validateRequest(listTasksSchema),
  asyncHandler(listTasks)
);
router.get(
  '/tasks/:id',
  authenticate,
  adminOnly,
  validateRequest(taskIdParamSchema),
  asyncHandler(getTask)
);
router.put(
  '/tasks/:id',
  authenticate,
  adminOnly,
  validateRequest(updateTaskSchema),
  asyncHandler(updateTask)
);
router.delete(
  '/tasks/:id',
  authenticate,
  adminOnly,
  validateRequest(taskIdParamSchema),
  asyncHandler(deleteTask)
);
router.get(
  '/stats',
  authenticate,
  adminOnly,
  validateRequest(listTasksSchema),
  asyncHandler(getStats)
);

export default router;
