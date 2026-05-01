const prisma = require('../utils/prisma');
const logAction = require('../utils/logger');

// --- Sections ---
exports.createSection = async (req, res) => {
  try {
    const { courseId, title, orderIndex, meetingLink, meetingTime } = req.body;
    const section = await prisma.section.create({
      data: {
        courseId: parseInt(courseId),
        title,
        orderIndex: parseInt(orderIndex),
        meetingLink,
        meetingTime
      }
    });
    await logAction(req.user.userId, 'CREATE_SECTION', `Section: ${section.title}`, { courseId });
    res.status(201).json(section);
  } catch (err) {
    res.status(500).json({ message: 'Error creating section' });
  }
};

exports.deleteSection = async (req, res) => {
  try {
    const { id } = req.params;
    const section = await prisma.section.update({
      where: { id: parseInt(id) },
      data: { deletedAt: new Date() }
    });
    await logAction(req.user.userId, 'DELETE_SECTION', `Section: ${section.title}`);
    res.json({ message: 'Section and nested content deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting section' });
  }
};

// --- Lessons ---
exports.createLesson = async (req, res) => {
  try {
    const { sectionId, title, orderIndex } = req.body;
    const lesson = await prisma.lesson.create({
      data: {
        sectionId: parseInt(sectionId),
        title,
        orderIndex: parseInt(orderIndex)
      }
    });
    await logAction(req.user.userId, 'CREATE_LESSON', `Lesson: ${lesson.title}`, { sectionId });
    res.status(201).json(lesson);
  } catch (err) {
    res.status(500).json({ message: 'Error creating lesson' });
  }
};

exports.getLesson = async (req, res) => {
  try {
    const { id } = req.params;
    const lesson = await prisma.lesson.findUnique({
      where: { id: parseInt(id) },
      include: {
        materials: true,
        assignments: {
          where: { deletedAt: null }
        }
      }
    });
    
    if (!lesson || lesson.deletedAt) {
      return res.status(404).json({ message: 'Lesson not found' });
    }
    
    res.json(lesson);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching lesson' });
  }
};

// --- Materials ---
exports.addMaterial = async (req, res) => {
  try {
    const { type, url, originalName, fileSize, sectionId, lessonId } = req.body;
    const material = await prisma.material.create({
      data: {
        type,
        url,
        originalName,
        fileSize: fileSize ? parseInt(fileSize) : null,
        sectionId: sectionId ? parseInt(sectionId) : null,
        lessonId: lessonId ? parseInt(lessonId) : null
      }
    });
    res.status(201).json(material);
  } catch (err) {
    res.status(500).json({ message: 'Error adding material' });
  }
};

// --- Assignments ---
exports.createAssignment = async (req, res) => {
  try {
    const { lessonId, title, description, exerciseFileUrl } = req.body;
    const assignment = await prisma.assignment.create({
      data: {
        lessonId: parseInt(lessonId),
        title,
        description,
        exerciseFileUrl
      }
    });
    res.status(201).json(assignment);
  } catch (err) {
    res.status(500).json({ message: 'Error creating assignment' });
  }
};
