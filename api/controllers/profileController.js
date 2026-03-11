const User = require('../models/User');

// Get profile data
const getProfile = async (req, res) => {
  try {
    const user = await User.findOne({ username: req.query.username });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    const profileData = {
      avatar: user.avatar,
      followersCount: user.followers.length,
      followingCount: user.following.length,
      name: user.name,
      username: user.username,
      bio: user.bio
    };
    res.json(profileData);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getProfile
};
