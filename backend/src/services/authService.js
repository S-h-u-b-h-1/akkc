import { API_MESSAGES, HTTP_STATUS, USER_ROLES } from '../constants/api.js';
import { findAdminById, findAdminByUsername } from '../repositories/adminRepository.js';
import {
  findEmployeeById,
  findEmployeeByUsername
} from '../repositories/employeeRepository.js';
import { AppError } from '../utils/appError.js';
import { verifyPassword } from '../utils/password.js';
import { signAuthToken } from '../utils/token.js';

const buildAuthResponse = ({ user, role }) => ({
  token: signAuthToken({ id: user.id, role }),
  user: {
    ...user,
    role
  }
});

export const loginAdmin = async ({ username, password }) => {
  const admin = await findAdminByUsername(username);

  if (!admin || admin.deletedAt || !(await verifyPassword(password, admin.passwordHash))) {
    throw new AppError(API_MESSAGES.INVALID_CREDENTIALS, HTTP_STATUS.UNAUTHORIZED);
  }

  return buildAuthResponse({
    user: {
      id: admin.id,
      username: admin.username,
      createdAt: admin.createdAt,
      updatedAt: admin.updatedAt
    },
    role: USER_ROLES.ADMIN
  });
};

export const loginEmployee = async ({ username, password }) => {
  const employee = await findEmployeeByUsername(username);

  if (!employee || employee.deletedAt || !(await verifyPassword(password, employee.passwordHash))) {
    throw new AppError(API_MESSAGES.INVALID_CREDENTIALS, HTTP_STATUS.UNAUTHORIZED);
  }

  return buildAuthResponse({
    user: {
      id: employee.id,
      username: employee.username,
      createdByAdminId: employee.createdByAdminId,
      createdAt: employee.createdAt,
      updatedAt: employee.updatedAt
    },
    role: USER_ROLES.EMPLOYEE
  });
};

export const getCurrentUser = async ({ id, role }) => {
  if (role === USER_ROLES.ADMIN) {
    const admin = await findAdminById(id);

    if (!admin || admin.deletedAt) {
      throw new AppError(API_MESSAGES.USER_NOT_FOUND, HTTP_STATUS.UNAUTHORIZED);
    }

    const activeAdmin = { ...admin };
    delete activeAdmin.deletedAt;

    return {
      ...activeAdmin,
      role
    };
  }

  if (role === USER_ROLES.EMPLOYEE) {
    const employee = await findEmployeeById(id);

    if (!employee || employee.deletedAt) {
      throw new AppError(API_MESSAGES.USER_NOT_FOUND, HTTP_STATUS.UNAUTHORIZED);
    }

    const activeEmployee = { ...employee };
    delete activeEmployee.deletedAt;

    return {
      ...activeEmployee,
      role
    };
  }

  throw new AppError(API_MESSAGES.UNAUTHORIZED, HTTP_STATUS.UNAUTHORIZED);
};
