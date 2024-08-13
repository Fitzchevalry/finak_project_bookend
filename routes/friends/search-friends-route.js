const express = require("express");
const router = express.Router();
const User = require("../../database-models/user-model");
const {
  ensureAuthenticated,
  ensureUser,
  ensureAdmin,
} = require("../../middleware/authMiddleware");

router.get(
  "/search_friends",
  ensureAuthenticated || ensureAdmin,
  async (req, res) => {
    const searchQuery = req.query.search_term;
    console.log("Search Query:", searchQuery);

    try {
      const users = await User.find({
        $or: [
          { firstname: { $regex: searchQuery, $options: "i" } },
          { lastname: { $regex: searchQuery, $options: "i" } },
        ],
        email: { $ne: req.user.email },
        role: "user",
      });
      console.log("Found Users:", users);

      const currentUser = await User.findOne({ email: req.user.email });
      const sentFriendRequests = currentUser.sent_friend_requests.map(
        (req) => req.member_id
      );
      const friends = currentUser.friends.map((friend) => friend.member_id);

      if (req.xhr) {
        res.render("search-friends-results", {
          users,
          searchQuery,
          sentFriendRequests,
          friends,
          user_role: req.session.user.role,
        });
      } else {
        res.render("search-friends-results", {
          users,
          searchQuery,
          sentFriendRequests,
          friends,
          user_role: req.session.user.role,
        });
      }
    } catch (err) {
      console.error("Error searching for friends:", err);
      res.status(500).send("Internal Server Error");
    }
  }
);

module.exports = router;
