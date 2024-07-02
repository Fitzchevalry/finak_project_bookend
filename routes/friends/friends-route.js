const express = require("express");
const router = express.Router();
const User = require("../../database-models/user-model");
const { ensureAuthenticated } = require("../../middleware/authMiddleware");

// GET /friends
router.get("/friends", ensureAuthenticated, async (req, res) => {
  try {
    const users = await User.find({
      email: { $ne: req.user.email },
      role: "user",
    });
    const currentUser = await User.findOne({ email: req.user.email });
    const sentFriendRequests = currentUser.sent_friend_requests.map(
      (req) => req.member_id
    );

    res.render("friends", { user_friends: users, sentFriendRequests });
  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).send("Internal Server Error");
  }
});

router.post("/friend_request", ensureAuthenticated, async (req, res) => {
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
    console.error("Error sending friend request:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

module.exports = router;
