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
    // Vérifier si une demande est déjà en cours de traitement
    if (isSendingFriendRequest) {
      return res.status(400).json({
        message:
          "Une demande d'ami est déjà en cours de traitement. Veuillez réessayer plus tard.",
      });
    }

    // Marquer la demande comme en cours de traitement
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

    // Enregistrer la demande dans la session selon votre besoin)
    req.session.friendRequests = req.session.friendRequests || [];
    req.session.friendRequests.push({
      sender_id: sendingUser.member_id,
      receiver_id: friendMemberId,
    });

    // Mettre à jour les listes de demandes d'amis des utilisateurs
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
          friend_name: acceptedFriendUser.firstname,
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
          friend_name: user.firstname,
          profile_pic: user.profile_pic,
        },
      },
      $pull: {
        friend_requests: { member_id: user.member_id },
      },
    });

    res.send("You have accepted a friend request");
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

    const user = await User.findOne({ email: userEmail });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    await user.updateOne({
      $pull: {
        friend_requests: { member_id: friendMemberId },
      },
    });

    res.sendStatus(200);
  } catch (err) {
    console.error("Error rejecting friend request:", err);
    res.status(500).send("Internal Server Error");
  }
});

module.exports = router;
