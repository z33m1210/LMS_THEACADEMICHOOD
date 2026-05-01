const prisma = require('../utils/prisma');
const logAction = require('../utils/logger');
const { sanitize } = require('../utils/sanitizer');

// --- Courses ---
exports.getCourses = async (req, res) => {
  try {
    const courses = await prisma.course.findMany({ where: { deletedAt: null } });
    res.json(courses);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching courses' });
  }
};

exports.getCourseDetails = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.userId;

  try {
    const course = await prisma.course.findUnique({
      where: { id: parseInt(id) },
      include: {
        sections: {
          where: { deletedAt: null },
          orderBy: { orderIndex: 'asc' },
          include: {
            lessons: {
              where: { deletedAt: null },
              orderBy: { orderIndex: 'asc' },
              include: {
                materials: true,
                activities: { 
                  where: { deletedAt: null },
                  orderBy: { orderIndex: 'asc' }
                },
                progress: {
                  where: { studentId: userId }
                }
              }
            }
          }
        }
      }
    });

    if (!course) return res.status(404).json({ message: 'Course not found' });
    res.json(course);
  } catch (err) {
    console.error('Error fetching course details:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.createCourse = async (req, res) => {
  try {
    const { title, description, level, category, thumbnailUrl } = req.body;
    const course = await prisma.course.create({
      data: { title, description, level, category, thumbnailUrl }
    });
    await logAction(req.user.userId, 'CREATE_COURSE', `Course: ${course.title}`);
    res.status(201).json(course);
  } catch (err) {
    res.status(500).json({ message: 'Error creating course' });
  }
};

// --- Batches ---
exports.getBatches = async (req, res) => {
  try {
    const batches = await prisma.batch.findMany({
      where: { deletedAt: null },
      include: { course: true }
    });
    res.json(batches);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching batches' });
  }
};

exports.getBatchCurriculum = async (req, res) => {
  const { batchId } = req.params;
  try {
    const batch = await prisma.batch.findUnique({
      where: { id: parseInt(batchId) },
      include: {
        course: {
          include: {
            sections: {
              where: { deletedAt: null },
              orderBy: { orderIndex: 'asc' },
              include: {
                lessons: {
                  where: { deletedAt: null },
                  orderBy: { orderIndex: 'asc' },
                  include: {
                    activities: { 
                      where: { deletedAt: null },
                      orderBy: { orderIndex: 'asc' }
                    }
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

    if (!batch) return res.status(404).json({ message: 'Batch not found' });

    const sections = batch.course.sections.map(section => {
      const sectionOverride = batch.sectionOverrides.find(so => so.sectionId === section.id);
      
      return {
        ...section,
        title: sectionOverride?.title || section.title,
        description: sectionOverride?.description || section.description,
        isHidden: sectionOverride?.isHidden || false,
        lessons: section.lessons.map(lesson => {
          const lessonOverride = batch.lessonOverrides.find(lo => lo.lessonId === lesson.id);
          const activities = (lesson.activities || []).map(activity => {
            const activityOverride = (batch.activityOverrides || []).find(ao => ao.activityId === activity.id);
            return {
              ...activity,
              title: activityOverride?.title || activity.title,
              description: activityOverride?.description || activity.description,
              longContent: undefined,
              exerciseFileUrl: activityOverride?.exerciseFileUrl || activity.exerciseFileUrl,
              isHidden: (activityOverride && activityOverride.isHidden !== undefined && activityOverride.isHidden !== null) 
                ? activityOverride.isHidden 
                : activity.isHidden
            };
          });

          return {
            ...lesson,
            title: lessonOverride?.title || lesson.title,
            content: lessonOverride?.content || lesson.content,
            videoUrl: lessonOverride?.videoUrl || null,
            pdfUrl: lessonOverride?.pdfUrl || null,
            activities
          };
        })
      };
    });

    res.json({ 
      id: batch.id,
      name: batch.name,
      courseTitle: batch.course.title,
      sections 
    });
  } catch (err) {
    console.error('Error fetching batch curriculum:', err);
    res.status(500).json({ message: 'Error fetching batch curriculum' });
  }
};

exports.createBatch = async (req, res) => {
  try {
    const { name, courseId } = req.body;
    const batch = await prisma.batch.create({
      data: { name, courseId: parseInt(courseId) }
    });
    await logAction(req.user.userId, 'CREATE_BATCH', `Batch: ${batch.name}`);
    res.status(201).json(batch);
  } catch (err) {
    res.status(500).json({ message: 'Error creating batch' });
  }
};

exports.calculateAverageGrade = async (studentId, courseId) => {
  try {
    const submissions = await prisma.submission.findMany({
      where: {
        studentId,
        activity: { lesson: { section: { courseId } } },
        status: 'GRADED',
        deletedAt: null
      },
      select: { grade: true }
    });

    if (submissions.length === 0) return 0;

    const sum = submissions.reduce((acc, s) => acc + (s.grade || 0), 0);
    return Math.round(sum / submissions.length);
  } catch (err) {
    console.error('Error calculating average grade:', err);
    throw err;
  }
};

exports.completeLesson = async (req, res) => {
  const { lessonId } = req.body;
  const studentId = req.user.userId;

  try {
    const progress = await prisma.userProgress.upsert({
      where: {
        studentId_lessonId: {
          studentId,
          lessonId: parseInt(lessonId)
        }
      },
      update: { isCompleted: true },
      create: {
        studentId,
        lessonId: parseInt(lessonId),
        isCompleted: true
      }
    });

    const lesson = await prisma.lesson.findUnique({
      where: { id: parseInt(lessonId) },
      include: { section: true }
    });

    if (lesson) {
      const courseId = lesson.section.courseId;
      const sections = await prisma.section.findMany({
        where: { courseId, deletedAt: null },
        include: { lessons: { where: { deletedAt: null } } }
      });
      const allLessonIds = sections.flatMap(s => s.lessons).map(l => l.id);

      const completedCount = await prisma.userProgress.count({
        where: {
          studentId,
          lessonId: { in: allLessonIds },
          isCompleted: true
        }
      });

      if (completedCount === allLessonIds.length && allLessonIds.length > 0) {
        const finalScore = await exports.calculateAverageGrade(studentId, courseId);
        
        const existingCert = await prisma.certificate.findFirst({
          where: { studentId, courseId }
        });

        if (!existingCert) {
          await prisma.certificate.create({
            data: {
              studentId,
              courseId,
              finalScore,
              certificateUrl: `CERT-${studentId}-${courseId}-${Date.now()}.pdf`,
            }
          });
          
          await prisma.notification.create({
            data: {
              userId: studentId,
              message: `Congratulations! You've completed the course and earned your certificate with a weighted score of ${finalScore}/100!`,
              type: 'ACHIEVEMENT'
            }
          });
        }
      }
    }

    res.json(progress);
  } catch (err) {
    console.error('Error completing lesson:', err);
    res.status(500).json({ message: 'Error marking lesson as complete' });
  }
};

exports.getLessonProgress = async (req, res) => {
  const { id } = req.params;
  const studentId = req.user.userId;

  try {
    const progress = await prisma.userProgress.findUnique({
      where: {
        studentId_lessonId: {
          studentId,
          lessonId: parseInt(id)
        }
      }
    });
    res.json(progress || { isCompleted: false });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching lesson progress' });
  }
};

// --- Lesson Overrides ---
exports.upsertBatchLessonOverride = async (req, res) => {
  const { batchId, lessonId, title, content, videoUrl, pdfUrl } = req.body;
  try {
    const override = await prisma.batchLesson.upsert({
      where: { batchId_lessonId: { batchId: parseInt(batchId), lessonId: parseInt(lessonId) } },
      update: { title, content, videoUrl, pdfUrl },
      create: { batchId: parseInt(batchId), lessonId: parseInt(lessonId), title, content, videoUrl, pdfUrl }
    });
    res.json(override);
  } catch (err) {
    res.status(500).json({ message: 'Error saving lesson override' });
  }
};

exports.upsertBatchActivityOverride = async (req, res) => {
  const { batchId, activityId, title, description, longContent, exerciseFileUrl, isHidden } = req.body;
  try {
    const sanitizedContent = sanitize(longContent);
    const override = await prisma.batchActivity.upsert({
      where: { batchId_activityId: { batchId: parseInt(batchId), activityId: parseInt(activityId) } },
      update: { title, description, longContent: sanitizedContent, exerciseFileUrl, isHidden },
      create: { batchId: parseInt(batchId), activityId: parseInt(activityId), title, description, longContent: sanitizedContent, exerciseFileUrl, isHidden: isHidden || false }
    });
    res.json(override);
  } catch (err) {
    res.status(500).json({ message: 'Error saving activity override' });
  }
};

// --- Section Overrides ---
exports.upsertBatchSectionOverride = async (req, res) => {
  const { batchId, sectionId, title, description, isHidden } = req.body;
  try {
    const override = await prisma.batchSection.upsert({
      where: { 
        batchId_sectionId: { 
          batchId: parseInt(batchId), 
          sectionId: parseInt(sectionId) 
        } 
      },
      update: { title, description, isHidden },
      create: { 
        batchId: parseInt(batchId), 
        sectionId: parseInt(sectionId), 
        title, 
        description,
        isHidden: isHidden || false 
      }
    });
    res.json(override);
  } catch (err) {
    console.error('Error upserting batch section override:', err);
    res.status(500).json({ message: 'Error saving module override' });
  }
};

exports.deleteBatchSectionOverride = async (req, res) => {
  const { batchId, sectionId } = req.params;
  try {
    await prisma.batchSection.delete({
      where: { 
        batchId_sectionId: { 
          batchId: parseInt(batchId), 
          sectionId: parseInt(sectionId) 
        } 
      }
    });
    res.json({ message: 'Override deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting module override' });
  }
};

// --- Lesson CRUD ---
exports.createLesson = async (req, res) => {
  try {
    const { sectionId, title, content, orderIndex } = req.body;
    const lesson = await prisma.lesson.create({
      data: { 
        sectionId: parseInt(sectionId), 
        title, 
        content: content || '', 
        orderIndex: parseInt(orderIndex || 0) 
      }
    });
    await logAction(req.user.userId, 'CREATE_LESSON', `Lesson: ${lesson.title}`);
    res.status(201).json(lesson);
  } catch (err) {
    res.status(500).json({ message: 'Error creating lesson' });
  }
};

exports.updateLesson = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, orderIndex } = req.body;
    
    const updateData = { title, content };
    if (orderIndex !== undefined) {
      updateData.orderIndex = parseInt(orderIndex);
    }

    const lesson = await prisma.lesson.update({
      where: { id: parseInt(id) },
      data: updateData
    });
    await logAction(req.user.userId, 'UPDATE_LESSON', `Lesson: ${lesson.title}`);
    res.json(lesson);
  } catch (err) {
    console.error('Error updating lesson:', err);
    res.status(500).json({ message: 'Error updating lesson' });
  }
};

exports.deleteLesson = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.lesson.update({
      where: { id: parseInt(id) },
      data: { deletedAt: new Date() }
    });
    await logAction(req.user.userId, 'DELETE_LESSON', `Lesson ID: ${id}`);
    res.json({ message: 'Lesson deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting lesson' });
  }
};

// --- Section CRUD ---
exports.createSection = async (req, res) => {
  try {
    const { courseId, title, description, orderIndex } = req.body;
    const section = await prisma.section.create({
      data: {
        courseId: parseInt(courseId),
        title,
        description: description || '',
        orderIndex: parseInt(orderIndex || 0)
      }
    });
    await logAction(req.user.userId, 'CREATE_SECTION', `Section: ${section.title}`);
    res.status(201).json(section);
  } catch (err) {
    res.status(500).json({ message: 'Error creating module' });
  }
};

exports.deleteSection = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.section.update({
      where: { id: parseInt(id) },
      data: { deletedAt: new Date() }
    });
    await logAction(req.user.userId, 'DELETE_SECTION', `Section ID: ${id}`);
    res.json({ message: 'Module deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting module' });
  }
};

exports.getActivityDetails = async (req, res) => {
  const { batchId, activityId } = req.params;
  try {
    const activity = await prisma.activity.findUnique({
      where: { id: parseInt(activityId) }
    });
    const override = await prisma.batchActivity.findUnique({
      where: { batchId_activityId: { batchId: parseInt(batchId), activityId: parseInt(activityId) } }
    });

    if (!activity) return res.status(404).json({ message: 'Activity not found' });

    res.json({
      ...activity,
      title: override?.title || activity.title,
      description: override?.description || activity.description,
      longContent: override?.longContent || activity.longContent,
      exerciseFileUrl: override?.exerciseFileUrl || activity.exerciseFileUrl,
      isHidden: override?.isHidden !== null ? override.isHidden : activity.isHidden
    });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching activity details' });
  }
};

exports.createActivity = async (req, res) => {
  try {
    const { lessonId, title, type, description, orderIndex } = req.body;
    const activity = await prisma.activity.create({
      data: {
        lessonId: parseInt(lessonId),
        title: title || 'New Activity',
        type: type || 'PAGE',
        description: description || '',
        orderIndex: orderIndex !== undefined ? parseInt(orderIndex) : 0
      }
    });
    await logAction(req.user.userId, 'CREATE_ACTIVITY', `Activity: ${activity.title}`);
    res.status(201).json(activity);
  } catch (err) {
    console.error('Error creating activity:', err);
    res.status(500).json({ message: 'Error creating activity' });
  }
};
exports.deleteActivity = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.activity.delete({
      where: { id: parseInt(id) }
    });
    await logAction(req.user.userId, 'DELETE_ACTIVITY', `Deleted activity ID: ${id}`);
    res.json({ message: 'Activity deleted successfully' });
  } catch (err) {
    console.error('Error deleting activity:', err);
    res.status(500).json({ message: 'Error deleting activity' });
  }
};
