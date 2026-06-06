import { API_MESSAGES, HTTP_STATUS } from '../constants/api.js';
import { findAdminByEmail } from '../repositories/adminRepository.js';
import {
  createEmployee,
  findActiveEmployeeByAdmin,
  findEmployeeByEmail,
  findEmployeeByUsername,
  listActiveEmployeesByAdmin,
  softDeleteEmployee,
  updateEmployee
} from '../repositories/employeeRepository.js';
import { AppError } from '../utils/appError.js';
import { hashPassword } from '../utils/password.js';

const normalizeDepartment = ({ department, domain, practiceArea }) => {
  if (department !== undefined) {
    return department;
  }

  if (practiceArea !== undefined) {
    return practiceArea;
  }

  if (domain !== undefined) {
    return domain;
  }

  return undefined;
};

const sanitizeEmployee = (employee) => {
  const sanitizedEmployee = { ...employee };
  delete sanitizedEmployee.deletedAt;
  return sanitizedEmployee;
};

const assertEmployeeExistsForAdmin = async ({ id, adminId }) => {
  const employee = await findActiveEmployeeByAdmin({ id, adminId });

  if (!employee) {
    throw new AppError(API_MESSAGES.EMPLOYEE_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
  }

  return employee;
};

const assertEmailIsAvailable = async ({ email, currentEmployeeId }) => {
  if (!email) {
    return;
  }

  const [existingAdmin, existingEmployee] = await Promise.all([
    findAdminByEmail(email),
    findEmployeeByEmail(email)
  ]);

  const belongsToCurrentEmployee = existingEmployee?.id === currentEmployeeId;

  if (existingAdmin || (existingEmployee && !belongsToCurrentEmployee)) {
    throw new AppError(API_MESSAGES.EMAIL_ALREADY_EXISTS, HTTP_STATUS.CONFLICT);
  }
};

const assertUsernameIsAvailable = async ({ username, currentEmployeeId }) => {
  const existingEmployee = await findEmployeeByUsername(username);
  const belongsToCurrentEmployee = existingEmployee?.id === currentEmployeeId;

  if (existingEmployee && !belongsToCurrentEmployee) {
    throw new AppError(API_MESSAGES.USERNAME_ALREADY_EXISTS, HTTP_STATUS.CONFLICT);
  }
};

export const createAdminEmployee = async ({ adminId, payload }) => {
  await assertUsernameIsAvailable({ username: payload.username });
  await assertEmailIsAvailable({ email: payload.email });

  const passwordHash = await hashPassword(payload.password);
  const employee = await createEmployee({
    name: payload.name,
    username: payload.username,
    email: payload.email ?? null,
    passwordHash,
    department: normalizeDepartment(payload) ?? null,
    createdByAdminId: adminId
  });

  return sanitizeEmployee(employee);
};

export const listAdminEmployees = async ({ adminId }) => {
  const employees = await listActiveEmployeesByAdmin(adminId);

  return employees.map(sanitizeEmployee);
};

export const updateAdminEmployee = async ({ adminId, employeeId, payload }) => {
  await assertEmployeeExistsForAdmin({ id: employeeId, adminId });

  if (payload.username) {
    await assertUsernameIsAvailable({
      username: payload.username,
      currentEmployeeId: employeeId
    });
  }

  if (payload.email !== undefined) {
    await assertEmailIsAvailable({
      email: payload.email,
      currentEmployeeId: employeeId
    });
  }

  const data = {};
  const normalizedDepartment = normalizeDepartment(payload);

  if (payload.name !== undefined) {
    data.name = payload.name;
  }

  if (payload.username !== undefined) {
    data.username = payload.username;
  }

  if (payload.email !== undefined) {
    data.email = payload.email;
  }

  if (payload.password !== undefined) {
    data.passwordHash = await hashPassword(payload.password);
  }

  if (normalizedDepartment !== undefined) {
    data.department = normalizedDepartment;
  }

  const employee = await updateEmployee({ id: employeeId, data });

  return sanitizeEmployee(employee);
};

export const deleteAdminEmployee = async ({ adminId, employeeId }) => {
  await assertEmployeeExistsForAdmin({ id: employeeId, adminId });

  const employee = await softDeleteEmployee(employeeId);

  return sanitizeEmployee(employee);
};
