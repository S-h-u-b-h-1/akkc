import { execFile } from 'node:child_process';
import path from 'node:path';
import { promisify } from 'node:util';
import { fileURLToPath } from 'node:url';

const execFileAsync = promisify(execFile);
const backendRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');

export const deployMigrations = async () => {
  const { stderr, stdout } = await execFileAsync(
    'npx',
    ['prisma', 'migrate', 'deploy', '--schema=prisma/schema.prisma'],
    {
      cwd: backendRoot
    }
  );

  if (stdout) {
    console.info(stdout.trim());
  }

  if (stderr) {
    console.warn(stderr.trim());
  }
};
