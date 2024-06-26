const mongoose = require("mongoose");
const uuid = require("uuid");

// const userProfileSchema = mongoose.Schema({
//   pseudonym: { type: String, default: "Lecteur en Herbe" },
//   age: { type: Number, default: "" },
//   description: { type: String, default: "Bonjour, bienvenue sur ma page !" },
//   literary_preferences: { type: [String], default: [] },
//   profile_pic: {
//     type: String,
//     default: "default_profile_1.jpg",
//   },
// });

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

const userSchema = mongoose.Schema({
  lastname: { type: String },
  firstname: { type: String },
  age: { type: Number, default: "Quel âge avez-vous ?" },
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
  // user_profile: [userProfileSchema],
  // book_schema: [bookSchema],
});

const User = mongoose.model("User", userSchema);
module.exports = User;
