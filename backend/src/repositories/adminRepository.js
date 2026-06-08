import { getPrisma } from '../prisma/client.js';

const publicAdminSelect = Object.freeze({
  id: true,
  username: true,
  createdByAdminId: true,
  createdByAdmin: {
    select: {
      id: true,
      username: true
    }
  },
  createdAt: true,
  updatedAt: true
});

export const findAdminByUsername = (username) =>
  getPrisma().admin.findUnique({
    where: { username },
    select: { passwordHash: true, ...publicAdminSelect }
  });

export const findAdminById = (id) =>
  getPrisma().admin.findUnique({
    where: { id },
    select: publicAdminSelect
  });

export const listAdmins = () =>
  getPrisma().admin.findMany({
    orderBy: {
      createdAt: 'desc'
    },
    select: publicAdminSelect
  });

export const createAdmin = ({ username, passwordHash, createdByAdminId }) =>
  getPrisma().admin.create({
    data: {
      username,
      passwordHash,
      createdByAdminId
    },
    select: publicAdminSelect
  });

export const deleteAdmin = ({ id, replacementAdminId }) =>
  getPrisma().$transaction(async (transaction) => {
    await transaction.admin.updateMany({
      where: { createdByAdminId: id },
      data: { createdByAdminId: replacementAdminId }
    });
    await transaction.employee.updateMany({
      where: { createdByAdminId: id },
      data: { createdByAdminId: replacementAdminId }
    });
    await transaction.task.updateMany({
      where: { createdByAdminId: id },
      data: { createdByAdminId: replacementAdminId }
    });

    return transaction.admin.delete({
      where: { id },
      select: publicAdminSelect
    });
  });

export const updateAdmin = ({ id, data }) =>
  getPrisma().admin.update({
    where: { id },
    data,
    select: publicAdminSelect
  });
