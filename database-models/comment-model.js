//EN COURS...

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const commentSchema = new mongoose.Schema(
  {
    user_email: { type: String, required: true },
    comment_text: { type: String, required: true },
    firstname: { type: String },
    profile_pic: { type: String },
    rating: { type: Number, min: 1, max: 5 },
    status_id: {
      type: Schema.Types.ObjectId,
      ref: "UserStatus",
      required: true,
    },
  },
  { timestamps: true }
);

const Comment = mongoose.model("Comment", commentSchema);

module.exports = Comment;
