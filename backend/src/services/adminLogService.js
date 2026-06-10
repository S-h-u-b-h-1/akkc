import { prisma } from '../prisma/client.js';

export const logAdminActivity = async ({ adminId, action, entity, entityId, details }) => {
  try {
    await prisma.adminLog.create({
      data: {
        adminId,
        action,
        entity,
        entityId,
        details: details ? JSON.stringify(details) : null
      }
    });
  } catch (error) {
    console.error('Failed to log admin activity:', error);
  }
};

export const getAdminLogs = async () => {
  return prisma.adminLog.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      admin: {
        select: { username: true }
      }
    }
  });
};
