const mongoose = require("mongoose");

const userStatusSchema = new mongoose.Schema(
  {
    user_email: { type: String, required: true },
    user_status: { type: String, required: true },
    book_title: { type: String, required: true },
    book_author: { type: String, required: true },
    publication_date: { type: Date, required: true },
    initial_rating: { type: Number, min: 1, max: 5 }, // Note donnée par le premier utilisateur
    rating: { type: Number, default: 0 }, // Note moyenne affichée
    book_summary: { type: String, required: true },
    firstname: { type: String, required: true },
    profile_pic: { type: String, required: true },
    comments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Comment" }],
  },
  { timestamps: true }
);

const UserStatus = mongoose.model("UserStatus", userStatusSchema);
module.exports = UserStatus;
