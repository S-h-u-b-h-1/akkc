import jwt from 'jsonwebtoken';

import { env } from '../config/env.js';
import { API_MESSAGES, HTTP_STATUS } from '../constants/api.js';
import { AppError } from '../utils/appError.js';

export const authenticate = (req, _res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    return next(new AppError(API_MESSAGES.UNAUTHORIZED, HTTP_STATUS.UNAUTHORIZED));
  }

  const token = authHeader.split(' ')[1];

  try {
    req.user = jwt.verify(token, env.jwtSecret);
    return next();
  } catch {
    return next(new AppError(API_MESSAGES.UNAUTHORIZED, HTTP_STATUS.UNAUTHORIZED));
  }
};

export const authorizeRoles =
  (...allowedRoles) =>
  (req, _res, next) => {
    if (!req.user?.role || !allowedRoles.includes(req.user.role)) {
      return next(new AppError(API_MESSAGES.FORBIDDEN, HTTP_STATUS.FORBIDDEN));
    }

    return next();
  };
