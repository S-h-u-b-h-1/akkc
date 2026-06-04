import app from './app.js';
import { env, validateEnv } from './config/env.js';

validateEnv();

const { prisma } = await import('./prisma/client.js');

const server = app.listen(env.port, () => {
  console.info(`API server listening on port ${env.port}`);
});

const shutdown = async (signal) => {
  console.info(`${signal} received. Closing API server.`);

  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });

  setTimeout(() => {
    console.error('Forced shutdown after timeout.');
    process.exit(1);
  }, 10000).unref();
};

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
