const { PrismaClient } = require('../src/generated/client_v3');
const prisma = new PrismaClient();

async function main() {
  const batchId = 1;
  const batch = await prisma.batch.findUnique({
    where: { id: batchId },
    include: {
      course: {
        include: {
          sections: {
            include: {
              lessons: {
                include: {
                  activities: true
                }
              }
            }
          }
        }
      },
      lessonOverrides: true,
      activityOverrides: true,
      sectionOverrides: true
    }
  });

  if (!batch) {
    console.log('Batch 1 not found');
    return;
  }

  console.log('Batch found:', batch.name);
  console.log('Course:', batch.course.title);
  console.log('Sections:', batch.course.sections.length);
  
  batch.course.sections.forEach(s => {
    console.log(`- Section: ${s.title}, Lessons: ${s.lessons.length}`);
    s.lessons.forEach(l => {
      console.log(`  -- Lesson: ${l.title}, Activities: ${l.activities.length}`);
    });
  });
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
