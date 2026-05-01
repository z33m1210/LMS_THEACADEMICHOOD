const express = require('express');
const router = express.Router();
const achievementController = require('../controllers/achievementController');
const { verifyToken } = require('../middleware/authMiddleware');

router.use(verifyToken);

router.get('/my-certificates', achievementController.getMyCertificates);

module.exports = router;
