const express = require('express');
const router = express.Router();
const submissionController = require('../controllers/submissionController');
const { verifyToken, checkRole } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// Student Routes
router.post('/submit', verifyToken, checkRole(['STUDENT']), upload.single('file'), submissionController.submitAssignment);
router.get('/lesson/:lessonId', verifyToken, checkRole(['STUDENT']), submissionController.getLessonSubmission);
router.get('/notifications', verifyToken, submissionController.getNotifications);
router.put('/notifications/read', verifyToken, submissionController.markNotificationsRead);

// Teacher Routes
router.get('/pending', verifyToken, checkRole(['TEACHER', 'ADMIN']), submissionController.getPendingSubmissions);
router.post('/grade/:submissionId', verifyToken, checkRole(['TEACHER', 'ADMIN']), submissionController.gradeSubmission);

module.exports = router;
