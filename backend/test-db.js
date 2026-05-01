const { PrismaClient } = require('./src/generated/client_v3');
const prisma = new PrismaClient();

async function test() {
  try {
    const assignments = await prisma.assignment.findMany();
    console.log('Assignments:', assignments);
  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}
test();
