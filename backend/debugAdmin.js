import { getPrisma } from './src/prisma/client.js';
import 'dotenv/config';

(async () => {
  try {
    const admin = await getPrisma().admin.findUnique({
      where: { email: 'admin@akkataruka.com' },
      select: { id: true, email: true, passwordHash: true, name: true }
    });
    console.info('Admin record:', admin);
  } catch (e) {
    console.error('Error fetching admin:', e);
  }
})();
