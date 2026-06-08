import { env } from '../config/env.js';
import { API_MESSAGES, HTTP_STATUS } from '../constants/api.js';

export const errorHandler = (error, _req, res, _next) => {
  const statusCode = error.statusCode ?? HTTP_STATUS.INTERNAL_SERVER_ERROR;
  const message = error.isOperational ? error.message : API_MESSAGES.INTERNAL_SERVER_ERROR;
  const payload = {
    success: false,
    message
  };

  if (error.errors) {
    payload.errors = error.errors;
  }

  if (env.nodeEnv !== 'production') {
    payload.stack = error.stack;
  }

  if (!error.isOperational) {
    console.error(error);
  }

  return res.status(statusCode).json(payload);
};
