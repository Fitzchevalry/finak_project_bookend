//EN COURS...

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const commentSchema = new mongoose.Schema({
  user_email: { type: String, required: true },
  comment_text: { type: String, required: true },
  status_id: { type: Schema.Types.ObjectId, ref: "UserStatus", required: true },
  firstname: { type: String },
  profile_pic: { type: String },
});

const Comment = mongoose.model("Comment", commentSchema);

module.exports = Comment;
