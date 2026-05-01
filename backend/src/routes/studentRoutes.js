const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');
const progressController = require('../controllers/progressController');
const { verifyToken, checkRole } = require('../middleware/authMiddleware');

router.use(verifyToken);
router.use(checkRole(['STUDENT', 'ADMIN'])); // Admin can also view for debugging

router.get('/my-courses', studentController.getMyCourses);
router.get('/my-submissions', studentController.getMySubmissions);
router.post('/progress/toggle', progressController.toggleLessonProgress);

module.exports = router;
