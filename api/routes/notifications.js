const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { saveToken, deleteToken, sendNotification } = require('../controllers/notificationController');

// === Ensure firebase-admin is initialized in server.js or somewhere before using ===

router.post('/token', protect, saveToken);
router.delete('/token', protect, deleteToken);
router.post('/send', protect, sendNotification);

module.exports = router;