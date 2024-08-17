const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userMessagesSchema = new mongoose.Schema({
  user_email: { type: String, required: true },
  status_text: { type: String, required: true },
  firstname: { type: String, required: true },
  profile_pic: { type: String, required: true },
  friendComments: [{ type: Schema.Types.ObjectId, ref: "UserComment" }],
});

const UserMessage = mongoose.model("UserMessage", userMessagesSchema);
module.exports = UserMessage;
