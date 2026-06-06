import { API_MESSAGES } from '../constants/api.js';
import { loginAdmin } from '../services/authService.js';
import { sendSuccess } from '../utils/apiResponse.js';

export const login = async (req, res) => {
  const result = await loginAdmin(req.validated.body);

  return sendSuccess(res, {
    message: API_MESSAGES.LOGIN_SUCCESS,
    data: result
  });
};
