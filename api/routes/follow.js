const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { followUser, unfollowUser, getFollowers, getFollowing, isFollowing } = require('../controllers/followController');

router.post('/:id/follow', protect, followUser);
router.post('/:id/unfollow', protect, unfollowUser);
router.get('/:id/followers', protect, getFollowers);
router.get('/:id/following', protect, getFollowing);
router.get('/:id/is-following', protect, isFollowing);

module.exports = router;