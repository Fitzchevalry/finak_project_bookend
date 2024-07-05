// EN COURS...

const fs = require("fs").promises;
const multer = require("multer");
const express = require("express");
const path = require("path");
const router = express.Router();
const User = require("../../database-models/user-model");
const UserStatus = require("../../database-models/user_statuses_model");
const Comment = require("../../database-models/comment-model");

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

// GET /user_profile
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

    const userFriends = user.friends.map((friend) => friend.member_id);
    const userStatuses = await UserStatus.find({
      user_email: req.session.user.email,
    }).populate("comments");
    const suggestionFriends = await User.find({
      _id: { $ne: userId },
      role: "user",
      member_id: { $nin: [...userFriends, userId] },
    }).limit(3);
    const currentUser = await User.findOne({ email: req.user.email });

    const sentFriendRequests = currentUser.sent_friend_requests.map(
      (req) => req.member_id
    );

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
      suggestionFriends: suggestionFriends,
      userStatuses: userStatuses,
      sentFriendRequests,
    });
  } catch (err) {
    console.error("Error retrieving user profile:", err);
    res.status(500).send("Error retrieving user profile");
  }
});

// POST /user_profile/edit
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

      // Mise à jour des informations de l'utilisateur
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

      // Mise à jour des amis
      const friendUpdates = user.friends.map(async (friend) => {
        console.log(`Updating friend with member_id: ${friend.member_id}`);
        const friendUser = await User.findOne({ member_id: friend.member_id });
        if (friendUser) {
          console.log(`Found friend user: ${friendUser.email}`);
          const friendIndex = friendUser.friends.findIndex(
            (f) => f.member_id.toString() === user.member_id.toString()
          );

          if (friendIndex !== -1) {
            console.log(`Updating friend info for ${friendUser.email}`);
            friendUser.friends[friendIndex].friend_email = updatedUser.email;
            friendUser.friends[friendIndex].friend_name = updatedUser.firstname;
            friendUser.friends[friendIndex].profile_pic =
              updatedUser.profile_pic;

            await friendUser.save();
            console.log(`Friend info updated for ${friendUser.email}`);
          } else {
            console.log(`Friend index not found for ${friendUser.email}`);
          }
        } else {
          console.log(
            `Friend user not found with member_id: ${friend.member_id}`
          );
        }
      });

      // Mise à jour des requêtes d'amis reçues
      const requestUpdates = user.friend_requests.map(async (request) => {
        console.log(
          `Updating pending request for member_id: ${request.member_id}`
        );
        const requestUser = await User.findOne({
          member_id: request.member_id,
        });
        if (requestUser) {
          console.log(`Found user with pending request: ${requestUser.email}`);
          const requestIndex = requestUser.friend_requests.findIndex(
            (r) => r.member_id.toString() === user.member_id.toString()
          );

          if (requestIndex !== -1) {
            console.log(
              `Updating pending request info for ${requestUser.email}`
            );
            requestUser.friend_requests[requestIndex].friend_email =
              updatedUser.email;
            requestUser.friend_requests[requestIndex].friend_name =
              updatedUser.firstname;
            requestUser.friend_requests[requestIndex].profile_pic =
              updatedUser.profile_pic;

            await requestUser.save();
            console.log(
              `Pending request info updated for ${requestUser.email}`
            );
          } else {
            console.log(
              `Pending request index not found for ${requestUser.email}`
            );
          }
        } else {
          console.log(
            `User with pending request not found: ${request.member_id}`
          );
        }
      });

      // Mise à jour des requêtes d'amis envoyées
      const sentRequestUpdates = user.sent_friend_requests.map(
        async (sentRequest) => {
          console.log(
            `Updating sent request for member_id: ${sentRequest.member_id}`
          );
          const sentRequestUser = await User.findOne({
            member_id: sentRequest.member_id,
          });
          if (sentRequestUser) {
            console.log(
              `Found user with sent request: ${sentRequestUser.email}`
            );
            const sentRequestIndex = sentRequestUser.friend_requests.findIndex(
              (r) => r.member_id.toString() === user.member_id.toString()
            );

            if (sentRequestIndex !== -1) {
              console.log(
                `Updating sent request info for ${sentRequestUser.email}`
              );
              sentRequestUser.friend_requests[sentRequestIndex].friend_email =
                updatedUser.email;
              sentRequestUser.friend_requests[sentRequestIndex].friend_name =
                updatedUser.firstname;
              sentRequestUser.friend_requests[sentRequestIndex].profile_pic =
                updatedUser.profile_pic;

              await sentRequestUser.save();
              console.log(
                `Sent request info updated for ${sentRequestUser.email}`
              );
            } else {
              console.log(
                `Sent request index not found for ${sentRequestUser.email}`
              );
            }
          } else {
            console.log(
              `User with sent request not found: ${sentRequest.member_id}`
            );
          }
        }
      );

      await Promise.all([
        ...friendUpdates,
        ...requestUpdates,
        ...sentRequestUpdates,
      ]);
      console.log("All friend and request updates completed");

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

// POST friend_request
router.post(
  "/profile_friend_request",
  ensureAuthenticated,
  async (req, res) => {
    try {
      const sendingUser = await User.findOne({ email: req.user.email });
      if (!sendingUser) {
        return res.status(404).json({ message: "Sending user not found" });
      }
      const friendMemberId = req.body.friend_member_id;

      const alreadySent = sendingUser.sent_friend_requests.some(
        (request) => request.member_id === friendMemberId
      );
      if (alreadySent) {
        return res.status(400).json({ message: "Friend request already sent" });
      }

      const potentialFriend = await User.findOne({
        member_id: req.body.friend_member_id,
      });
      if (!potentialFriend) {
        return res.status(404).json({ message: "Potential friend not found" });
      }

      req.session.friendRequests = req.session.friendRequests || [];
      req.session.friendRequests.push({
        sender_id: sendingUser.member_id,
        receiver_id: friendMemberId,
      });

      sendingUser.sent_friend_requests.push({
        member_id: friendMemberId,
        friend_name: potentialFriend.firstname,
        profile_pic: potentialFriend.profile_pic,
      });

      potentialFriend.friend_requests.push({
        member_id: sendingUser.member_id,
        friend_name: sendingUser.firstname,
        profile_pic: sendingUser.profile_pic,
      });
      await sendingUser.save();
      await potentialFriend.save();
      res.status(200).json({ message: "Friend request sent" });
    } catch (err) {
      console.error("Error sending friend request from user-profile:", err);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }
);

// GET /user_profile/:member_id
router.get(
  "/user_profile/:member_id",
  ensureAuthenticated,
  async (req, res) => {
    try {
      const memberId = req.params.member_id;
      const friend = await User.findOne({ member_id: memberId });

      if (!friend) {
        return res.status(404).send("Friend not found");
      }

      // Récupérer les statuses de l'ami avec les commentaires
      const userStatuses = await UserStatus.find({
        user_email: friend.email,
      }).populate("comments");

      res.render("user_profile_visit", {
        firstname: friend.firstname,
        lastname: friend.lastname,
        pseudonym: friend.pseudonym,
        age: friend.age,
        description: friend.description,
        literary_preferences: friend.literary_preferences || [],
        profile_pic:
          friend.profile_pic || "/user-profile-images/default_profile_1.jpg",
        user_friends: friend.friends, // Si nécessaire
        userStatuses: userStatuses,
      });
    } catch (err) {
      console.error("Error retrieving friend profile:", err);
      res.status(500).send("Error retrieving friend profile");
    }
  }
);

// POST /comment/:status_id
// POST /comment/:status_id
router.post("/comment/:status_id", ensureAuthenticated, async (req, res) => {
  try {
    const statusId = req.params.status_id;
    const { comment_text } = req.body;
    const userId = req.session.passport.user;

    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const newComment = new Comment({
      user_email: user.email,
      comment_text: comment_text,
      firstname: user.firstname,
      profile_pic: user.profile_pic,
      status_id: statusId,
    });

    await newComment.save();

    const userStatus = await UserStatus.findById(statusId);
    if (!userStatus) {
      return res
        .status(404)
        .json({ success: false, message: "User status not found" });
    }

    userStatus.comments.push(newComment._id);
    await userStatus.save();

    // Trouver l'ami associé au statut et rediriger vers sa page de profil
    const friend = await User.findOne({ email: userStatus.user_email });
    if (!friend) {
      return res
        .status(404)
        .json({ success: false, message: "Friend not found" });
    }

    res.redirect(`/user_profile/${friend.member_id}`);
  } catch (err) {
    console.error("Error adding comment:", err);
    res.status(500).json({ success: false, message: "Error adding comment" });
  }
});

module.exports = router;
