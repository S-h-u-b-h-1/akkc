import { getPrisma } from '../prisma/client.js';

const publicAdminSelect = Object.freeze({
  id: true,
  name: true,
  email: true,
  createdAt: true,
  updatedAt: true
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

export const createAdmin = ({ name, email, passwordHash }) =>
  getPrisma().admin.create({
    data: {
      name,
      email,
      passwordHash
    },
    select: publicAdminSelect
  });
