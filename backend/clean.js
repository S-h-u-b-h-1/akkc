import { getPrisma, disconnectPrisma } from './src/prisma/client.js';

async function clean() {
  const prisma = getPrisma();
  await prisma.$executeRawUnsafe(`DELETE FROM "Employee" WHERE "deletedAt" IS NOT NULL`);
  await prisma.$executeRawUnsafe(`DELETE FROM "Admin" WHERE "deletedAt" IS NOT NULL`);
  console.log('Cleaned soft deleted records');
}

clean().catch(console.error).finally(() => disconnectPrisma());
