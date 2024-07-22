const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const messageSchema = new Schema({
  roomId: { type: String, required: true },
  senderId: { type: String, required: true },
  receiverId: { type: String, required: true },
  message: { type: String, required: true },
  senderName: { type: String, required: true },
  senderProfilePic: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});
const Message = mongoose.model("Message", messageSchema);

module.exports = Message;
