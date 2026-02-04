const fetch = require('node-fetch');

async function testAdminLogin() {
  const url = 'https://smart-crop-aid.vercel.app/api/auth/login';
  const credentials = {
    email: 'admin@smartcrop.com',
    password: 'admin@123'
  };

  console.log('Testing Admin Login against:', url);

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    });

    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Admin Login Successful!');
      console.log('   User:', data.user.email);
      console.log('   Role:', data.user.role);
      console.log('   Token received:', data.token ? 'Yes' : 'No');
    } else {
      console.log('❌ Admin Login Failed:', response.status, data);
    }
  } catch (error) {
    console.error('❌ Network/Server Error:', error.message);
  }
}

testAdminLogin();
