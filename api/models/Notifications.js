const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    type: {
        type: String,
        enum: ["like", "comment", "follow", "mention", "message", "post", "other"],
        required: true
    },
    read: {
        type: Boolean,
        default: false
    },

    // For type: like - postId, userId
    postId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Post",
        default: null
    },
    likedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null
    },

    // For type: comment - content, userId, postId
    content: {
        type: String,
        default: ""
    },
    commentedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null
    },
    postId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Post",
        default: null
    },

    // For type: follow - userId
    followedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null
    }

    // No need for mention, message, post, other as it is for future only

}, {timestamps: true})

module.exports = mongoose.model("Notification", notificationSchema);