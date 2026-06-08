import app from './app.js';
import { env, validateEnv } from './config/env.js';
import { disconnectPrisma } from './prisma/client.js';
import { deployMigrations } from './utils/deployMigrations.js';

validateEnv();

let server;

const startServer = async () => {
  if (env.nodeEnv === 'production') {
    await deployMigrations();
  }

  server = app.listen(env.port, () => {
    console.info(`API server listening on port ${env.port}`);
  });
};

const shutdown = async (signal) => {
  console.info(`${signal} received. Closing API server.`);

  if (!server) {
    await disconnectPrisma();
    process.exit(0);
  }

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

startServer().catch((error) => {
  console.error('Failed to start API server.', error);
  process.exit(1);
});
