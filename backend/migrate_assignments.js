const { PrismaClient } = require('./src/generated/client_v3');
const prisma = new PrismaClient();

async function main() {
  console.log('Migrating Assignments to Activities...');

  const assignments = await prisma.assignment.findMany({
    include: {
      overrides: true,
      submissions: true
    }
  });

  for (const ass of assignments) {
    console.log(`Processing assignment: ${ass.title}`);

    // Create Activity
    const activity = await prisma.activity.create({
      data: {
        lessonId: ass.lessonId,
        type: 'ASSIGNMENT',
        title: ass.title,
        description: ass.description,
        exerciseFileUrl: ass.exerciseFileUrl,
        deletedAt: ass.deletedAt
      }
    });

    // Migrate Submissions
    if (ass.submissions.length > 0) {
      await prisma.submission.updateMany({
        where: { assignmentId: ass.id },
        data: { activityId: activity.id }
      });
    }

    // Migrate Overrides
    for (const override of ass.overrides) {
      await prisma.batchActivity.create({
        data: {
          batchId: override.batchId,
          activityId: activity.id,
          title: override.title,
          description: override.description,
          exerciseFileUrl: override.exerciseFileUrl,
          isHidden: false
        }
      });
    }
  }

  console.log('Migration complete!');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
