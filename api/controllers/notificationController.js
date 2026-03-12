const User = require('../models/User');
const admin = require('firebase-admin');

// Save Token to DB
const saveToken = async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) {
      return res.status(400).json({ message: 'Token is required' });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Add token if it doesn't exist
    if (!user.fcmTokens.includes(token)) {
      user.fcmTokens.push(token);
      await user.save();
    }

    res.status(200).json({ message: 'Token saved successfully' });
  } catch (error) {
    console.error('Error saving FCM token:', error);
    res.status(500).json({ message: 'Server error' });
  }
}

// Delete Token from DB when user disables notifications
const deleteToken = async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) {
      return res.status(400).json({ message: 'Token is required' });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.fcmTokens = user.fcmTokens.filter(t => t !== token);
    await user.save();

    res.status(200).json({ message: 'Token removed successfully' });
  } catch (error) {
    console.error('Error removing FCM token:', error);
    res.status(500).json({ message: 'Server error' });
  }
}

// Send Notification from Backend to User
const sendNotification = async (req, res) => {
  try {
    const { recipientId, title, body, data } = req.body;
    
    if (!recipientId || !title) {
      return res.status(400).json({ message: 'Recipient ID and title are required' });
    }

    const recipient = await User.findById(recipientId);
    if (!recipient) {
      return res.status(404).json({ message: 'Recipient not found' });
    }

    const tokens = recipient.fcmTokens;
    if (!tokens || tokens.length === 0) {
      // User has no registered tokens
      return res.status(200).json({ message: 'User has no registered devices for notifications' });
    }

    // Prepare message payload
    const message = {
      notification: {
        title,
        body: body || '',
      },
      webpush: {
        notification: {
          icon: data?.icon || 'https://awaza-social.vercel.app/pwa-192x192.png',
        }
      },
      data: data || {},
      tokens: tokens,
    };

    // Initialize admin if not yet done and if env vars exist (this acts as a safety fallback)
    if (!admin.apps.length) {
      // Typically it should be initialized in server.js 
      return res.status(500).json({ message: 'Firebase Admin not initialized properly' });
    }

    // Send multicast message
    const response = await admin.messaging().sendEachForMulticast(message);
    
    // Clean up failed tokens (e.g., unregistered/expired tokens)
    if (response.failureCount > 0) {
      const failedTokens = [];
      response.responses.forEach((resp, idx) => {
        if (!resp.success) {
          failedTokens.push(tokens[idx]);
        }
      });
      // Remove failed tokens from user
      if (failedTokens.length > 0) {
        recipient.fcmTokens = recipient.fcmTokens.filter(t => !failedTokens.includes(t));
        await recipient.save();
      }
    }

    res.status(200).json({ 
      message: 'Notifications sent', 
      successCount: response.successCount,
      failureCount: response.failureCount
    });

  } catch (error) {
    console.error('Error sending push notification:', error);
    res.status(500).json({ message: 'Server error' });
  }
}

module.exports = {
  saveToken,
  deleteToken,
  sendNotification,
};
