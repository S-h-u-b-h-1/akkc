import { getPrisma } from './src/prisma/client.js';

async function main() {
  const prisma = getPrisma();
  const employees = await prisma.employee.findMany();
  console.log('Total employees:', employees.length);
  employees.forEach(e => console.log(e.username, e.createdByAdminId));
}

main().then(() => process.exit(0)).catch(console.error);
