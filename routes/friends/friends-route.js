// EN COURS...

const express = require("express");
const router = express.Router();
const User = require("../../database-models/user-model");
const { ensureAuthenticated } = require("../../middleware/authMiddleware");

// GET /friends
router.get("/friends", ensureAuthenticated, async (req, res) => {
  try {
    const currentUser = await User.findOne({ email: req.user.email });
    if (!currentUser) {
      return res.status(404).json({ message: "Current user not found" });
    }

    const sentFriendRequests = currentUser.sent_friend_requests.map(
      (req) => req.member_id
    );

    const friends = currentUser.friends.map((friend) => friend.member_id);

    const users = await User.find({
      email: { $ne: req.user.email },
      role: "user",
      member_id: { $nin: [...sentFriendRequests, ...friends] },
    });

    res.render("friends", { user_friends: users, sentFriendRequests });
  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).send("Internal Server Error");
  }
});

let isSendingFriendRequest = false;

router.post("/friend_request", ensureAuthenticated, async (req, res) => {
  try {
    if (isSendingFriendRequest) {
      return res.status(400).json({
        message:
          "Une demande d'ami est déjà en cours de traitement. Veuillez réessayer plus tard.",
      });
    }

    isSendingFriendRequest = true;

    const sendingUser = await User.findOne({ email: req.user.email });
    if (!sendingUser) {
      isSendingFriendRequest = false;
      return res
        .status(404)
        .json({ message: "Utilisateur envoyant la demande non trouvé" });
    }

    const friendMemberId = req.body.friend_member_id;

    const alreadySent = sendingUser.sent_friend_requests.some(
      (request) => request.member_id === friendMemberId
    );
    if (alreadySent) {
      isSendingFriendRequest = false;
      return res.status(400).json({ message: "Demande d'ami déjà envoyée" });
    }

    const potentialFriend = await User.findOne({
      member_id: friendMemberId,
    });
    if (!potentialFriend) {
      isSendingFriendRequest = false;
      return res.status(404).json({ message: "Ami potentiel non trouvé" });
    }

    req.session.friendRequests = req.session.friendRequests || [];
    req.session.friendRequests.push({
      sender_id: sendingUser.member_id,
      receiver_id: friendMemberId,
    });

    sendingUser.sent_friend_requests.push({
      member_id: friendMemberId,
      friend_firstname: potentialFriend.firstname,
      friend_lastname: potentialFriend.lastname,
      profile_pic: potentialFriend.profile_pic,
    });

    potentialFriend.friend_requests.push({
      member_id: sendingUser.member_id,
      friend_firstname: sendingUser.firstname,
      friend_lastname: sendingUser.lastname,

      profile_pic: sendingUser.profile_pic,
    });

    await sendingUser.save();
    await potentialFriend.save();

    isSendingFriendRequest = false;

    res.status(200).json({ message: "Demande d'ami envoyée avec succès" });
  } catch (err) {
    console.error("Erreur lors de l'envoi de la demande d'ami:", err);

    isSendingFriendRequest = false;
    res.status(500).json({ message: "Erreur interne du serveur" });
  }
});

// POST /accept_friend_request
router.post("/accept_friend_request", ensureAuthenticated, async (req, res) => {
  try {
    const userEmail = req.user.email;
    const friendMemberId = req.body.member_id;

    const user = await User.findOne({ email: userEmail });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const acceptedFriendUser = await User.findOne({
      member_id: friendMemberId,
    });
    if (!acceptedFriendUser) {
      return res
        .status(404)
        .json({ message: "Accepted friend user not found" });
    }

    const alreadyFriend = user.friends.some(
      (friend) => friend.member_id.toString() === friendMemberId.toString()
    );
    if (alreadyFriend) {
      return res
        .status(400)
        .json({ message: "This user is already your friend" });
    }

    await user.updateOne({
      $push: {
        friends: {
          friend_email: acceptedFriendUser.email,
          member_id: acceptedFriendUser.member_id,
          friend_firstname: acceptedFriendUser.firstname,
          friend_lastname: acceptedFriendUser.lastname,
          profile_pic: acceptedFriendUser.profile_pic,
        },
      },
      $pull: {
        friend_requests: { member_id: friendMemberId },
      },
    });

    await acceptedFriendUser.updateOne({
      $push: {
        friends: {
          friend_email: user.email,
          member_id: user.member_id,
          friend_firstname: user.firstname,
          friend_lastname: user.lastname,
          profile_pic: user.profile_pic,
        },
      },
      $pull: {
        friend_requests: { member_id: user.member_id },
      },
    });

    const sentFriendRequests = user.sent_friend_requests.map(
      (req) => req.member_id
    );

    const friends = user.friends.map((friend) => friend.member_id);

    const suggestionFriends = await User.find({
      email: { $ne: userEmail },
      role: "user",
      member_id: { $nin: [...sentFriendRequests, ...friends, friendMemberId] },
    });

    res.status(200).json({
      message: "You have accepted a friend request",
      newFriend: {
        member_id: acceptedFriendUser.member_id,
        friend_firstname: acceptedFriendUser.firstname,
        friend_lastname: acceptedFriendUser.lastname,
        profile_pic: acceptedFriendUser.profile_pic,
      },
      suggestionFriends: suggestionFriends,
      sentFriendRequests: sentFriendRequests,
    });
  } catch (err) {
    console.error("Error accepting friend request:", err);
    res.status(500).send("Internal Server Error");
  }
});

// POST /reject_friend_request
router.post("/reject_friend_request", ensureAuthenticated, async (req, res) => {
  try {
    const userEmail = req.user.email;
    const friendMemberId = req.body.member_id;

    // Trouver l'utilisateur actuel (destinataire de la demande)
    const user = await User.findOne({ email: userEmail });
    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    // Trouver l'expéditeur de la demande (l'ami)
    const sender = await User.findOne({ member_id: friendMemberId });
    if (!sender) {
      return res
        .status(404)
        .json({ message: "Expéditeur de la demande non trouvé" });
    }

    // Supprimer la demande du destinataire
    await user.updateOne({
      $pull: {
        friend_requests: { member_id: friendMemberId },
        sent_friend_requests: { member_id: friendMemberId }, // Aussi retirer du tableau des demandes envoyées
      },
    });

    // Supprimer la demande du tableau des demandes envoyées de l'expéditeur
    await sender.updateOne({
      $pull: {
        friend_requests: { member_id: user.member_id },
        sent_friend_requests: { member_id: user.member_id },
      },
    });

    res.sendStatus(200);
  } catch (err) {
    console.error("Erreur lors du rejet de la demande d'ami:", err);
    res.status(500).send("Erreur interne du serveur");
  }
});

router.delete(
  "/delete_friend/:friendMemberId",
  ensureAuthenticated,
  async (req, res) => {
    const currentUserMemberId = req.user.member_id;
    const friendMemberId = req.params.friendMemberId;

    try {
      await User.updateOne(
        { member_id: currentUserMemberId },
        {
          $pull: {
            friends: { member_id: friendMemberId },
            sent_friend_requests: { member_id: friendMemberId },
          },
        }
      );

      await User.updateOne(
        { member_id: friendMemberId },
        {
          $pull: {
            friends: { member_id: currentUserMemberId },
            sent_friend_requests: { member_id: currentUserMemberId },
          },
        }
      );

      res.json({ message: "Friend deleted successfully" });
    } catch (err) {
      console.error("Error deleting friend:", err);
      res.status(500).json({ error: "Could not delete friend" });
    }
  }
);

module.exports = router;
