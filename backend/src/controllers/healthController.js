import { API_MESSAGES } from '../constants/api.js';
import { sendSuccess } from '../utils/apiResponse.js';

export const getHealth = (_req, res) =>
  sendSuccess(res, {
    message: API_MESSAGES.HEALTH_OK,
    data: {
      service: 'employee-task-management-api',
      uptime: process.uptime(),
      timestamp: new Date().toISOString()
    }
  });
