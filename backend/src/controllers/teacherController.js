const prisma = require('../utils/prisma');
const { calculateAverageGrade } = require('./academicController');

exports.getTeacherDashboard = async (req, res) => {
  try {
    const teacherId = req.user.userId;
    const { showArchived } = req.query;

    const allTaughtBatches = await prisma.batchTeacher.findMany({
      where: { teacherId },
      include: { batch: true }
    });
    const allCourseIds = allTaughtBatches.map(tb => tb.batch.courseId);

    const taughtBatchesForList = await prisma.batchTeacher.findMany({
      where: { 
        teacherId,
        batch: {
          deletedAt: showArchived === 'true' ? { not: null } : null
        }
      },
      include: {
        batch: {
          include: {
            course: true,
            _count: { select: { students: true } }
          }
        }
      }
    });

    const pendingSubmissions = await prisma.submission.findMany({
      where: {
        status: 'PENDING',
        assignment: {
          lesson: {
            section: {
              courseId: { in: allCourseIds }
            }
          }
        }
      },
      include: {
        student: { select: { id: true, name: true, email: true } },
        assignment: { select: { title: true } }
      }
    });

    res.json({
      batches: await Promise.all(taughtBatchesForList.map(async tb => {
        const batch = tb.batch;
        
        const batchSubmissions = await prisma.submission.findMany({
          where: {
            student: { enrollments: { some: { batchId: batch.id } } },
            status: 'GRADED',
            deletedAt: null
          }
        });
        const avgGrade = batchSubmissions.length > 0 
          ? Math.round(batchSubmissions.reduce((acc, s) => acc + (s.grade || 0), 0) / batchSubmissions.length)
          : 85;

        const nextSection = await prisma.section.findFirst({
          where: { courseId: batch.courseId, deletedAt: null },
          orderBy: { orderIndex: 'asc' },
          include: { lessons: true }
        });

        return {
          id: batch.id,
          name: batch.name,
          courseName: batch.course.title,
          studentCount: batch._count.students,
          averageGrade: avgGrade,
          nextSession: nextSection?.meetingTime || 'TBD',
          meetingLink: nextSection?.meetingLink || '#',
          progress: 65 
        };
      })),
      pendingSubmissions
    });
  } catch (err) {
    console.error('Error fetching teacher dashboard data:', err);
    res.status(500).json({ message: 'Error fetching teacher dashboard data' });
  }
};

exports.getBatchStudents = async (req, res) => {
  const { id } = req.params;
  try {
    const batch = await prisma.batch.findUnique({
      where: { id: parseInt(id) },
      include: { 
        course: true,
        students: {
          include: {
            student: { select: { id: true, name: true, email: true } }
          }
        }
      }
    });

    if (!batch) return res.status(404).json({ message: 'Batch not found' });

    const studentsWithGrades = await Promise.all(batch.students.map(async enrollment => {
      const averageGrade = await calculateAverageGrade(enrollment.studentId, batch.courseId);
      return {
        id: enrollment.studentId,
        name: enrollment.student.name,
        email: enrollment.student.email,
        averageGrade
      };
    }));

    res.json({
      batchId: batch.id,
      batchName: batch.name,
      courseName: batch.course.title,
      students: studentsWithGrades
    });
  } catch (err) {
    console.error('Error fetching batch students:', err);
    res.status(500).json({ message: 'Error fetching batch students' });
  }
};
