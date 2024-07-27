const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
  receiverId: { type: String, required: true },
  senderId: { type: String, required: true },
  messageId: { type: mongoose.Schema.Types.ObjectId, required: true },
  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Notification", notificationSchema);
