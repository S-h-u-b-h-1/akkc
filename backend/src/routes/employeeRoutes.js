import { Router } from 'express';

import { login } from '../controllers/employeeAuthController.js';
import { validateRequest } from '../middleware/validateRequest.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { loginSchema } from '../validators/authValidators.js';

const router = Router();

router.post('/login', validateRequest(loginSchema), asyncHandler(login));

export default router;
