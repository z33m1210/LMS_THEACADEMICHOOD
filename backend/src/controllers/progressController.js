const prisma = require('../utils/prisma');

exports.toggleLessonProgress = async (req, res) => {
  try {
    const studentId = req.user.userId;
    const { lessonId } = req.body;

    const existing = await prisma.userProgress.findUnique({
      where: {
        studentId_lessonId: { studentId, lessonId: parseInt(lessonId) }
      }
    });

    if (existing) {
      const updated = await prisma.userProgress.update({
        where: { id: existing.id },
        data: { isCompleted: !existing.isCompleted }
      });
      return res.json(updated);
    }

    const created = await prisma.userProgress.create({
      data: {
        studentId,
        lessonId: parseInt(lessonId),
        isCompleted: true
      }
    });
    res.json(created);
  } catch (err) {
    res.status(500).json({ message: 'Error updating progress' });
  }
};
