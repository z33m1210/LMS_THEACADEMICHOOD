const { PrismaClient } = require('../src/generated/client_v3');
const prisma = new PrismaClient();

async function fixCourse1() {
  console.log('Checking Course 1...');
  
  const course = await prisma.course.findUnique({
    where: { id: 1 },
    include: { sections: true }
  });

  if (!course) return console.log('Course 1 not found.');

  if (course.sections.length <= 1) {
    console.log('Adding more sample data to Course 1...');
    
    // Add Section 2
    const section2 = await prisma.section.create({
      data: {
        courseId: 1,
        title: 'Section 2: Mastering Reading',
        orderIndex: 2
      }
    });

    await prisma.lesson.createMany({
      data: [
        {
          sectionId: section2.id,
          title: 'Skimming & Scanning Techniques',
          orderIndex: 1,
          content: 'Reading fast is key. Focus on keywords and headings...'
        },
        {
          sectionId: section2.id,
          title: 'True/False/Not Given Mastery',
          orderIndex: 2,
          content: 'This is the hardest part for most. Learn the subtle differences...'
        }
      ]
    });

    // Add Assignment to Lesson 7
    const lesson7 = await prisma.lesson.findFirst({ where: { title: 'Welcome to IELTS Intensive' } });
    if (lesson7) {
      await prisma.assignment.create({
        data: {
          lessonId: lesson7.id,
          title: 'Introduce Yourself',
          description: 'Upload a 100-word introduction about your goals.'
        }
      });
    }

    console.log('Additional data added to Course 1.');
  } else {
    console.log('Course 1 already has multiple sections.');
  }
  process.exit(0);
}

fixCourse1();
