import { HTTP_STATUS } from '../constants/api.js';

export const sendSuccess = (
  res,
  { statusCode = HTTP_STATUS.OK, message = 'Success.', data = null, meta } = {}
) => {
  const payload = {
    success: true,
    message,
    data
  };

  if (meta !== undefined) {
    payload.meta = meta;
  }

  return res.status(statusCode).json(payload);
};
