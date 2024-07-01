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

      res.render("search_results", { users });
    } catch (err) {
      console.error("Error searching for friends:", err);
      res.status(500).send("Internal Server Error");
    }
  }
);

module.exports = router;
