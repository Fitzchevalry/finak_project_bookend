const mongoose = require("mongoose");
const uuid = require("uuid");

const userSchema = new mongoose.Schema({
  lastname: { type: String },
  firstname: { type: String },
  age: { type: String, default: "L'âge de raison ?" },
  pseudonym: { type: String, default: "Reader en Herbe" },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  // member_id: { type: String, default: uuid.v4 },
  description: { type: String, default: "Bonjour, bienvenue sur ma page !" },
  literary_preferences: { type: [String], default: [] },
  profile_pic: {
    type: String,
    default: "/user-profile-images/default_profile_1.jpg",
  },
  friends: [{ member_id: String, friend_name: String, profile_pic: String }],
  friend_requests: [
    { member_id: String, friend_name: String, profile_pic: String },
  ],
  role: { type: String, default: "user" },
  // book_schema: [bookSchema],
});

userSchema.methods.validPassword = function (password) {
  console.log(`Validating password for user with email: ${this.email}`);
  return password === this.password;
};

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
