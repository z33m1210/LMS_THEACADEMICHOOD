const { PrismaClient } = require('../src/generated/client_v3');
const prisma = new PrismaClient();

async function seed() {
  console.log('Seeding data with content and materials...');
  
  // 1. Create a course
  const course = await prisma.course.create({
    data: {
      title: 'English Foundations (Final)',
      description: 'The definitive foundation course for HOOD students.',
      category: 'GENERAL',
      level: 'BEGINNER'
    }
  });

  // 2. Create a section
  const section = await prisma.section.create({
    data: {
      courseId: course.id,
      title: 'Module 1: Professional Greetings',
      orderIndex: 1
    }
  });

  // 3. Create a lesson with CONTENT
  const lesson = await prisma.lesson.create({
    data: {
      sectionId: section.id,
      title: 'Mastering the Business Handshake',
      orderIndex: 1,
      content: 'In professional settings, a greeting is more than just words. This lesson covers the nuances of body language, eye contact, and formal English address...'
    }
  });

  // 4. Create an assignment
  const assignment = await prisma.assignment.create({
    data: {
      lessonId: lesson.id,
      title: 'Business Intro Practice',
      description: 'Write a 100-word intro for a networking event.'
    }
  });

  // 5. Create MATERIALS
  await prisma.material.create({
    data: {
      lessonId: lesson.id,
      originalName: 'Greetings Vocabulary.pdf',
      type: 'PDF',
      url: '#'
    }
  });

  // 6. Enroll existing student Alice (ID 4)
  const student = await prisma.user.findFirst({ where: { role: 'STUDENT' } });
  const batch = await prisma.batch.create({
    data: {
      name: 'HOOD-ELITE-2024',
      courseId: course.id
    }
  });
  await prisma.enrollment.create({
    data: {
      studentId: student.id,
      batchId: batch.id
    }
  });

  console.log('Seeding complete!');
  console.log('New Course ID:', course.id);
  console.log('Lesson ID:', lesson.id);
  process.exit(0);
}

seed().catch(err => {
  console.error(err);
  process.exit(1);
});
