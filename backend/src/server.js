import app from './app.js';
import { env, validateEnv } from './config/env.js';
import { disconnectPrisma } from './prisma/client.js';

validateEnv();

const server = app.listen(env.port, () => {
  console.info(`API server listening on port ${env.port}`);
});

const shutdown = async (signal) => {
  console.info(`${signal} received. Closing API server.`);

  server.close(async () => {
    await disconnectPrisma();
    process.exit(0);
  });

  setTimeout(() => {
    console.error('Forced shutdown after timeout.');
    process.exit(1);
  }, 10000).unref();
};

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
