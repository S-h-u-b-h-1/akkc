import { API_MESSAGES, HTTP_STATUS } from '../constants/api.js';
import {
  createAdminEmployee,
  deleteAdminEmployee,
  listAdminEmployees,
  updateAdminEmployee
} from '../services/employeeManagementService.js';
import { sendSuccess } from '../utils/apiResponse.js';

export const createEmployee = async (req, res) => {
  const employee = await createAdminEmployee({
    adminId: req.user.id,
    payload: req.validated.body
  });

  return sendSuccess(res, {
    statusCode: HTTP_STATUS.CREATED,
    message: API_MESSAGES.EMPLOYEE_CREATED,
    data: { employee }
  });
};

export const listEmployees = async (req, res) => {
  const employees = await listAdminEmployees();

  return sendSuccess(res, {
    message: API_MESSAGES.EMPLOYEES_FETCHED,
    data: { employees }
  });
};

export const updateEmployee = async (req, res) => {
  const employee = await updateAdminEmployee({
    employeeId: req.validated.params.id,
    payload: req.validated.body
  });

  return sendSuccess(res, {
    message: API_MESSAGES.EMPLOYEE_UPDATED,
    data: { employee }
  });
};

export const deleteEmployee = async (req, res) => {
  const employee = await deleteAdminEmployee({
    employeeId: req.validated.params.id
  });

  return sendSuccess(res, {
    message: API_MESSAGES.EMPLOYEE_DELETED,
    data: { employee }
  });
};
