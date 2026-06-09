import jwt from 'jsonwebtoken';
import { getPrisma } from './src/prisma/client.js';

async function main() {
  const admin = await getPrisma().admin.findFirst();
  if (!admin) {
    console.log('No admin found');
    process.exit(1);
  }
  const token = jwt.sign({ id: admin.id, role: 'ADMIN' }, process.env.JWT_SECRET || 'secret', { expiresIn: '1h' });
  console.log(token);
}

main().then(() => process.exit(0));
