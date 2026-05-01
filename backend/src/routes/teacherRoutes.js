const express = require('express');
const router = express.Router();
const teacherController = require('../controllers/teacherController');
const { verifyToken, checkRole } = require('../middleware/authMiddleware');

router.use(verifyToken);
router.use(checkRole(['TEACHER', 'ADMIN']));

router.get('/dashboard', teacherController.getTeacherDashboard);
router.get('/batches/:id/students', teacherController.getBatchStudents);

module.exports = router;
