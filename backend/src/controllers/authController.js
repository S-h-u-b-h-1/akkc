import { API_MESSAGES } from '../constants/api.js';
import { getCurrentUser } from '../services/authService.js';
import { sendSuccess } from '../utils/apiResponse.js';

export const me = async (req, res) => {
  const user = await getCurrentUser(req.user);

  return sendSuccess(res, {
    message: API_MESSAGES.CURRENT_USER_FETCHED,
    data: { user }
  });
};
