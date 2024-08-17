// EN COURS...

const fs = require("fs").promises;
const multer = require("multer");
const mongoose = require("mongoose");

const express = require("express");
const path = require("path");
const router = express.Router();
const User = require("../../database-models/user-model");
const UserStatus = require("../../database-models/user_statuses_model");
const Comment = require("../../database-models/comment-model");
const Message = require("../../database-models/message-model");
const UserComment = require("../../database-models/user-comment-model");
const UserMessage = require("../../database-models/user-messages-model");

const {
  ensureAuthenticated,
  ensureUser,
  ensureAdmin,
} = require("../../middleware/authMiddleware");

// Fonction pour formater les dates en français
function formatDate(dateString) {
  const options = { day: "2-digit", month: "2-digit", year: "numeric" };
  const date = new Date(dateString);
  return date.toLocaleDateString("fr-FR", options);
}

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

// Route GET /user_profile
router.get("/user_profile", ensureUser || ensureAdmin, async (req, res) => {
  try {
    const userId = req.session.passport.user;
    console.log("Session User ID:", userId);

    // Récupère les détails de l'utilisateur connectés
    const user = await User.findById(userId);

    if (!user) {
      console.log("User not found for ID:", userId);
      return res.status(404).send("User not found");
    }
    console.log("User profile retrieved successfully:", user);

    // Récupère les amis de l'utilisateur
    const userFriends = user.friends.map((friend) => friend.member_id);

    // Récupère les postes de l'utilisateur, triés par date de création
    const userStatuses = await UserStatus.find({
      user_email: req.session.user.email,
    })
      .sort({ createdAt: -1 })
      .populate("comments");

    const userMessages = await UserMessage.find({
      user_email: req.session.user.email,
    })
      .sort({ createdAt: -1 })
      .populate("friendComments");

    // Formate les dates des postes
    const formattedStatuses = userStatuses.map((status) => {
      status.publication_date_formatted = formatDate(status.publication_date);
      return status;
    });

    // Récupère les suggestions d'amis qui ne sont ni amis, ni déjà en demande
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
      user_role: req.session.user.role,
      userStatuses: formattedStatuses,
      user_messages: userMessages || [],
    });
  } catch (err) {
    console.error("Error retrieving user profile:", err);
    res.status(500).send("Error retrieving user profile");
  }
});

// Route PUT /user_profile/edit
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

      // Récupère l'utilisateur à mettre à jour
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
          // Supprime l'ancienne photo de profil
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
        comment.firstname = updatedUser.firstname;
        comment.profile_pic = updatedUser.profile_pic;

        await comment.save();
      });

      // Mise à jour des photos dans les messages de chat
      const messages = await Message.find({ senderId: user.member_id });
      messages.forEach(async (message) => {
        message.senderName = updatedUser.firstname;
        message.senderProfilePic = updatedUser.profile_pic;

        await message.save();
      });

      // Met à jour les photos dans les postes de l'utilisateur
      const userStatuses = await UserStatus.find({ user_email: user.email });
      userStatuses.forEach(async (status) => {
        status.set({
          profile_pic: updatedUser.profile_pic,
          firstname: updatedUser.firstname,
        });
        await status.save();
      });

      // Met à jour les informations chez les amis
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

// Route GET /user_profile/:member_id visiter les profiles amis
router.get(
  "/user_profile/:member_id",
  ensureAuthenticated,
  async (req, res) => {
    try {
      const memberId = req.params.member_id;
      console.log(
        `Received request for user profile with member_id: ${memberId}`
      );

      const currentUser = req.user;
      const friend = await User.findOne({ member_id: memberId });

      if (!friend) {
        console.error(`User with member_id ${memberId} not found`);
        return res.status(404).send("Friend not found");
      }

      // Vérifiez si l'utilisateur est un ami
      const isFriend = currentUser.friends.some(
        (friend) => friend.member_id === memberId
      );
      console.log("isFriend?:", isFriend);

      // Vérifiez si l'utilisateur est un admin
      const isAdmin = currentUser.role === "admin";
      console.log(`User isFriend: ${isFriend}, isAdmin: ${isAdmin}`);

      let userStatuses = [];
      if (isFriend || isAdmin) {
        userStatuses = await UserStatus.find({ user_email: friend.email })
          .sort({ createdAt: -1 })
          .populate("comments");

        // Formate les dates avant de les envoyer
        userStatuses = userStatuses.map((status) => {
          status.publication_date_formatted = new Date(
            status.publication_date
          ).toLocaleDateString("fr-FR");
          return status;
        });
      }

      let userMessages = [];
      if (isFriend || isAdmin) {
        userMessages = await UserMessage.find({
          user_email: friend.email,
        })
          .sort({ createdAt: -1 })
          .populate("friendComments");
      }

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
        isFriend: isFriend,
        isAdmin: isAdmin,
        member_id: memberId,
        sentFriendRequests: req.user.sent_friend_requests.map(
          (req) => req.member_id
        ),
        user_role: req.session.user.role,
        // userStatuses: formattedStatuses,
        user_messages: userMessages || [],
      });
    } catch (err) {
      console.error("Error retrieving friend profile:", err);
      res.status(500).send("Error retrieving friend profile");
    }
  }
);

// Route GET /messages/:roomId" accéder au chat
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

// Route GET /notifications/mark-as-read
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

router.post(
  "/user_message/create",
  ensureUser || ensureAdmin,
  async (req, res) => {
    try {
      const userId = req.session.user.id;
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      const profile_pic = user.profile_pic || "default_profile_1.jpg";
      const user_message = new UserMessage({
        user_email: req.session.user.email,
        status_text: req.body.status_text,
        firstname: req.session.user.firstname,
        profile_pic: profile_pic,
      });

      const result = await user_message.save();

      res.status(200).json(result);
    } catch (err) {
      console.error("Error during submitting status:", err);
      res.status(500).json({ error: "Error during submitting status" });
    }
  }
);

router.delete(
  "/user_message/:id/delete",
  ensureAuthenticated || ensureAdmin,
  async (req, res) => {
    try {
      const statusId = req.params.id;
      const userEmail = req.session.user.email;
      const message = await UserMessage.findById(statusId);
      if (!message) {
        return res.status(404).json({ error: "Message not found" });
      }
      // Vérifier si l'utilisateur est admin ou le propriétaire du post
      if (req.user.role !== "admin" && message.user_email !== userEmail) {
        return res.status(403).json({ error: "Unauthorized action" });
      }
      // Supprimer les commentaires associés au post
      await UserComment.deleteMany({ _id: { $in: message.friendComments } });
      await UserMessage.findByIdAndDelete(statusId);
      res.status(200).json(message);
    } catch (err) {
      console.error("Error deleting message:", err);
      res.status(500).json({ error: "Error deleting message" });
    }
  }
);

router.get("/user_message/:id", async (req, res) => {
  try {
    const messageId = req.params.id;
    const message = await UserMessage.findById(messageId).populate(
      "friendComments"
    );
    if (!message) {
      return res.status(404).json({ error: "Message not found" });
    }
    res.json(message);
  } catch (err) {
    console.error("Error retrieving message:", err);
    res.status(500).json({ error: "Error retrieving message" });
  }
});

router.post(
  "/user_message/:id/comment",
  ensureAuthenticated || ensureAdmin,
  async (req, res) => {
    try {
      const statusId = req.params.id;
      const user = await User.findById(req.session.user.id);
      if (!user) {
        console.error("User not found");
        res.status(500).json({ error: "Error finding user" });
        return;
      }
      const profile_pic = user.profile_pic || "default_profile_1.jpg";
      const userComment = new UserComment({
        user_email: req.session.user.email,
        user_comment_text: req.body.comment_text,
        firstname: req.session.user.firstname,
        profile_pic: user.profile_pic,
        userMessage_id: statusId,
      });

      const savedComment = await userComment.save();
      const message = await UserMessage.findById(statusId);
      if (!message) {
        console.error("Message not found");
        res.status(404).json({ error: "Message not found" });
        return;
      }

      message.friendComments.push(savedComment._id);

      await message.save();

      res.status(200).json(savedComment);
    } catch (err) {
      console.error("Error during comment creation:", err);
      res.status(500).json({ error: "Error during comment creation" });
    }
  }
);

router.delete(
  "/friendComment/:id/delete",
  ensureAuthenticated || ensureAdmin,
  async (req, res) => {
    try {
      const user_commentId = req.params.id;
      const userEmail = req.session.user.email;
      if (!mongoose.Types.ObjectId.isValid(user_commentId)) {
        return res.status(400).json({ error: "Invalid comment ID" });
      }
      const user_comment = await UserComment.findById(user_commentId);
      if (!user_comment) {
        return res.status(404).json({ error: "Comment not found" });
      }

      // Vérifier si l'utilisateur est admin ou le propriétaire du commentaire
      if (req.user.role !== "admin" && user_comment.user_email !== userEmail) {
        return res.status(403).json({ error: "Unauthorized action" });
      }
      await UserComment.findByIdAndDelete(user_commentId);
      await UserMessage.updateOne(
        { _id: user_comment.userMessage_id },
        { $pull: { friendComments: user_commentId } }
      );

      res.status(204).send();
    } catch (err) {
      console.error("Error deleting comment:", err);
      res.status(500).json({ error: "Error deleting comment" });
    }
  }
);

module.exports = router;
