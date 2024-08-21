const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const uuid = require("uuid");
const argon2 = require("argon2");

const userSchema = new mongoose.Schema({
  lastname: { type: String },
  firstname: { type: String },
  age: { type: String, default: "L'âge de raison ?" },
  pseudonym: { type: String, default: "Reader en Herbe" },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  resetPasswordToken: { type: String },
  resetPasswordExpires: { type: Date },
  member_id: { type: String, default: uuid.v4 },
  description: { type: String, default: "Bonjour, bienvenue sur ma page !" },
  literary_preferences: { type: [String], default: [] },
  profile_pic: {
    type: String,
    default: "/user-profile-images/default_profile_1.jpg",
  },
  friends: [
    {
      member_id: String,
      friend_firstname: String,
      friend_lastname: String,
      profile_pic: String,
      email: String,
    },
  ],
  friend_requests: [
    {
      member_id: String,
      friend_firstname: String,
      friend_lastname: String,
      profile_pic: String,
      email: String,
    },
  ],
  sent_friend_requests: [
    {
      member_id: String,
      friend_firstname: String,
      friend_lastname: String,
      profile_pic: String,
      email: String,
    },
  ],
  role: { type: String, default: "user" },
  userStatuses: [{ type: Schema.Types.ObjectId, ref: "UserStatus" }],
  userMessage: [{ type: Schema.Types.ObjectId, ref: "UserMessage" }],
});

// Middleware pré-enregistrement pour le hachage du mot de passe
userSchema.pre("save", async function (next) {
  if (this.isModified("password") || this.isNew) {
    try {
      this.password = await argon2.hash(this.password);
    } catch (err) {
      return next(err);
    }
  }
  next();
});

// Méthode pour vérifier le mot de passe
userSchema.methods.validPassword = async function (password) {
  try {
    return await argon2.verify(this.password, password);
  } catch (err) {
    throw new Error("Password verification failed");
  }
};

const User = mongoose.model("User", userSchema);
module.exports = User;
