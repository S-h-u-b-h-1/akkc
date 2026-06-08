import { API_MESSAGES, HTTP_STATUS } from '../constants/api.js';
import {
  createAdmin,
  findActiveAdminById,
  findAdminByEmail,
  listActiveAdmins,
  softDeleteAdmin,
  updateAdmin
} from '../repositories/adminRepository.js';
import { findEmployeeByEmail } from '../repositories/employeeRepository.js';
import { AppError } from '../utils/appError.js';
import { hashPassword } from '../utils/password.js';

const sanitizeAdmin = (admin) => {
  const sanitizedAdmin = { ...admin };
  delete sanitizedAdmin.deletedAt;
  return sanitizedAdmin;
};

const assertAdminExists = async (adminId) => {
  const admin = await findActiveAdminById(adminId);

  if (!admin) {
    throw new AppError(API_MESSAGES.ADMIN_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
  }

  return admin;
};

const assertEmailIsAvailable = async ({ email, currentAdminId }) => {
  const [existingAdmin, existingEmployee] = await Promise.all([
    findAdminByEmail(email),
    findEmployeeByEmail(email)
  ]);

  const belongsToCurrentAdmin = existingAdmin?.id === currentAdminId;

  if ((existingAdmin && !belongsToCurrentAdmin) || existingEmployee) {
    throw new AppError(API_MESSAGES.EMAIL_ALREADY_EXISTS, HTTP_STATUS.CONFLICT);
  }
};

export const createAdminAccount = async ({ currentAdminId, payload }) => {
  await assertAdminExists(currentAdminId);
  await assertEmailIsAvailable({ email: payload.email });

  const passwordHash = await hashPassword(payload.password);
  const admin = await createAdmin({
    name: payload.name,
    email: payload.email,
    passwordHash,
    createdByAdminId: currentAdminId
  });

  return sanitizeAdmin(admin);
};

export const listAdminAccounts = async () => {
  const admins = await listActiveAdmins();
  return admins.map(sanitizeAdmin);
};

export const updateAdminAccount = async ({ adminId, payload }) => {
  await assertAdminExists(adminId);

  if (payload.email !== undefined) {
    await assertEmailIsAvailable({
      email: payload.email,
      currentAdminId: adminId
    });
  }

  const data = {};

  if (payload.name !== undefined) {
    data.name = payload.name;
  }

  if (payload.email !== undefined) {
    data.email = payload.email;
  }

  if (payload.password !== undefined) {
    data.passwordHash = await hashPassword(payload.password);
  }

  const admin = await updateAdmin({ id: adminId, data });
  return sanitizeAdmin(admin);
};

export const deleteAdminAccount = async ({ currentAdminId, adminId }) => {
  await assertAdminExists(adminId);

  if (currentAdminId === adminId) {
    throw new AppError(API_MESSAGES.CANNOT_DELETE_SELF, HTTP_STATUS.BAD_REQUEST);
  }

  const admin = await softDeleteAdmin(adminId);
  return sanitizeAdmin(admin);
};
