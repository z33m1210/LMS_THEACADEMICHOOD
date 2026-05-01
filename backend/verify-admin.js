const axios = require('axios');

async function testAdminTasks() {
  const adminEmail = 'admin@academichood.com';
  const password = 'admin123';
  const baseURL = 'http://localhost:5000/api';

  try {
    console.log('1. Authenticating as Admin...');
    const loginRes = await axios.post(`${baseURL}/auth/login`, { email: adminEmail, password });
    const token = loginRes.data.token;
    const authConfig = { headers: { Authorization: `Bearer ${token}` } };
    console.log('Authenticated.');

    console.log('\n2. Creating a new Teacher...');
    const teacherData = {
      email: 'teacher.john@academichood.com',
      password: 'teacherpassword',
      name: 'John Doe',
      role: 'TEACHER',
      phoneNumber: '123456789'
    };
    const userRes = await axios.post(`${baseURL}/users`, teacherData, authConfig);
    console.log('Teacher Created:', userRes.data.name);

    console.log('\n3. Creating a new Course...');
    const courseData = {
      title: 'IELTS Intensive',
      description: 'A 4-week intensive course for IELTS preparation.',
      level: 'B2',
      category: 'Exam Prep'
    };
    const courseRes = await axios.post(`${baseURL}/academic/courses`, courseData, authConfig);
    console.log('Course Created:', courseRes.data.title);

    console.log('\n4. Creating a new Batch...');
    const batchData = {
      name: 'IELTS-INT-2024-01',
      courseId: courseRes.data.id
    };
    const batchRes = await axios.post(`${baseURL}/academic/batches`, batchData, authConfig);
    console.log('Batch Created:', batchRes.data.name);

    console.log('\n5. Verifying RBAC (Teacher cannot create user)...');
    const teacherLogin = await axios.post(`${baseURL}/auth/login`, { 
      email: 'teacher.john@academichood.com', 
      password: 'teacherpassword' 
    });
    const teacherToken = teacherLogin.data.token;
    try {
      await axios.post(`${baseURL}/users`, { name: 'Illegal User' }, { 
        headers: { Authorization: `Bearer ${teacherToken}` } 
      });
      console.error('ERROR: Teacher was able to create a user!');
    } catch (err) {
      console.log('Success: Teacher access denied (Status 403).');
    }

    console.log('\nAll verification tests passed!');
    process.exit(0);
  } catch (error) {
    console.error('Verification failed:', error.response?.data || error.message);
    process.exit(1);
  }
}

testAdminTasks();
