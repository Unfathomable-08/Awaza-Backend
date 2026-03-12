const express = require('express');
const router = express.Router();
const { getNotifications, markAllPreviousNotificationsAsRead } = require('../controllers/otherNotificationController');
const { protect } = require('../middleware/auth');

router.get('/', protect, getNotifications);
router.post('/mark-read', protect, markAllPreviousNotificationsAsRead);

module.exports = router;