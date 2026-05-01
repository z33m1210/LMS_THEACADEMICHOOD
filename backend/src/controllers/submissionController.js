const prisma = require('../utils/prisma');

exports.submitAssignment = async (req, res) => {
  const { assignmentId } = req.body;
  const studentId = req.user.userId;

  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }

  const parsedAssignmentId = parseInt(assignmentId);
  if (isNaN(parsedAssignmentId)) {
    return res.status(400).json({ message: 'Invalid assignment ID' });
  }

  try {
    // 1. Soft delete previous submissions for this assignment by this student
    await prisma.submission.updateMany({
      where: {
        assignmentId: parsedAssignmentId,
        studentId: studentId,
        deletedAt: null
      },
      data: {
        deletedAt: new Date()
      }
    });

    // 2. Create new submission
    const submission = await prisma.submission.create({
      data: {
        assignmentId: parsedAssignmentId,
        studentId: studentId,
        filePath: req.file.path,
        status: 'PENDING'
      }
    });

    res.status(201).json({ 
      message: 'Assignment submitted successfully', 
      submission 
    });
  } catch (error) {
    console.error('Submission error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.gradeSubmission = async (req, res) => {
  const { submissionId } = req.params;
  const { grade, comment } = req.body;
  const teacherId = req.user.userId;

  try {
    const submission = await prisma.submission.update({
      where: { id: parseInt(submissionId) },
      data: {
        grade: parseFloat(grade),
        status: 'GRADED'
      },
      include: {
        assignment: true,
        student: true
      }
    });

    // Create comment
    await prisma.submissionComment.create({
      data: {
        submissionId: parseInt(submissionId),
        authorId: teacherId,
        message: comment
      }
    });

    // Create notification for student
    await prisma.notification.create({
      data: {
        userId: submission.studentId,
        message: `Your assignment "${submission.assignment.title}" has been graded: ${grade}/100`,
        type: 'GRADE'
      }
    });

    res.json({ message: 'Submission graded successfully', submission });
  } catch (error) {
    console.error('Grading error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.getPendingSubmissions = async (req, res) => {
  try {
    const userId = req.user.userId;
    const userRole = req.user.role;

    let whereClause = {
      status: 'PENDING',
      deletedAt: null
    };

    // If teacher, only show submissions for their assigned courses
    if (userRole === 'TEACHER') {
      const taughtBatches = await prisma.batchTeacher.findMany({
        where: { teacherId: userId },
        include: { batch: true }
      });
      const courseIds = taughtBatches.map(tb => tb.batch.courseId);
      whereClause.assignment = {
        lesson: {
          section: {
            courseId: { in: courseIds }
          }
        }
      };
    }

    const submissions = await prisma.submission.findMany({
      where: whereClause,
      include: {
        student: { select: { id: true, name: true, email: true } },
        assignment: { select: { id: true, title: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(submissions);
  } catch (error) {
    console.error('Error fetching pending submissions:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.getLessonSubmission = async (req, res) => {
  const { lessonId } = req.params;
  const studentId = req.user.userId;

  const parsedLessonId = parseInt(lessonId);
  if (isNaN(parsedLessonId)) {
    return res.status(400).json({ message: 'Invalid lesson ID' });
  }

  try {
    const submission = await prisma.submission.findFirst({
      where: {
        assignment: { lessonId: parsedLessonId },
        studentId: studentId,
        deletedAt: null
      },
      include: {
        comments: {
          orderBy: { createdAt: 'desc' },
          include: { author: { select: { name: true } } }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(submission);
  } catch (error) {
    console.error('getLessonSubmission error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.getNotifications = async (req, res) => {
  const userId = req.user.userId;
  try {
    const notifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.markNotificationsRead = async (req, res) => {
  const userId = req.user.userId;
  try {
    await prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true }
    });
    res.json({ message: 'Notifications marked as read' });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};
