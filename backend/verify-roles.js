const axios = require('axios');

async function verifyVerticalSlice() {
  const baseURL = 'http://localhost:5000/api';
  
  const testCases = [
    { email: 'admin@academichood.com', password: 'admin123', expectedDashboard: '/admin/dashboard' },
    { email: 'teacher@academichood.com', password: 'teacher123', expectedDashboard: '/teacher/dashboard' },
    { email: 'student@academichood.com', password: 'student123', expectedDashboard: '/student/dashboard' }
  ];

  for (const test of testCases) {
    try {
      console.log(`Testing Login for ${test.email}...`);
      const res = await axios.post(`${baseURL}/auth/login`, {
        email: test.email,
        password: test.password
      });
      
      console.log(`- Authenticated as: ${res.data.user.role}`);
      
      // Verify Backend filtering for student
      if (res.data.user.role === 'STUDENT') {
        const courses = await axios.get(`${baseURL}/student/my-courses`, {
          headers: { Authorization: `Bearer ${res.data.token}` }
        });
        console.log(`- Student Courses Found: ${courses.data.length}`);
      }
      
      // Verify Backend filtering for teacher
      if (res.data.user.role === 'TEACHER') {
        const dashboard = await axios.get(`${baseURL}/teacher/dashboard`, {
          headers: { Authorization: `Bearer ${res.data.token}` }
        });
        console.log(`- Teacher Batches Found: ${dashboard.data.batches.length}`);
      }
      
    } catch (err) {
      console.error(`- FAILED for ${test.email}:`, err.response?.data || err.message);
    }
  }
}

verifyVerticalSlice();
