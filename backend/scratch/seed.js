const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seed() {
  console.log('Seeding data...');
  
  // 1. Create a course
  const course = await prisma.course.create({
    data: {
      title: 'English Foundations',
      description: 'Master the basics of English communication.',
      category: 'GENERAL',
      level: 'BEGINNER'
    }
  });

  // 2. Create a section
  const section = await prisma.section.create({
    data: {
      courseId: course.id,
      title: 'Module 1: Greetings',
      orderIndex: 1
    }
  });

  // 3. Create a lesson (This will be ID 1)
  const lesson = await prisma.lesson.create({
    data: {
      sectionId: section.id,
      title: 'Common Greetings in Business',
      orderIndex: 1
    }
  });

  // 4. Create an assignment
  const assignment = await prisma.assignment.create({
    data: {
      lessonId: lesson.id,
      title: 'Business Introduction Practice',
      description: 'Write a 100-word business intro.'
    }
  });

  console.log('Seeding complete!');
  console.log('Lesson ID:', lesson.id);
  console.log('Assignment ID:', assignment.id);
  process.exit(0);
}

seed().catch(err => {
  console.error(err);
  process.exit(1);
});
