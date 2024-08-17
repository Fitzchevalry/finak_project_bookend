const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userCommentSchema = new mongoose.Schema({
  user_email: { type: String, required: true },
  user_comment_text: { type: String, required: true },
  firstname: { type: String },
  profile_pic: { type: String },
  userMessage_id: {
    type: Schema.Types.ObjectId,
    ref: "UserMessage",
    required: true,
  },
});

const UserComment = mongoose.model("UserComment", userCommentSchema);
module.exports = UserComment;
