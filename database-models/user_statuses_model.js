const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userStatusSchema = new mongoose.Schema({
  user_email: String,
  user_status: String,
  firstname: String,
  profile_pic: String,
  status_date: { type: Date, default: Date.now },
  comments: [{ type: Schema.Types.ObjectId, ref: "Comment" }],
});

const UserStatus = mongoose.model("UserStatus", userStatusSchema);
module.exports = UserStatus;
