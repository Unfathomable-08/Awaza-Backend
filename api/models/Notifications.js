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

}, {timestamps: true})

module.exports = mongoose.model("Notification", notificationSchema);