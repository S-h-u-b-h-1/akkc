import { getPrisma } from '../prisma/client.js';

const publicEmployeeSelect = Object.freeze({
  id: true,
  name: true,
  email: true,
  department: true,
  createdByAdminId: true,
  createdAt: true,
  updatedAt: true
});

export const findEmployeeByEmail = (email) =>
  getPrisma().employee.findUnique({
    where: { email }
  });

export const findEmployeeById = (id) =>
  getPrisma().employee.findUnique({
    where: { id },
    select: publicEmployeeSelect
  });
