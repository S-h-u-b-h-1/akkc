import { createEmployee } from './src/controllers/adminEmployeeController.js';

const req = {
  user: { id: '2f5a6b4a-8dc5-4e9e-bd6f-b2f2a1a57a11' },
  validated: { body: { username: 'test.user2', password: 'Password123' } }
};

const res = {
  status: (code) => {
    console.log('Status:', code);
    return {
      json: (data) => {
        console.log('Data:', data);
      }
    };
  }
};

async function main() {
  try {
    await createEmployee(req, res);
  } catch (err) {
    console.error('Error:', err);
  }
}

main().then(() => process.exit(0));
