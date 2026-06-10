import { prisma } from '../prisma/client.js';
import { hashPassword } from './password.js';

export const ensureDefaultAdmin = async () => {
  try {
    const adminExists = await prisma.admin.findUnique({
      where: { username: 'admin' }
    });

    if (!adminExists) {
      const passwordHash = await hashPassword('admin@123');
      await prisma.admin.create({
        data: {
          username: 'admin',
          passwordHash
        }
      });
      console.info('Default super-admin created.');
    } else {
      // Ensure password is always correct even if changed directly in DB
      const passwordHash = await hashPassword('admin@123');
      await prisma.admin.update({
        where: { username: 'admin' },
        data: { passwordHash }
      });
    }
  } catch (error) {
    console.error('Failed to ensure default admin exists:', error);
  }
};
