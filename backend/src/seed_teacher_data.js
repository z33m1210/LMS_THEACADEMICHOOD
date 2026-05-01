const prisma = require('./utils/prisma');
const bcrypt = require('bcryptjs');

async function seed() {
  console.log('🌱 Seeding Teacher & Dashboard data...');

  const hashedPassword = await bcrypt.hash('password123', 10);

  // 1. Create a Teacher
  const teacher = await prisma.user.upsert({
    where: { email: 'teacher@academic.com' },
    update: {},
    create: {
      email: 'teacher@academic.com',
      password: hashedPassword,
      name: 'Dr. Sarah Hood',
      role: 'TEACHER',
    }
  });

  // 2. Create a Course
  const course = await prisma.course.create({
    data: {
      title: 'IELTS Mastery 2026',
      description: 'Comprehensive course for high band scores.',
      level: 'Advanced',
      category: 'IELTS',
      sections: {
        create: [
          {
            title: 'Introduction to Academic Writing',
            orderIndex: 1,
            meetingTime: 'Mon 10:00 AM',
            lessons: {
              create: [
                {
                  title: 'Task 1: Data Interpretation',
                  orderIndex: 1,
                  assignments: {
                    create: [
                      {
                        title: 'Graph Analysis Report',
                        description: 'Write a 150-word report on the provided bar chart.'
                      }
                    ]
                  }
                }
              ]
            }
          }
        ]
      }
    },
    include: {
      sections: {
        include: {
          lessons: {
            include: {
              assignments: true
            }
          }
        }
      }
    }
  });

  // 3. Create a Batch
  const batch = await prisma.batch.create({
    data: {
      name: 'IELTS-B2-MORNING',
      courseId: course.id,
      teachers: {
        create: {
          teacherId: teacher.id
        }
      }
    }
  });

  // 4. Create Students and Enroll them
  const students = [
    { name: 'Alice Student', email: 'alice@student.com' },
    { name: 'Bob Smith', email: 'bob@student.com' },
    { name: 'Charlie Dean', email: 'charlie@student.com' }
  ];

  for (const s of students) {
    const user = await prisma.user.upsert({
      where: { email: s.email },
      update: {},
      create: {
        email: s.email,
        password: hashedPassword,
        name: s.name,
        role: 'STUDENT',
        enrollments: {
          create: {
            batchId: batch.id
          }
        }
      }
    });

    // 5. Create some Submissions
    // Create one PENDING submission for Alice
    if (s.name === 'Alice Student') {
      await prisma.submission.create({
        data: {
          assignmentId: course.sections[0].lessons[0].assignments[0].id,
          studentId: user.id,
          filePath: 'uploads/alice_report.txt',
          status: 'PENDING',
          createdAt: new Date(Date.now() - 22 * 60 * 60 * 1000) // 22 hours ago (URGENT)
        }
      });
    }

    // Create one GRADED submission for Bob (to test avg grade)
    if (s.name === 'Bob Smith') {
      await prisma.submission.create({
        data: {
          assignmentId: course.sections[0].lessons[0].assignments[0].id,
          studentId: user.id,
          filePath: 'uploads/bob_report.txt',
          status: 'GRADED',
          grade: 92,
          createdAt: new Date()
        }
      });
    }
  }

  console.log('✅ Seed successful!');
  console.log(`Teacher Login: teacher@academic.com / password123`);
}

seed()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
