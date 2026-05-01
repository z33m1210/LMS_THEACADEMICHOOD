const { PrismaClient } = require('../src/generated/client_v3');
const prisma = new PrismaClient();

async function enroll() {
  console.log('Enrolling student in Course 1...');
  
  // 1. Create a batch for course 1
  const batch = await prisma.batch.create({
    data: {
      name: 'IELTS-INT-001',
      courseId: 1
    }
  });

  // 2. Find student Alice (ID 4)
  const studentId = 4;

  // 3. Enroll
  await prisma.enrollment.create({
    data: {
      studentId,
      batchId: batch.id
    }
  });

  console.log('Enrollment complete for Course 1.');
  process.exit(0);
}

enroll();
