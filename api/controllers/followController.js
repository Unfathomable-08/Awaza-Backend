const User = require('../models/User');

// Follow a user
const followUser = async (req, res) => {
  try {
    const userToFollow = await User.findById(req.params.id);
    if (!userToFollow) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (userToFollow._id.toString() === req.user.id) {
      return res.status(400).json({ message: 'You cannot follow yourself' });
    }

    if (req.user.following.includes(userToFollow._id)) {
      return res.status(400).json({ message: 'You are already following this user' });
    }

    req.user.following.push(userToFollow._id);
    await req.user.save();

    userToFollow.followers.push(req.user._id);
    await userToFollow.save();

    res.json({ message: 'User followed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Unfollow a user
const unfollowUser = async (req, res) => {
  try {
    const userToUnfollow = await User.findById(req.params.id);
    if (!userToUnfollow) {
      return res.status(404).json({ message: 'User not found' });
    }

    req.user.following = req.user.following.filter(
      (id) => id.toString() !== userToUnfollow._id.toString()
    );
    await req.user.save();

    userToUnfollow.followers = userToUnfollow.followers.filter(
      (id) => id.toString() !== req.user._id.toString()
    );
    await userToUnfollow.save();

    res.json({ message: 'User unfollowed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Get followers of a user
const getFollowers = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate('followers', 'username name avatar');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user.followers);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Get following of a user
const getFollowing = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate('following', 'username name avatar');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user.following);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Check if current user is following a specific user
const isFollowing = async (req, res) => {
  try {
    const userToCheck = await User.findById(req.params.id);
    if (!userToCheck) {
      return res.status(404).json({ message: 'User not found' });
    }

    const following = req.user.following.includes(userToCheck._id);

    res.json({ isFollowing: following });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  followUser,
  unfollowUser,
  getFollowers,
  getFollowing,
  isFollowing
};
