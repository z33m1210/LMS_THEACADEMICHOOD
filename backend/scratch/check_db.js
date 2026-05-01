const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const lessons = await prisma.lesson.findMany();
  console.log('Lessons:', lessons);
  const assignments = await prisma.assignment.findMany();
  console.log('Assignments:', assignments);
  process.exit(0);
}

check();
