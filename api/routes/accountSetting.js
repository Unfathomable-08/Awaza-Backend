const express = require('express');
const { protect } = require('../middleware/auth');
// import contrllers for update name and avatar in one function
const { updateAccountSettings } = require('../controllers/accountSettingController');
// import controller to get porfile data
const { getProfile } = require('../controllers/profileController');

const router = express.Router();

router.put('/update', protect, updateAccountSettings);
router.get('/get-profile', protect, getProfile);

module.exports = router;