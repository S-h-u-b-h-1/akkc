import { API_MESSAGES, HTTP_STATUS, USER_ROLES } from '../constants/api.js';
import { createAdmin, findAdminByEmail, findAdminById } from '../repositories/adminRepository.js';
import { findEmployeeByEmail, findEmployeeById } from '../repositories/employeeRepository.js';
import { AppError } from '../utils/appError.js';
import { hashPassword, verifyPassword } from '../utils/password.js';
import { signAuthToken } from '../utils/token.js';

const buildAuthResponse = ({ user, role }) => ({
  token: signAuthToken({ id: user.id, role }),
  user: {
    ...user,
    role
  }
});

const assertEmailIsAvailable = async (email) => {
  const [existingAdmin, existingEmployee] = await Promise.all([
    findAdminByEmail(email),
    findEmployeeByEmail(email)
  ]);

  if (existingAdmin || existingEmployee) {
    throw new AppError(API_MESSAGES.EMAIL_ALREADY_EXISTS, HTTP_STATUS.CONFLICT);
  }
};

export const signupAdmin = async ({ name, email, password }) => {
  await assertEmailIsAvailable(email);

  const passwordHash = await hashPassword(password);
  const admin = await createAdmin({ name, email, passwordHash });

  return buildAuthResponse({
    user: admin,
    role: USER_ROLES.ADMIN
  });
};

export const loginAdmin = async ({ email, password }) => {
  const admin = await findAdminByEmail(email);

  if (!admin || !(await verifyPassword(password, admin.passwordHash))) {
    throw new AppError(API_MESSAGES.INVALID_CREDENTIALS, HTTP_STATUS.UNAUTHORIZED);
  }

  return buildAuthResponse({
    user: {
      id: admin.id,
      name: admin.name,
      email: admin.email,
      createdAt: admin.createdAt,
      updatedAt: admin.updatedAt
    },
    role: USER_ROLES.ADMIN
  });
};

export const loginEmployee = async ({ email, password }) => {
  const employee = await findEmployeeByEmail(email);

  if (!employee || employee.deletedAt || !(await verifyPassword(password, employee.passwordHash))) {
    throw new AppError(API_MESSAGES.INVALID_CREDENTIALS, HTTP_STATUS.UNAUTHORIZED);
  }

  return buildAuthResponse({
    user: {
      id: employee.id,
      name: employee.name,
      email: employee.email,
      department: employee.department,
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

    if (!admin) {
      throw new AppError(API_MESSAGES.USER_NOT_FOUND, HTTP_STATUS.UNAUTHORIZED);
    }

    return {
      ...admin,
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
