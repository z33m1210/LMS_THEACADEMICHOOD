const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { verifyToken } = require('../middleware/authMiddleware');

// Configure Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|pdf|docx|msword|vnd.openxmlformats-officedocument.wordprocessingml.document/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (extname || mimetype) {
      return cb(null, true);
    }
    cb(new Error('Only images, PDF and DOCX files are allowed'));
  }
});

router.post('/upload', verifyToken, (req, res) => {
  upload.single('image')(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      console.error('Multer error:', err);
      return res.status(500).json({ message: 'Multer error', error: err.message });
    } else if (err) {
      console.error('Unknown upload error:', err);
      return res.status(500).json({ message: 'Unknown upload error', error: err.message });
    }

    try {
      if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }
      const url = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
      res.json({ url });
    } catch (err) {
      console.error('Error generating URL:', err);
      res.status(500).json({ message: 'Upload failed' });
    }
  });
});

module.exports = router;
