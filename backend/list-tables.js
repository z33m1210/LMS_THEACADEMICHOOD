const { PrismaClient } = require('./src/generated/client_v3');
const prisma = new PrismaClient();

async function check() {
  try {
    const result = await prisma.$queryRawUnsafe("SELECT name FROM sqlite_master WHERE type='table'");
    console.log('Tables:', result);
  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}
check();
