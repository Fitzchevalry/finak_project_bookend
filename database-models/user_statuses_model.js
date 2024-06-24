const mongoose = require("mongoose");

const userStatusSchema = mongoose.Schema({
  user_email: String,
  user_status: String,
  pseudonym: String,
  profile_pic: String,
  status_date: { type: Date, default: Date.now },
});

const UserStatus = mongoose.model("UserStatus", userStatusSchema);
module.exports = UserStatus;
