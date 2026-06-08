import { API_MESSAGES, HTTP_STATUS } from '../constants/api.js';
import {
  createAdminAccount,
  deleteAdminAccount,
  listAdminAccounts,
  updateAdminAccount
} from '../services/adminManagementService.js';
import { sendSuccess } from '../utils/apiResponse.js';

export const createAdmin = async (req, res) => {
  const admin = await createAdminAccount({
    currentAdminId: req.user.id,
    payload: req.validated.body
  });

  return sendSuccess(res, {
    statusCode: HTTP_STATUS.CREATED,
    message: API_MESSAGES.ADMIN_CREATED,
    data: { admin }
  });
};

export const listAdmins = async (_req, res) => {
  const admins = await listAdminAccounts();

  return sendSuccess(res, {
    message: API_MESSAGES.ADMINS_FETCHED,
    data: { admins }
  });
};

export const updateAdmin = async (req, res) => {
  const admin = await updateAdminAccount({
    adminId: req.validated.params.id,
    payload: req.validated.body
  });

  return sendSuccess(res, {
    message: API_MESSAGES.ADMIN_UPDATED,
    data: { admin }
  });
};

export const deleteAdmin = async (req, res) => {
  const admin = await deleteAdminAccount({
    currentAdminId: req.user.id,
    adminId: req.validated.params.id
  });

  return sendSuccess(res, {
    message: API_MESSAGES.ADMIN_DELETED,
    data: { admin }
  });
};
