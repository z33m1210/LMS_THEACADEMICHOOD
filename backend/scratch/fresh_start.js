const { PrismaClient } = require('../src/generated/client_v3');
const prisma = new PrismaClient();

async function freshStart() {
  console.log('--- Wiping Database ---');
  
  // Order matters due to foreign keys
  await prisma.userProgress.deleteMany({});
  await prisma.submissionComment.deleteMany({});
  await prisma.submission.deleteMany({});
  await prisma.assignment.deleteMany({});
  await prisma.material.deleteMany({});
  await prisma.lesson.deleteMany({});
  await prisma.section.deleteMany({});
  await prisma.enrollment.deleteMany({});
  await prisma.batch.deleteMany({});
  await prisma.course.deleteMany({});

  console.log('--- Database Wiped ---');

  console.log('--- Creating The Hood Masterclass ---');

  const course = await prisma.course.create({
    data: {
      title: 'The Hood: Ultimate Mastery',
      description: 'The definitive path to English fluency and IELTS success.',
      level: 'Advanced',
      category: 'Masterclass',
      thumbnailUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=1200'
    }
  });

  const modules = [
    { title: 'Module 1: The Foundation', lessons: ['Welcome to the Hood', 'Setting Your Goals', 'The Champion Mindset'] },
    { title: 'Module 2: Advanced Grammar', lessons: ['Conditionals & Hypotheses', 'Relative Clauses Mastery', 'Advanced Punctuation'] },
    { title: 'Module 3: Speaking Excellence', lessons: ['Intonation & Stress', 'Vocabulary for Impact', 'Mock Interview Prep'] }
  ];

  for (let i = 0; i < modules.length; i++) {
    const section = await prisma.section.create({
      data: {
        courseId: course.id,
        title: modules[i].title,
        orderIndex: i + 1
      }
    });

    for (let j = 0; j < modules[i].lessons.length; j++) {
      const lesson = await prisma.lesson.create({
        data: {
          sectionId: section.id,
          title: modules[i].lessons[j],
          orderIndex: j + 1,
          content: `This is the lesson content for ${modules[i].lessons[j]}. Level up your skills here!`
        }
      });

      // Add one assignment to the first lesson of each module
      if (j === 0) {
        await prisma.assignment.create({
          data: {
            lessonId: lesson.id,
            title: `${modules[i].lessons[j]} Mission`,
            description: `Complete this mission to demonstrate your mastery of ${modules[i].lessons[j]}.`
          }
        });
      }
    }
  }

  console.log('--- Creating New Batch & Enrollment ---');

  const batch = await prisma.batch.create({
    data: {
      name: 'HOOD-ELITE-2024-V2',
      courseId: course.id
    }
  });

  // Enroll student@academichood.com (ID 4)
  await prisma.enrollment.create({
    data: {
      studentId: 4,
      batchId: batch.id
    }
  });

  console.log('--- Fresh Start Complete ---');
  process.exit(0);
}

freshStart().catch(err => {
  console.error(err);
  process.exit(1);
});
