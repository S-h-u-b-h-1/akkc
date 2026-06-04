import { API_MESSAGES, HTTP_STATUS } from '../constants/api.js';
import { AppError } from '../utils/appError.js';

const formatZodError = (error) =>
  error.issues.map((issue) => ({
    field: issue.path.join('.'),
    message: issue.message
  }));

export const validateRequest = (schema) => (req, _res, next) => {
  const result = schema.safeParse({
    body: req.body,
    params: req.params,
    query: req.query
  });

  if (!result.success) {
    return next(
      new AppError(
        API_MESSAGES.VALIDATION_FAILED,
        HTTP_STATUS.BAD_REQUEST,
        formatZodError(result.error)
      )
    );
  }

  req.validated = result.data;
  return next();
};
