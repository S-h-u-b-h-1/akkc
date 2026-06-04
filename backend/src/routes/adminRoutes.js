import { Router } from 'express';

import { login, signup } from '../controllers/adminAuthController.js';
import { validateRequest } from '../middleware/validateRequest.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { adminSignupSchema, loginSchema } from '../validators/authValidators.js';

const router = Router();

router.post('/signup', validateRequest(adminSignupSchema), asyncHandler(signup));
router.post('/login', validateRequest(loginSchema), asyncHandler(login));

export default router;
