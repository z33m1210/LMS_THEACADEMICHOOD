const express = require('express');
const router = express.Router();
const academicController = require('../controllers/academicController');
const { verifyToken, checkRole } = require('../middleware/authMiddleware');

router.use(verifyToken);

// Admin only for creation
router.get('/courses', academicController.getCourses);
router.get('/courses/:id', academicController.getCourseDetails);
router.post('/complete-lesson', academicController.completeLesson);
router.get('/lesson-progress/:id', academicController.getLessonProgress);
router.post('/courses', checkRole(['ADMIN']), academicController.createCourse);

router.get('/batches', academicController.getBatches);
router.post('/batches', checkRole(['ADMIN']), academicController.createBatch);
router.get('/batches/:batchId/curriculum', academicController.getBatchCurriculum);
router.get('/batches/:batchId/activities/:activityId', academicController.getActivityDetails);

// Batch Overrides (Teacher & Admin)
router.post('/batches/overrides/lesson', checkRole(['ADMIN', 'TEACHER']), academicController.upsertBatchLessonOverride);
router.post('/batches/overrides/activity', checkRole(['ADMIN', 'TEACHER']), academicController.upsertBatchActivityOverride);
router.post('/batches/overrides/section', checkRole(['ADMIN', 'TEACHER']), academicController.upsertBatchSectionOverride);
router.post('/activities', checkRole(['ADMIN', 'TEACHER']), academicController.createActivity);
router.delete('/activities/:id', checkRole(['ADMIN', 'TEACHER']), academicController.deleteActivity);
router.delete('/batches/overrides/section/:batchId/:sectionId', checkRole(['ADMIN', 'TEACHER']), academicController.deleteBatchSectionOverride);

// Lesson Management (Admin & Teacher)
router.post('/lessons', checkRole(['ADMIN', 'TEACHER']), academicController.createLesson);
router.put('/lessons/:id', checkRole(['ADMIN', 'TEACHER']), academicController.updateLesson);
router.delete('/lessons/:id', checkRole(['ADMIN', 'TEACHER']), academicController.deleteLesson);

// Section/Module Management (Admin & Teacher)
router.post('/sections', checkRole(['ADMIN', 'TEACHER']), academicController.createSection);
router.delete('/sections/:id', checkRole(['ADMIN', 'TEACHER']), academicController.deleteSection);

module.exports = router;
