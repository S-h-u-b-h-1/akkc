import { API_MESSAGES } from '../constants/api.js';
import {
  listArchivedAdminAccounts,
  listArchivedEmployeeAccounts,
  permanentlyDeleteAdminAccount,
  permanentlyDeleteEmployeeAccount
} from '../services/dataMaintenanceService.js';
import { sendSuccess } from '../utils/apiResponse.js';

export const listArchivedAdmins = async (_req, res) => {
  const admins = await listArchivedAdminAccounts();

  return sendSuccess(res, {
    message: API_MESSAGES.ARCHIVED_ADMINS_FETCHED,
    data: { admins }
  });
};

export const permanentlyDeleteAdmin = async (req, res) => {
  const admin = await permanentlyDeleteAdminAccount({
    currentAdminId: req.user.id,
    adminId: req.validated.params.id
  });

  return sendSuccess(res, {
    message: API_MESSAGES.ADMIN_PERMANENTLY_DELETED,
    data: { admin }
  });
};

export const listArchivedEmployees = async (req, res) => {
  const employees = await listArchivedEmployeeAccounts({ adminId: req.user.id });

  return sendSuccess(res, {
    message: API_MESSAGES.ARCHIVED_EMPLOYEES_FETCHED,
    data: { employees }
  });
};

export const permanentlyDeleteEmployee = async (req, res) => {
  const employee = await permanentlyDeleteEmployeeAccount({
    adminId: req.user.id,
    employeeId: req.validated.params.id
  });

  return sendSuccess(res, {
    message: API_MESSAGES.EMPLOYEE_PERMANENTLY_DELETED,
    data: { employee }
  });
};
