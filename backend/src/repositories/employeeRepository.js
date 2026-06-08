import { getPrisma } from '../prisma/client.js';

const publicEmployeeSelect = Object.freeze({
  id: true,
  username: true,
  createdByAdminId: true,
  createdAt: true,
  updatedAt: true
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

export const findEmployeeByAdmin = ({ id, adminId }) =>
  getPrisma().employee.findFirst({
    where: {
      id,
      createdByAdminId: adminId
    },
    select: publicEmployeeSelect
  });

export const listEmployeesByAdmin = (adminId) =>
  getPrisma().employee.findMany({
    where: {
      createdByAdminId: adminId
    },
    orderBy: {
      createdAt: 'desc'
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

export const deleteEmployee = (id) =>
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
