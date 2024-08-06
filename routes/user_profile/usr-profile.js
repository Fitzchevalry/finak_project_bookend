// EN COURS...

const fs = require("fs").promises;
const multer = require("multer");
const express = require("express");
const path = require("path");
const router = express.Router();
const User = require("../../database-models/user-model");
const UserStatus = require("../../database-models/user_statuses_model");
const Comment = require("../../database-models/comment-model");
const Message = require("../../database-models/message-model");

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
    const currentUser = await User.findOne({ email: req.user.email });

    const sentFriendRequests = currentUser.sent_friend_requests.map(
      (req) => req.member_id
    );
    const suggestionFriends = await User.find({
      _id: { $ne: userId },
      role: "user",
      member_id: { $nin: [...userFriends, userId, ...sentFriendRequests] },
    }).limit(3);
    const chatUserInfo = {
      firstname: "",
      lastname: "",
      profile_pic: "user.profil_pic",
    };

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
      member_id: user.member_id,
      suggestionFriends: suggestionFriends,
      userStatuses: userStatuses,
      sentFriendRequests,
      chatUserInfo,
      userId,
      user_email: req.session.user.email,
    });
  } catch (err) {
    console.error("Error retrieving user profile:", err);
    res.status(500).send("Error retrieving user profile");
  }
});

// POST /user_profile/edit
router.put(
  "/user_profile",
  ensureUser || ensureAdmin,
  upload.single("profile_pic"),
  express.json(),
  async (req, res) => {
    try {
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
      if (req.file) {
        if (
          user.profile_pic &&
          user.profile_pic !== "/user-profile-images/default_profile_1.jpg"
        ) {
          // Suppression ancienne photo
          const oldImagePath = path.join(
            __dirname,
            `../../public/images${user.profile_pic}`
          );

          try {
            await fs.access(oldImagePath);
            await fs.unlink(oldImagePath);
            console.log("Deleted old profile picture:", oldImagePath);
          } catch (err) {
            if (err.code === "ENOENT") {
              console.log("Old profile picture not found, skipping deletion.");
            } else {
              throw err;
            }
          }
        }

        // Mise à jour de la photo de profil
        user.profile_pic = `/user-profile-images/${req.file.filename}`;
      }

      // Mise à jour des informations de l'utilisateur
      user.set({
        lastname: lastname || user.lastname,
        firstname: firstname || user.firstname,
        age: age || user.age,
        description: description || user.description,
        literary_preferences: literary_preferences || user.literary_preferences,
        pseudonym: pseudonym || user.pseudonym,
      });

      const updatedUser = await user.save();
      console.log("User profile updated:", updatedUser);

      // Mise à jour des photos dans les commentaires
      const comments = await Comment.find({ user_email: user.email });
      comments.forEach(async (comment) => {
        comment.profile_pic = updatedUser.profile_pic;
        await comment.save();
      });

      // Mise à jour des photos dans les messages de chat
      const messages = await Message.find({ senderId: user.member_id });
      messages.forEach(async (message) => {
        message.senderProfilePic = updatedUser.profile_pic;
        await message.save();
      });

      const userStatuses = await UserStatus.find({ user_email: user.email });
      userStatuses.forEach(async (status) => {
        status.set({ profile_pic: updatedUser.profile_pic });
        await status.save();
      });

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
            friendUser.friends[friendIndex].friend_firstname =
              updatedUser.firstname;
            friendUser.friends[friendIndex].friend_lastname =
              updatedUser.lastname;

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
            requestUser.friend_requests[requestIndex].friend_firstname =
              updatedUser.firstname;
            requestUser.friend_requests[requestIndex].friend_lastname =
              updatedUser.lastname;
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
              sentRequestUser.friend_requests[
                sentRequestIndex
              ].friend_firstname = updatedUser.firstname;
              sentRequestUser.friend_requests[
                sentRequestIndex
              ].friend_lastname = updatedUser.lastname;
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

// GET /user_profile/:member_id visiter les profiles amis
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

      const userStatuses = await UserStatus.find({
        user_email: friend.email,
      }).populate("comments");
      console.log("User Statuses:", userStatuses);
      res.render("user_profile_visit", {
        firstname: friend.firstname,
        lastname: friend.lastname,
        pseudonym: friend.pseudonym,
        age: friend.age,
        description: friend.description,
        literary_preferences: friend.literary_preferences || [],
        profile_pic:
          friend.profile_pic || "/user-profile-images/default_profile_1.jpg",
        user_friends: friend.friends,
        userStatuses: userStatuses,
        user_email: req.session.user.email,
        user: req.user,
        chatUserInfo: {
          firstname: friend.firstname,
          lastname: friend.lastname,
          profile_pic:
            friend.profile_pic || "/user-profile-images/default_profile_1.jpg",
        },
      });
    } catch (err) {
      console.error("Error retrieving friend profile:", err);
      res.status(500).send("Error retrieving friend profile");
    }
  }
);

// GET /messages/:roomId" accéder au chat
router.get("/messages/:roomId", async (req, res) => {
  const { roomId } = req.params;
  try {
    const messages = await Message.find({ roomId })
      .sort({ timestamp: 1 })
      .exec();
    res.json(messages);
  } catch (error) {
    console.error("Error retrieving messages:", error);
    res.status(500).send("Server error");
  }
});

// GET /notifications/mark-as-read
router.post("/notifications/mark-as-read", async (req, res) => {
  const { notifications } = req.body;

  try {
    await Notification.updateMany(
      { _id: { $in: notifications } },
      { read: true }
    );
    res.status(200).send("Notifications marked as read");
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
});

module.exports = router;
