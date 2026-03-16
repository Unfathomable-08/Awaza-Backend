const Notification = require('../models/Notifications');

// Get Notifications
const getNotifications = async (req, res) => {
    try {
        const userId = req.user.id;

        // Step 1: Count unread
        const unreadCount = await Notification.countDocuments({
            userId,
            read: false
        });

        let notifications;

        // Step 2: Fetch notifications based on unread count
        if (unreadCount > 25) {
            // Case: many unread -> return ALL unread, newest first
            notifications = await Notification
                .find({ userId, read: false })
                .sort({ createdAt: -1 })
                .populate('user', 'username avatar name')
                .populate('postId', 'title content')
                .populate('commentedBy', 'username avatar name')
                .populate('likedBy', 'username avatar name')
                .lean()
                .exec();
        } else {
            // Case: few unread (≤25) -> return the 25 most recent messages overall
            notifications = await Notification
                .find({ userId })
                .sort({ createdAt: -1 })
                .limit(25)
                .populate('user', 'username avatar name')
                .populate('postId', 'title content')
                .populate('commentedBy', 'username avatar name')
                .populate('likedBy', 'username avatar name')
                .lean()
                .exec();
        }

        res.status(200).json({
            notifications,
            length: notifications.length,
            unreadCount,
            mode: unreadCount > 25 ? 'unread' : 'all'
        });

    } catch (error) {
        console.error('Error getting notifications:', error);
        res.status(500).json({ message: 'Server error' });
    }
}

// Mark all previous notifications as read
const markAllPreviousNotificationsAsRead = async (req, res) => {
    //Frontend will send start message and last message id
    //Then we will mark all notifications between start and last message id as read    
    try {
        const { startId, endId } = req.body;
        const notifications = await Notification.find({ userId: req.user.id, _id: { $gte: startId, $lte: endId }, read: false });
        notifications.forEach(notification => {
            notification.read = true;
            notification.save();
        });
        res.status(200).json({ message: 'All previous notifications marked as read' });
    } catch (error) {
        console.error('Error marking all previous notifications as read:', error);
        res.status(500).json({ message: 'Server error' });
    }
}

module.exports = {
    getNotifications,
    markAllPreviousNotificationsAsRead
}