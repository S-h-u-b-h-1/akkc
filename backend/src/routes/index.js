import { Router } from 'express';

import adminRoutes from './adminRoutes.js';
import authRoutes from './authRoutes.js';
import employeeRoutes from './employeeRoutes.js';
import healthRoutes from './healthRoutes.js';

const router = Router();

router.use('/admin', adminRoutes);
router.use('/employee', employeeRoutes);
router.use('/auth', authRoutes);
router.use('/health', healthRoutes);

export default router;
