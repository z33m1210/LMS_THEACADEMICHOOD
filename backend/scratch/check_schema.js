const { PrismaClient } = require('../src/generated/client');
const prisma = new PrismaClient();

async function check() {
  try {
    const result = await prisma.$queryRaw`PRAGMA table_info(Submission)`;
    console.log('Table Info:', result);
  } catch (err) {
    console.error(err);
  }
  process.exit(0);
}

check();
