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
