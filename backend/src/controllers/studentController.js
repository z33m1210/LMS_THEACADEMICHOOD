const prisma = require('../utils/prisma');

exports.getMyCourses = async (req, res) => {
  try {
    const studentId = req.user.userId;
    const enrollments = await prisma.enrollment.findMany({
      where: { studentId },
      include: {
        batch: {
          include: {
            course: true
          }
        }
      }
    });

    const courses = await Promise.all(enrollments.map(async e => {
      const course = e.batch.course;
      
      // Fetch curriculum structure
      const sections = await prisma.section.findMany({
        where: { courseId: course.id },
        include: { lessons: true }
      });
      const lessonIds = sections.flatMap(s => s.lessons).map(l => l.id);
      
      // Count completed lessons
      const completedCount = await prisma.userProgress.count({
        where: {
          studentId,
          lessonId: { in: lessonIds },
          isCompleted: true
        }
      });

      const progress = lessonIds.length > 0 ? Math.round((completedCount / lessonIds.length) * 100) : 0;

      return {
        batchId: e.batchId,
        batchName: e.batch.name,
        ...course,
        progress
      };
    }));

    res.json(courses);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching courses' });
  }
};

exports.getMySubmissions = async (req, res) => {
  try {
    const studentId = req.user.userId;
    const submissions = await prisma.submission.findMany({
      where: { studentId },
      include: {
        assignment: true,
        comments: {
          include: {
            author: { select: { name: true, role: true } }
          }
        }
      }
    });
    res.json(submissions);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching submissions' });
  }
};
