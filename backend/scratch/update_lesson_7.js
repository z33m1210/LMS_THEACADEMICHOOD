const { PrismaClient } = require('../src/generated/client_v3');
const prisma = new PrismaClient();

async function addContent() {
  console.log('Adding Assignment and Material to Lesson 7...');
  
  // 1. Add Material
  await prisma.material.create({
    data: {
      lessonId: 7,
      originalName: 'IELTS_Structure_Overview.pdf',
      type: 'PDF',
      url: '#'
    }
  });

  // 2. Add Assignment
  await prisma.assignment.create({
    data: {
      lessonId: 7,
      title: 'Practice Essay 1',
      description: 'Write a response to the prompt: "Some people think that..."'
    }
  });

  console.log('Update complete!');
  process.exit(0);
}

addContent();
