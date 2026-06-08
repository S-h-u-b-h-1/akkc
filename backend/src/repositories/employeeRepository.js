import { getPrisma } from '../prisma/client.js';

const publicEmployeeSelect = Object.freeze({
  id: true,
  username: true,
  createdByAdminId: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true
});

export const findEmployeeByUsername = (username) =>
  getPrisma().employee.findUnique({
    where: { username }
  });

export const findEmployeeById = (id) =>
  getPrisma().employee.findUnique({
    where: { id },
    select: publicEmployeeSelect
  });

export const findActiveEmployeeByAdmin = ({ id, adminId }) =>
  getPrisma().employee.findFirst({
    where: {
      id,
      createdByAdminId: adminId,
      deletedAt: null
    },
    select: publicEmployeeSelect
  });

export const findArchivedEmployeeByAdmin = ({ id, adminId }) =>
  getPrisma().employee.findFirst({
    where: {
      id,
      createdByAdminId: adminId,
      deletedAt: {
        not: null
      }
    },
    select: publicEmployeeSelect
  });

export const listActiveEmployeesByAdmin = (adminId) =>
  getPrisma().employee.findMany({
    where: {
      createdByAdminId: adminId,
      deletedAt: null
    },
    orderBy: {
      createdAt: 'desc'
    },
    select: publicEmployeeSelect
  });

export const listArchivedEmployeesByAdmin = (adminId) =>
  getPrisma().employee.findMany({
    where: {
      createdByAdminId: adminId,
      deletedAt: {
        not: null
      }
    },
    orderBy: {
      deletedAt: 'desc'
    },
    select: publicEmployeeSelect
  });

export const createEmployee = ({ username, passwordHash, createdByAdminId }) =>
  getPrisma().employee.create({
    data: {
      username,
      passwordHash,
      createdByAdminId
    },
    select: publicEmployeeSelect
  });

export const hardDeleteEmployee = (id) =>
  getPrisma().employee.delete({
    where: { id },
    select: publicEmployeeSelect
  });

export const updateEmployee = ({ id, data }) =>
  getPrisma().employee.update({
    where: { id },
    data,
    select: publicEmployeeSelect
  });

export const softDeleteEmployee = (id) =>
  getPrisma().employee.update({
    where: { id },
    data: {
      deletedAt: new Date()
    },
    select: publicEmployeeSelect
  });
