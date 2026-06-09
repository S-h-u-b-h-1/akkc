const API_URL = 'https://akkc.onrender.com/api';

async function testProd() {
  try {
    // 1. Login
    const loginRes = await fetch(`${API_URL}/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'admin', password: 'Admin@12345' })
    });
    const loginData = await loginRes.json();
    if (!loginData.success) {
      console.error('Login failed', loginData);
      return;
    }
    const token = loginData.data.token;
    console.log('Logged in, got token');

    // 2. Create employee
    const createRes = await fetch(`${API_URL}/admin/employees`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ username: 'test.user.123', password: 'Password123' })
    });
    
    const createData = await createRes.json();
    console.log('Create Response HTTP Status:', createRes.status);
    console.log('Create Response Data:', JSON.stringify(createData, null, 2));

  } catch (err) {
    console.error('Error:', err);
  }
}

testProd();
