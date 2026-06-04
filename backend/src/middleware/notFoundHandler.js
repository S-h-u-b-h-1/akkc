import { API_MESSAGES, HTTP_STATUS } from '../constants/api.js';
import { AppError } from '../utils/appError.js';

export const notFoundHandler = (req, _res, next) =>
  next(new AppError(`${API_MESSAGES.ROUTE_NOT_FOUND}: ${req.originalUrl}`, HTTP_STATUS.NOT_FOUND));
