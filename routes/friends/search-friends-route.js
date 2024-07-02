const express = require("express");
const router = express.Router();
const User = require("../../database-models/user-model");
const {
  ensureAuthenticated,
  ensureUser,
  ensureAdmin,
} = require("../../middleware/authMiddleware");

// GET /search_friends route
router.get(
  "/search_friends",
  ensureAuthenticated || ensureAdmin,
  async (req, res) => {
    const searchQuery = req.query.search_term;

    try {
      const users = await User.find({
        $or: [
          { firstname: { $regex: searchQuery, $options: "i" } },
          { lastname: { $regex: searchQuery, $options: "i" } },
        ],
        email: { $ne: req.user.email },
        role: "user",
      });

      const currentUser = await User.findOne({ email: req.user.email });
      const sentFriendRequests = currentUser.sent_friend_requests.map(
        (req) => req.member_id
      );

      if (req.xhr) {
        res.render("search-results", { users, sentFriendRequests });
      } else {
        res.render("search-friends-results", {
          users,
          searchQuery,
          sentFriendRequests,
        });
      }
    } catch (err) {
      console.error("Error searching for friends:", err);
      res.status(500).send("Internal Server Error");
    }
  }
);

module.exports = router;
