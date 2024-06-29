const fs = require("fs").promises;
const multer = require("multer");
const express = require("express");
const path = require("path");
const router = express.Router();
const User = require("../../database-models/user-model");
const UserStatus = require("../../database-models/user_statuses_model");
const {
  ensureAuthenticated,
  ensureUser,
  ensureAdmin,
} = require("../../middleware/authMiddleware");

// Configuration de Multer pour l'upload de fichiers
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "../../public/images/user-profile-images"));
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const upload = multer({ storage: storage });

router.get("/user_profile", ensureUser || ensureAdmin, async (req, res) => {
  try {
    const userId = req.session.passport.user;
    console.log("Session User ID:", userId);

    const user = await User.findById(userId);

    if (!user) {
      console.log("User not found for ID:", userId);
      return res.status(404).send("User not found");
    }

    console.log("User profile retrieved successfully:", user);

    res.render("user_profile", {
      firstname: user.firstname,
      lastname: user.lastname,
      pseudonym: user.pseudonym,
      age: user.age,
      description: user.description,
      literary_preferences: user.literary_preferences || [],
      profile_pic: user.profile_pic || "default_profile_1.jpg",
      friend_requests: user.friend_requests,
      user_friends: user.friends,
      member_id: user._id,
    });
  } catch (err) {
    console.error("Error retrieving user profile:", err);
    res.status(500).send("Error retrieving user profile");
  }
});

router.post(
  "/user_profile/edit",
  ensureUser || ensureAdmin,
  upload.single("profile_pic"),
  express.json(),
  async (req, res) => {
    try {
      console.log("Received request to update profile");
      console.log("Request body:", req.body);

      const {
        lastname,
        firstname,
        age,
        description,
        literary_preferences,
        pseudonym,
      } = req.body;
      const userId = req.session.passport.user;

      console.log("User ID from session:", userId);

      const user = await User.findById(userId);
      if (!user) {
        return res
          .status(404)
          .json({ success: false, message: "User not found" });
      }

      console.log("User found:", user);

      user.set({
        lastname: lastname || user.lastname,
        firstname: firstname || user.firstname,
        age: age || user.age,
        description: description || user.description,
        literary_preferences: literary_preferences || user.literary_preferences,
        pseudonym: pseudonym || user.pseudonym,
        profile_pic: req.file
          ? `/user-profile-images/${req.file.filename}`
          : user.profile_pic,
      });

      const updatedUser = await user.save();
      console.log("User profile updated:", updatedUser);

      res.json({
        success: true,
        lastname: updatedUser.lastname,
        firstname: updatedUser.firstname,
        age: updatedUser.age,
        description: updatedUser.description,
        literary_preferences: updatedUser.literary_preferences,
        pseudonym: updatedUser.pseudonym,
        profile_pic: updatedUser.profile_pic,
      });
    } catch (err) {
      console.error("Error updating profile:", err);
      res
        .status(500)
        .json({ success: false, message: "Error retrieving or updating user" });
    }
  }
);

module.exports = router;

// router.get(
//   "/user_profile/:member_id",
//   ensureUser || ensureAdmin,
//   async (req, res) => {
//     try {
//       const user = await User.findOne({ email: req.session.user.email });
//       const all_user_friends = user.friends;
//       const request_profile_member_id = req.params.member_id;

//       for (const friend of all_user_friends) {
//         if (friend.member_id === request_profile_member_id) {
//           const friendUser = await User.findOne({ email: friend.friend_email });
//           return res.render("user_profile_visit", {
//             firstname: friendUser.firstname,
//             lastname: friendUser.lastname,
//             pseudonym: friendUser.pseudonym,
//             age: friendUser.user_profile[0].age,
//             description: friendUser.user_profile[0].description,
//             literary_preferences:
//               friendUser.user_profile[0].literary_preferences,
//             profile_pic: friendUser.user_profile[0].profile_pic,
//             user_friends: null,
//           });
//         }
//       }

//       res.status(404).send("Friend not found");
//     } catch (err) {
//       res.status(500).send("Error retrieving user or friend's profile");
//     }
//   }
// );

module.exports = router;
