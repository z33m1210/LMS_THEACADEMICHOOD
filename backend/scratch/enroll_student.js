const { PrismaClient } = require('../src/generated/client');
const prisma = new PrismaClient();

async function enroll() {
  console.log('Enrolling student in test batch...');
  
  // 1. Find the latest course
  const course = await prisma.course.findFirst({ orderBy: { id: 'desc' } });
  if (!course) return console.log('No courses found.');

  // 2. Create a batch for this course
  const batch = await prisma.batch.create({
    data: {
      name: 'THE-HOOD-2024',
      courseId: course.id
    }
  });

  // 3. Find the student (Alice)
  const student = await prisma.user.findFirst({ where: { role: 'STUDENT' } });
  if (!student) return console.log('No student found.');

  // 4. Enroll student in batch
  await prisma.enrollment.create({
    data: {
      studentId: student.id,
      batchId: batch.id
    }
  });

  console.log(`Enrolled student ${student.name} in course: ${course.title} (Batch: ${batch.name})`);
  process.exit(0);
}

enroll();
