const { PrismaClient } = require('./src/generated/client_v3');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function seed() {
  console.log('--- Starting Comprehensive Seed V4 ---');
  
  const teacherPw = await bcrypt.hash('teacher123', 10);
  const studentPw = await bcrypt.hash('student123', 10);
  const adminPw = await bcrypt.hash('admin123', 10);

  // 0. Create Admin
  await prisma.user.upsert({
    where: { email: 'admin@test.com' },
    update: { password: adminPw },
    create: { email: 'admin@test.com', password: adminPw, name: 'Headmaster Admin', role: 'ADMIN' }
  });

  // 1. Create Teacher
  const teacher = await prisma.user.upsert({
    where: { email: 'teacher@test.com' },
    update: {},
    create: { email: 'teacher@test.com', password: teacherPw, name: 'Prof. Xavier', role: 'TEACHER' }
  });

  // 2. Create Student
  const student = await prisma.user.upsert({
    where: { email: 'student@test.com' },
    update: {},
    create: { email: 'student@test.com', password: studentPw, name: 'Alice Walker', role: 'STUDENT', studentId: 'STU_V4' }
  });

  // 3. Create Course with Assignments & Weights
  const course = await prisma.course.create({
    data: {
      title: 'Advanced Weighted English',
      description: 'A course with weighted grading engine testing.',
      level: 'B2',
      category: 'Academic',
      sections: {
        create: {
          title: 'Module 1',
          orderIndex: 0,
          lessons: {
            create: {
              title: 'Weighted Lesson',
              orderIndex: 0,
              assignments: {
                create: [
                  { title: 'Assignment 1 (40%)', weight: 40, description: 'Test assignment 1' },
                  { title: 'Assignment 2 (60%)', weight: 60, description: 'Test assignment 2' }
                ]
              }
            }
          }
        }
      }
    },
    include: { sections: { include: { lessons: { include: { assignments: true } } } } }
  });

  // 4. Create Batches (Active and Archived)
  const activeBatch = await prisma.batch.create({
    data: { 
      name: 'Batch A - Active', 
      courseId: course.id,
      teachers: { create: { teacherId: teacher.id } },
      students: { create: { studentId: student.id } }
    }
  });

  const archivedBatch = await prisma.batch.create({
    data: { 
      name: 'Batch B - Archived', 
      courseId: course.id,
      deletedAt: new Date(),
      teachers: { create: { teacherId: teacher.id } }
    }
  });

  // 5. Create Submissions
  const assignments = course.sections[0].lessons[0].assignments;
  
  // Create one pending submission (Older than 20h for SLA test)
  await prisma.submission.create({
    data: {
      assignmentId: assignments[0].id,
      studentId: student.id,
      filePath: 'uploads/alice_report.pdf',
      status: 'PENDING',
      createdAt: new Date(Date.now() - 22 * 60 * 60 * 1000) // 22 hours ago
    }
  });

  // Create one graded submission
  await prisma.submission.create({
    data: {
      assignmentId: assignments[1].id,
      studentId: student.id,
      filePath: 'uploads/alice_report.pdf',
      status: 'GRADED',
      grade: 90
    }
  });

  console.log('--- Seed V4 Complete ---');
  console.log('Teacher: teacher@test.com / teacher123');
  console.log('Student: student@test.com / student123');
  console.log('Course ID:', course.id);
}

seed().catch(e => console.error(e)).finally(() => prisma.$disconnect());
