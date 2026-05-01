const { PrismaClient } = require('../src/generated/client');
const prisma = new PrismaClient();

async function fix() {
  console.log('Adding content column to Lesson table...');
  try {
    await prisma.$executeRawUnsafe('ALTER TABLE Lesson ADD COLUMN content TEXT');
    console.log('Success!');
  } catch (err) {
    console.error('Failed to add column:', err.message);
  }
  process.exit(0);
}

fix();
