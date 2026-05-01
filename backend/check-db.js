const { PrismaClient } = require('./src/generated/client_v3');
const prisma = new PrismaClient();

async function check() {
  try {
    const result = await prisma.$queryRawUnsafe(`PRAGMA table_info(Assignment)`);
    console.log('Assignment Columns:', result);
  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}
check();
