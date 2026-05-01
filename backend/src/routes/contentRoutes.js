const express = require('express');
const router = express.Router();
const contentController = require('../controllers/contentController');
const upload = require('../middleware/uploadMiddleware');
const { verifyToken, checkRole } = require('../middleware/authMiddleware');

router.use(verifyToken);

// Sections
router.post('/sections', checkRole(['ADMIN', 'TEACHER']), contentController.createSection);
router.delete('/sections/:id', checkRole(['ADMIN', 'TEACHER']), contentController.deleteSection);

// Lessons
router.get('/lessons/:id', contentController.getLesson);
router.post('/lessons', checkRole(['ADMIN', 'TEACHER']), contentController.createLesson);

// Materials & Uploads
router.post('/materials', checkRole(['ADMIN', 'TEACHER']), contentController.addMaterial);

router.post('/upload', checkRole(['ADMIN', 'TEACHER']), upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
  res.json({
    url: `/uploads/${req.file.filename}`,
    originalName: req.file.originalname,
    fileSize: req.file.size
  });
});

// Assignments
router.post('/assignments', checkRole(['ADMIN', 'TEACHER']), contentController.createAssignment);

module.exports = router;
