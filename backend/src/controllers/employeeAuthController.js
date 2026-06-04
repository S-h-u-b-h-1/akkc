import { API_MESSAGES } from '../constants/api.js';
import { loginEmployee } from '../services/authService.js';
import { sendSuccess } from '../utils/apiResponse.js';

export const login = async (req, res) => {
  const result = await loginEmployee(req.validated.body);

  return sendSuccess(res, {
    message: API_MESSAGES.LOGIN_SUCCESS,
    data: result
  });
};
