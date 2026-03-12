const Post = require("../models/Post");
const Notification = require("../models/Notifications");

const likePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    const userId = req.user.id;
    if (!post) {
      return res.status(404).json({ message: 'Post not found', success: false });
    }

    if (post.likes.includes(userId)){
      post.likes = post.likes.filter(_id => _id.toString() !== userId.toString());
      post.likesCount = post.likes.length;
      await post.save();

      // Delete notification
      await Notification.deleteOne({ userId: post.user, type: "like", postId: post._id, read: false, likedBy: userId });
      
      return res.status(200).json({ message: 'Post unliked successfully', post, success: true });
    }

    post.likes.push(userId);
    post.likesCount = post.likes.length;
    await post.save();

    // Create notification
    const notification = new Notification({
        userId: post.user,
        type: "like",
        postId: post._id,
        likedBy: userId,
        read: false
    });
    await notification.save();

    return res.status(200).json({ message: 'Post liked successfully', post, success: true });
    
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: error.message, success: false });
  }
}

module.exports = { likePost }