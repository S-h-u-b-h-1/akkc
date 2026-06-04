import { API_MESSAGES, HTTP_STATUS } from '../constants/api.js';
import { loginAdmin, signupAdmin } from '../services/authService.js';
import { sendSuccess } from '../utils/apiResponse.js';

export const signup = async (req, res) => {
  const result = await signupAdmin(req.validated.body);

  return sendSuccess(res, {
    statusCode: HTTP_STATUS.CREATED,
    message: API_MESSAGES.ADMIN_CREATED,
    data: result
  });
};

export const login = async (req, res) => {
  const result = await loginAdmin(req.validated.body);

  return sendSuccess(res, {
    message: API_MESSAGES.LOGIN_SUCCESS,
    data: result
  });
};
