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
      });

      if (req.xhr) {
        // If the request is AJAX, render the partial view
        res.render("search-results", { users });
      } else {
        // If the request is not AJAX, render the full view
        res.render("search-friends-results", { users, searchQuery });
      }
    } catch (err) {
      console.error("Error searching for friends:", err);
      res.status(500).send("Internal Server Error");
    }
  }
);

module.exports = router;
