const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function seed() {
  const teacherPw = await bcrypt.hash('teacher123', 10);
  const studentPw = await bcrypt.hash('student123', 10);

  const teacher = await prisma.user.upsert({
    where: { email: 'teacher@academichood.com' },
    update: {},
    create: { email: 'teacher@academichood.com', password: teacherPw, name: 'John Teacher', role: 'TEACHER' }
  });

  const student = await prisma.user.upsert({
    where: { email: 'student@academichood.com' },
    update: {},
    create: { email: 'student@academichood.com', password: studentPw, name: 'Alice Student', role: 'STUDENT', studentId: 'STU001' }
  });

  const course = await prisma.course.findFirst();
  if (course) {
    const batch = await prisma.batch.findFirst({ where: { courseId: course.id } });
    if (batch) {
      await prisma.batchTeacher.upsert({
        where: { batchId_teacherId: { batchId: batch.id, teacherId: teacher.id } },
        update: {},
        create: { batchId: batch.id, teacherId: teacher.id }
      });

      await prisma.enrollment.upsert({
        where: { batchId_studentId: { batchId: batch.id, studentId: student.id } },
        update: {},
        create: { batchId: batch.id, studentId: student.id }
      });
    }
  }
  console.log('Seeded Teacher and Student with assignments.');
}
seed().finally(() => prisma.$disconnect());
