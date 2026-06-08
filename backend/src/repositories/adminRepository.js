import { getPrisma } from '../prisma/client.js';

const publicAdminSelect = Object.freeze({
  id: true,
  name: true,
  email: true,
  createdByAdminId: true,
  createdByAdmin: {
    select: {
      id: true,
      name: true,
      email: true
    }
  },
  createdAt: true,
  updatedAt: true,
  deletedAt: true
});

export const findAdminByEmail = (email) =>
  getPrisma().admin.findUnique({
    where: { email },
    select: { passwordHash: true, ...publicAdminSelect }
  });

export const findAdminById = (id) =>
  getPrisma().admin.findUnique({
    where: { id },
    select: publicAdminSelect
  });

export const findActiveAdminById = (id) =>
  getPrisma().admin.findFirst({
    where: {
      id,
      deletedAt: null
    },
    select: publicAdminSelect
  });

export const listActiveAdmins = () =>
  getPrisma().admin.findMany({
    where: {
      deletedAt: null
    },
    orderBy: {
      createdAt: 'desc'
    },
    select: publicAdminSelect
  });

export const createAdmin = ({ name, email, passwordHash, createdByAdminId }) =>
  getPrisma().admin.create({
    data: {
      name,
      email,
      passwordHash,
      createdByAdminId
    },
    select: publicAdminSelect
  });

export const updateAdmin = ({ id, data }) =>
  getPrisma().admin.update({
    where: { id },
    data,
    select: publicAdminSelect
  });

export const softDeleteAdmin = (id) =>
  getPrisma().admin.update({
    where: { id },
    data: {
      deletedAt: new Date()
    },
    select: publicAdminSelect
  });
