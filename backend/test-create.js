import { createAdminEmployee } from './src/services/employeeManagementService.js';

async function main() {
  try {
    const emp = await createAdminEmployee({
      adminId: '2f5a6b4a-8dc5-4e9e-bd6f-b2f2a1a57a11', // valid admin ID from earlier
      payload: { username: 'test.user', password: 'Password123' }
    });
    console.log('Success:', emp);
  } catch (err) {
    console.error('Error:', err);
  }
}

main().then(() => process.exit(0));
