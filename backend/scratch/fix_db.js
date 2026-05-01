const { PrismaClient } = require('../src/generated/client');
const prisma = new PrismaClient();

async function fix() {
  console.log('Adding deletedAt column to Submission table...');
  try {
    await prisma.$executeRawUnsafe('ALTER TABLE Submission ADD COLUMN deletedAt DATETIME');
    console.log('Success!');
  } catch (err) {
    console.error('Failed to add column:', err.message);
  }
  process.exit(0);
}

fix();
