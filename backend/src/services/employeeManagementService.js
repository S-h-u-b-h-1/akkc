import { API_MESSAGES, HTTP_STATUS } from '../constants/api.js';
import { findAdminByUsername } from '../repositories/adminRepository.js';
import {
  createEmployee,
  findEmployeeByAdmin,
  findEmployeeByUsername,
  listEmployeesByAdmin,
  deleteEmployee,
  updateEmployee
} from '../repositories/employeeRepository.js';
import { AppError } from '../utils/appError.js';
import { hashPassword } from '../utils/password.js';

const assertEmployeeExistsForAdmin = async ({ id, adminId }) => {
  const employee = await findEmployeeByAdmin({ id, adminId });

  if (!employee) {
    throw new AppError(API_MESSAGES.EMPLOYEE_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
  }

  return employee;
};

const assertUsernameIsAvailable = async ({ username, currentEmployeeId }) => {
  const [existingAdmin, existingEmployee] = await Promise.all([
    findAdminByUsername(username),
    findEmployeeByUsername(username)
  ]);
  const belongsToCurrentEmployee = existingEmployee?.id === currentEmployeeId;

  if (existingAdmin || (existingEmployee && !belongsToCurrentEmployee)) {
    throw new AppError(API_MESSAGES.USERNAME_ALREADY_EXISTS, HTTP_STATUS.CONFLICT);
  }
};

export const createAdminEmployee = async ({ adminId, payload }) => {
  await assertUsernameIsAvailable({ username: payload.username });

  const passwordHash = await hashPassword(payload.password);
  const employee = await createEmployee({
    username: payload.username,
    passwordHash,
    createdByAdminId: adminId
  });

  return employee;
};

export const listAdminEmployees = async ({ adminId }) => {
  const employees = await listEmployeesByAdmin(adminId);

  return employees;
};

export const updateAdminEmployee = async ({ adminId, employeeId, payload }) => {
  await assertEmployeeExistsForAdmin({ id: employeeId, adminId });

  if (payload.username) {
    await assertUsernameIsAvailable({
      username: payload.username,
      currentEmployeeId: employeeId
    });
  }

  const data = {};

  if (payload.username !== undefined) {
    data.username = payload.username;
  }

  if (payload.password !== undefined) {
    data.passwordHash = await hashPassword(payload.password);
  }

  const employee = await updateEmployee({ id: employeeId, data });

  return employee;
};

export const deleteAdminEmployee = async ({ adminId, employeeId }) => {
  await assertEmployeeExistsForAdmin({ id: employeeId, adminId });

  const employee = await deleteEmployee(employeeId);

  return employee;
};
