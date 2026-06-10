import { API_MESSAGES, HTTP_STATUS } from '../constants/api.js';
import {
  createAdminAccount,
  deleteAdminAccount,
  listAdminAccounts,
  updateAdminAccount
} from '../services/adminManagementService.js';
import { logAdminActivity, getAdminLogs as fetchAdminLogs } from '../services/adminLogService.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { AppError } from '../utils/appError.js';

const requireSuperAdmin = async (userId) => {
  const admins = await listAdminAccounts();
  const admin = admins.find(a => a.id === userId);
  
  if (!admin || admin.username !== 'admin') {
    throw new AppError('Only the default super-admin can perform this action.', HTTP_STATUS.FORBIDDEN);
  }
};

export const getAdminLogs = async (req, res) => {
  await requireSuperAdmin(req.user.id);
  const logs = await fetchAdminLogs();
  
  return sendSuccess(res, {
    message: 'Admin logs fetched successfully',
    data: { logs }
  });
};

export const createAdmin = async (req, res) => {
  await requireSuperAdmin(req.user.id);

  const admin = await createAdminAccount({
    currentAdminId: req.user.id,
    payload: req.validated.body
  });

  await logAdminActivity({
    adminId: req.user.id,
    action: 'CREATE_ADMIN',
    entity: 'Admin',
    entityId: admin.id,
    details: { username: admin.username }
  });

  return sendSuccess(res, {
    statusCode: HTTP_STATUS.CREATED,
    message: API_MESSAGES.ADMIN_CREATED,
    data: { admin }
  });
};

export const listAdmins = async (req, res) => {
  await requireSuperAdmin(req.user.id);

  const admins = await listAdminAccounts();

  return sendSuccess(res, {
    message: API_MESSAGES.ADMINS_FETCHED,
    data: { admins }
  });
};

export const updateAdmin = async (req, res) => {
  await requireSuperAdmin(req.user.id);

  const admin = await updateAdminAccount({
    adminId: req.validated.params.id,
    payload: req.validated.body
  });

  await logAdminActivity({
    adminId: req.user.id,
    action: 'UPDATE_ADMIN',
    entity: 'Admin',
    entityId: admin.id,
    details: { updatedFields: Object.keys(req.validated.body) }
  });

  return sendSuccess(res, {
    message: API_MESSAGES.ADMIN_UPDATED,
    data: { admin }
  });
};

export const deleteAdmin = async (req, res) => {
  await requireSuperAdmin(req.user.id);

  const admin = await deleteAdminAccount({
    currentAdminId: req.user.id,
    adminId: req.validated.params.id
  });

  await logAdminActivity({
    adminId: req.user.id,
    action: 'DELETE_ADMIN',
    entity: 'Admin',
    entityId: admin.id,
    details: { username: admin.username }
  });

  return sendSuccess(res, {
    message: API_MESSAGES.ADMIN_DELETED,
    data: { admin }
  });
};
