const axios = require('axios');

async function testAuth() {
  try {
    console.log('Testing login endpoint...');
    const response = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'admin@academichood.com',
      password: 'admin123'
    });
    
    console.log('SUCCESS!');
    console.log('User Name:', response.data.user.name);
    console.log('User Role:', response.data.user.role);
    console.log('Token Received:', response.data.token.substring(0, 20) + '...');
    
    process.exit(0);
  } catch (error) {
    console.error('FAILED!');
    console.error('Status:', error.response?.status);
    console.error('Message:', error.response?.data?.message || error.message);
    process.exit(1);
  }
}

testAuth();
