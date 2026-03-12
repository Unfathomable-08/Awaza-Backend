const Comment = require('../models/Comment');
const Post = require('../models/Post');
const User = require('../models/User');
const Notification = require('../models/Notifications');

const createComment = async (req, res) => {
  try {
    const { content } = req.body;
    const post = await Post.findById(req.params.id);
    const userId = req.user.id;

    if (!post){
      return res.status(404).json({ message: 'Post not found', success: false })
    }

    const comment = new Comment({
      user: userId,
      post: req.params.id,
      content
    })

    await comment.save();

    post.commentsCount += 1;
    await post.save();

    // Create notification
    const notification = new Notification({
        userId: post.user,
        type: "comment",
        postId: post._id,
        commentedBy: userId,
        content: content,
        read: false
    });
    await notification.save();

    return res.status(201).json({ message: 'Comment created successfully', comment, success: true });
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: error.message, success: false });
  }
}

const getComments = async (req, res) => {
  try {
    const comments = await Comment.find({ post: req.params.id })
       .populate('user', 'username email avatar name')
       .sort({ createdAt: -1 });

    return res.status(200).json({ comments, success: true, message: 'Comments fetched successfully' });
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: error.message, success: false });
  }
}

const getComment = async (req, res) => {
   try {
     const comment = await Comment.findById(req.params.commentId).populate('user', 'username email avatar name');

     if (!comment){
        return res.status(404).json({ message: 'Comment not found', success: false });
     }

     return res.status(200).json({ comment, success: true, message: 'Comment fetched successfully' });
   } catch (error) {
     return res.status(500).json({ message: 'Server error', error: error.message, success: false });
   }
}

const updateComment = async (req, res) => {
   try{
      const { content } = req.body;
      const userId = req.user.id;
  
      const comment = await Comment.findById(req.params.commentId);
  
      if (!comment) {
         return res.status(404).json({ message: 'Comment not found', success: false });
      }

      if (comment.user.toString() !== userId){
         return res.status(401).json({ message: 'Not authorized', success: false });
      }

      comment.content = content || comment.content;
      await comment.save();

      return res.status(200).json({ message: 'Comment updated successfully', comment, success: true });
   } catch (error) {
      return res.status(500).json({ message: 'Server error', error: error.message, success: false });
   }
}

const deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.commentId);
    const userId = req.user.id;

    if (!comment){
      return res.status(404).json({ message: 'Comment not found', success: false });
    }

    if (comment.user.toString() !== userId){
      return res.status(401).json({ message: 'Not authorized', success: false });
    }

    await comment.deleteOne();

    // Delete notification
    await Notification.deleteOne({ userId: comment.user, type: "comment", postId: comment.post, read: false, commentedBy: userId });

    return res.status(200).json({ message: 'Comment deleted successfully', success: true });
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: error.message, success: false });
  }
}

const likeComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.commentId);
    const userId = req.user.id;

    if (!comment) {
      return res.status(404).json({ message: 'Comment not found', success: false });
    }

    if (comment.likes.includes(userId)) {
      comment.likes = comment.likes.filter(_id => _id.toString() !== userId.toString());
      comment.likesCount = comment.likes.length;
    }

    comment.likes.push(userId);
    comment.likesCount = comment.likes.length;

    await comment.save();

    // Create notification
    const notification = new Notification({
        userId: comment.user,
        type: "like",
        postId: comment.post,
        likedBy: userId,
        read: false
    });
    await notification.save();

    return res.status(200).json({ message: 'Comment liked successfully', comment, success: true });
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: error.message, success: false });
  }
}

const replyToComment = async (req, res) => {
   try {
     const { content } = req.body;
     const parentComment = await Comment.findById(req.params.commentId);
     const userId = req.user.id;

     if (!parentComment){
        return res.status(404).json({ message: 'Parent comment not found', success: false });
     }

     const comment = new Comment({
        user: req.user.id,
        post: req.params.id,
        content,
        parentComment: req.params.commentId,
        ancestors: [...parentComment.ancestors, parentComment._id]
      })

     await comment.save();

     // Create notification
     const notification = new Notification({
         userId: req.params.commentId,
         type: "comment",
         postId: parentComment.post,
         commentedBy: userId,
         content: content,
         read: false
     });
     await notification.save();

     return res.status(201).json({ message: 'Reply created successfully', comment, success: true });
   } catch (error) {
     return res.status(500).json({ message: 'Server error', error: error.message, success: false });
   }
}

module.exports = { createComment, getComments, updateComment, deleteComment, likeComment, getComment, replyToComment }