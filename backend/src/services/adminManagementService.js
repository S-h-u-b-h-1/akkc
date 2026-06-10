import { API_MESSAGES, HTTP_STATUS } from '../constants/api.js';
import {
  createAdmin,
  findAdminById,
  findAdminByUsername,
  listAdmins,
  deleteAdmin,
  updateAdmin
} from '../repositories/adminRepository.js';
import { findEmployeeByUsername } from '../repositories/employeeRepository.js';
import { AppError } from '../utils/appError.js';
import { hashPassword } from '../utils/password.js';

const assertAdminExists = async (adminId) => {
  const admin = await findAdminById(adminId);

  if (!admin) {
    throw new AppError(API_MESSAGES.ADMIN_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
  }

  return admin;
};

const assertUsernameIsAvailable = async ({ username, currentAdminId }) => {
  const [existingAdmin, existingEmployee] = await Promise.all([
    findAdminByUsername(username),
    findEmployeeByUsername(username)
  ]);

  const belongsToCurrentAdmin = existingAdmin?.id === currentAdminId;

  if ((existingAdmin && !belongsToCurrentAdmin) || existingEmployee) {
    throw new AppError(API_MESSAGES.USERNAME_ALREADY_EXISTS, HTTP_STATUS.CONFLICT);
  }
};

export const createAdminAccount = async ({ currentAdminId, payload }) => {
  await assertAdminExists(currentAdminId);
  await assertUsernameIsAvailable({ username: payload.username });

  const passwordHash = await hashPassword(payload.password);
  const admin = await createAdmin({
    username: payload.username,
    passwordHash,
    createdByAdminId: currentAdminId
  });

  return admin;
};

export const listAdminAccounts = async () => {
  const admins = await listAdmins();
  return admins;
};

export const updateAdminAccount = async ({ adminId, payload }) => {
  const adminToUpdate = await assertAdminExists(adminId);

  if (adminToUpdate.username === 'admin') {
    throw new AppError('The default admin account cannot be modified.', HTTP_STATUS.FORBIDDEN);
  }

  if (payload.username !== undefined) {
    await assertUsernameIsAvailable({
      username: payload.username,
      currentAdminId: adminId
    });
  }

  const data = {};

  if (payload.username !== undefined) {
    data.username = payload.username;
  }

  if (payload.password !== undefined) {
    data.passwordHash = await hashPassword(payload.password);
  }

  const admin = await updateAdmin({ id: adminId, data });
  return admin;
};

export const deleteAdminAccount = async ({ currentAdminId, adminId }) => {
  const adminToDelete = await assertAdminExists(adminId);

  if (adminToDelete.username === 'admin') {
    throw new AppError('The default admin account cannot be deleted.', HTTP_STATUS.FORBIDDEN);
  }

  if (currentAdminId === adminId) {
    throw new AppError(API_MESSAGES.CANNOT_DELETE_SELF, HTTP_STATUS.BAD_REQUEST);
  }

  const admin = await deleteAdmin({ id: adminId, replacementAdminId: currentAdminId });
  return admin;
};
