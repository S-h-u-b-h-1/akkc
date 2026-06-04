import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

import { env } from '../config/env.js';

const logLevels = env.nodeEnv === 'development' ? ['warn', 'error'] : ['error'];
let prismaClient = globalThis.prismaClient;

const createPrismaClient = () => {
  if (!env.databaseUrl) {
    throw new Error('DATABASE_URL must be configured before initializing Prisma.');
  }

  const adapter = new PrismaPg({ connectionString: env.databaseUrl });

  return new PrismaClient({
    adapter,
    log: logLevels
  });
};

export const getPrisma = () => {
  if (!prismaClient) {
    prismaClient = createPrismaClient();

    if (env.nodeEnv !== 'production') {
      globalThis.prismaClient = prismaClient;
    }
  }

  return prismaClient;
};

export const disconnectPrisma = async () => {
  if (prismaClient) {
    await prismaClient.$disconnect();
  }
};
