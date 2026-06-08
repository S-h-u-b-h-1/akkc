import { API_MESSAGES, HTTP_STATUS } from '../constants/api.js';
import {
  findArchivedAdminById,
  hardDeleteAdmin,
  listArchivedAdmins
} from '../repositories/adminRepository.js';
import {
  findArchivedEmployeeByAdmin,
  hardDeleteEmployee,
  listArchivedEmployeesByAdmin
} from '../repositories/employeeRepository.js';
import { AppError } from '../utils/appError.js';

export const listArchivedAdminAccounts = async () => {
  return listArchivedAdmins();
};

export const permanentlyDeleteAdminAccount = async ({ currentAdminId, adminId }) => {
  if (currentAdminId === adminId) {
    throw new AppError(API_MESSAGES.CANNOT_DELETE_SELF, HTTP_STATUS.BAD_REQUEST);
  }

  const archivedAdmin = await findArchivedAdminById(adminId);

  if (!archivedAdmin) {
    throw new AppError(API_MESSAGES.ADMIN_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
  }

  return hardDeleteAdmin({ id: adminId, replacementAdminId: currentAdminId });
};

export const listArchivedEmployeeAccounts = async ({ adminId }) => {
  return listArchivedEmployeesByAdmin(adminId);
};

export const permanentlyDeleteEmployeeAccount = async ({ adminId, employeeId }) => {
  const archivedEmployee = await findArchivedEmployeeByAdmin({ id: employeeId, adminId });

  if (!archivedEmployee) {
    throw new AppError(API_MESSAGES.EMPLOYEE_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
  }

  return hardDeleteEmployee(employeeId);
};
