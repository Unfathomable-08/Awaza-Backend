require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const admin = require('firebase-admin');
const authRoutes = require('./routes/auth');
const postRoutes = require('./routes/post');
const actionRoutes = require('./routes/actions');
const inboxRoutes = require('./routes/inbox');
const accountSettingRoutes = require('./routes/accountSetting');
const followRoutes = require('./routes/follow');
const notificationRoutes = require('./routes/notifications');
const otherNotificationRoutes = require('./routes/otherNotification');

const app = express();

connectDB();

// Initialize Firebase Admin SDK
try {
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      });
      console.log('Firebase Admin SDK initialized successfully');
    }
  } else {
    console.warn('FIREBASE_SERVICE_ACCOUNT environment variable is not set. Push notifications will not work.');
  }
} catch (error) {
  console.error('Failed to initialize Firebase Admin SDK:', error.message);
}

app.use(cors({
  origin: '*',
  exposedHeaders: ['Authorization', 'X-Auth-Token']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.json({
    message: 'Social Media App Backend API',
    version: '1.0.0',
    endpoints: {
      auth: {
        signup: 'POST /api/auth/signup',
        login: 'POST /api/auth/login',
        verifyEmail: 'GET /api/auth/verify-email/:token',
        resendVerification: 'POST /api/auth/resend-verification',
        getProfile: 'GET /api/auth/me'
      }
    }
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/actions', actionRoutes);
app.use('/api/inbox', inboxRoutes);
app.use('/api/account', accountSettingRoutes);
app.use('/api/follow', followRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/other-notifications', otherNotificationRoutes);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!', error: err.message });
});

app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
