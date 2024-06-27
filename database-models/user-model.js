const mongoose = require("mongoose");
const uuid = require("uuid");

const userSchema = mongoose.Schema({
  lastname: { type: String },
  firstname: { type: String },
  age: { type: String, default: "L'âge de raison ?" },
  pseudonym: { type: String, default: "Reader en Herbe" },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  member_id: { type: String, default: uuid.v4 },
  description: { type: String, default: "Bonjour, bienvenue sur ma page !" },
  literary_preferences: { type: [String], default: [] },
  profile_pic: {
    type: String,
    default: "default_profile_1.jpg",
  },
  friends: [{ member_id: String, friend_name: String, profile_pic: String }],
  friend_requests: [
    { member_id: String, friend_name: String, profile_pic: String },
  ],
  // book_schema: [bookSchema],
});

const User = mongoose.model("User", userSchema);
module.exports = User;

// const bookSchema = new mongoose.Schema(
//   {
//     title: { type: String },
//     author: { type: String },
//     readDate: { type: Date, default: Date.now },
//     rating: { type: Number, min: 1, max: 5, default: 3 },
//     review: { type: String, default: "" },
//   },
//   {
//     _id: false,
//   }
// );
