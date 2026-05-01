const { PrismaClient } = require('../src/generated/client_v3');
const prisma = new PrismaClient();

async function createNewCourse() {
  console.log('--- Creating New Course with 1 Module and 1 Lesson ---');

  try {
    // 1. Create Course
    const course = await prisma.course.create({
      data: {
        title: 'Mastering the Hood: Foundation',
        description: 'An introductory course to the premium Academic Hood learning experience.',
        level: 'Intermediate',
        category: 'General English',
        thumbnailUrl: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?q=80&w=2071&auto=format&fit=crop'
      }
    });
    console.log(`✅ Course Created: ${course.title} (ID: ${course.id})`);

    // 2. Create Section (Module)
    const section = await prisma.section.create({
      data: {
        courseId: course.id,
        title: 'Module 1: Getting Started',
        orderIndex: 1
      }
    });
    console.log(`✅ Section Created: ${section.title} (ID: ${section.id})`);

    // 3. Create Lesson
    const lesson = await prisma.lesson.create({
      data: {
        sectionId: section.id,
        title: 'Lesson 1.1: The Champion Mindset',
        content: 'In this lesson, you will learn the psychological principles of high-performance language learning. We cover focus, consistency, and the Champ attitude.',
        orderIndex: 1
      }
    });
    console.log(`✅ Lesson Created: ${lesson.title} (ID: ${lesson.id})`);

    // 4. Create an Assignment for the lesson
    const assignment = await prisma.assignment.create({
      data: {
        lessonId: lesson.id,
        title: 'Champions Mission: Your Learning Goal',
        description: 'Write a 200-word statement about your primary goal for this course. Be specific and ambitious!'
      }
    });
    console.log(`✅ Assignment Created: ${assignment.title} (ID: ${assignment.id})`);

    console.log('--- Course Creation Complete ---');
  } catch (err) {
    console.error('❌ Error creating course:', err);
  } finally {
    await prisma.$disconnect();
  }
}

createNewCourse();
