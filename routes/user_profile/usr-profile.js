const express = require("express");
const router = express.Router();
const User = require("../../database-models/user-model");
const simpleCookieStrategy = require("../../middleware/authMiddleware");

router.get("/user_profile", simpleCookieStrategy, async (req, res) => {
  try {
    if (!req.session.user || !req.session.user.email) {
      return res.redirect("/");
    }

    console.log("Session User Email:", req.session.user.email);
    const user = await User.findOne({ email: req.session.user.email });
    if (!user) {
      console.log("User not found for email:", req.session.user.email);
      return res.status(404).send("User not found");
    }

    console.log("User profile retrieved successfully:", user);
    res.render("user_profile", {
      firstname: user.firstname,
      lastname: user.lastname,
      pseudonym: user.pseudonym || "None",
      age: user.age || "Quel Age avez-vous ?",
      description: user.description || "None",
      literary_preferences: user.literary_preferences || [],
      profile_pic: user.profile_pic || "default_profile_1.jpg",
      friend_requests: user.friend_requests,
      user_friends: user.friends,
      member_id: req.session.user.member_id,
    });
  } catch (err) {
    console.error("Error retrieving user profile:", err);
    res.status(500).send("Error retrieving user profile");
  }
});

router.post("/user_profile/edit", simpleCookieStrategy, async (req, res) => {
  try {
    const {
      lastname,
      firstname,
      age,
      description,
      literary_preferences,
      pseudonym,
    } = req.body;
    const userEmail = req.session.user.email;
    console.log("User email from session:", userEmail);

    const user = await User.findOne({ email: userEmail });
    if (!user) {
      console.log("User not found for email:", userEmail);
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    console.log("User found:", user);
    console.log("Received request to update profile. Request body:", req.body);

    // Utilisation de set pour mettre à jour les champs dans user
    user.set({
      lastname: lastname || user.lastname,
      firstname: firstname || user.firstname,
      age: age || user.age,
      description: description || user.description,
      literary_preferences: literary_preferences || user.literary_preferences,
      pseudonym: pseudonym || user.pseudonym,
    });

    // Sauvegarde du document mis à jour
    const updatedUser = await user.save();
    console.log("User profile updated:", updatedUser);

    res.status({
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
});

// router.post("/profile_pic/upload", simpleCookieStrategy, async (req, res) => {
//   const user_profile_image =
//     "user_" +
//     req.session.user.member_id +
//     "_" +
//     uuidv4() +
//     "." +
//     req.body.image_type;

//   try {
//     await fs.promises.writeFile(
//       "user_profile_images/" + user_profile_image,
//       Buffer.from(req.body.image_data, "base64")
//     );

//     const user = await User.findOne({ email: req.session.user.email });
//     user.user_profile[0].profile_pic = user_profile_image;
//     await user.save();

//     await UserStatus.updateOne(
//       { user_email: req.session.user.email },
//       { profile_pic: user_profile_image }
//     );

//     res.send(user_profile_image);
//   } catch (err) {
//     console.error("Error uploading profile picture:", err);
//     res.status(500).send("Error uploading or saving profile picture");
//   }
// });

// router.get(
//   "/user_profile/:member_id",
//   simpleCookieStrategy,
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
