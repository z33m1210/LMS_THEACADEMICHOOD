const { PrismaClient } = require('./src/generated/client_v3');
const prisma = new PrismaClient();
async function main() {
  try {
    const users = await prisma.user.findMany();
    console.log('Users found:', users.length);
    const courses = await prisma.course.findMany();
    console.log('Courses found:', courses.length);
    const submissions = await prisma.submission.findMany({
      where: { deletedAt: null }
    });
    console.log('Submissions found:', submissions.length);
  } catch (e) {
    console.error('DB Error:', e);
  } finally {
    await prisma.$disconnect();
  }
}
main();
