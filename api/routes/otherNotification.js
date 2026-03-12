const express = require('express');
const router = express.Router();
const { getNotifications, markAllPreviousNotificationsAsRead } = require('../controllers/otherNotificationController');
const authMiddleware = require('../middleware/auth');

router.get('/', authMiddleware, getNotifications);
router.post('/mark-read', authMiddleware, markAllPreviousNotificationsAsRead);

module.exports = router;