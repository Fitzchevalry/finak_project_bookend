const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const connectionSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  loginTime: { type: Date, default: Date.now },
  logoutTime: { type: Date },
});

const Connection = mongoose.model("Connection", connectionSchema);

module.exports = Connection;
