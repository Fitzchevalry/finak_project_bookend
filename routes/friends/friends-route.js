const express = require("express");
const router = express.Router();
const User = require("../../database-models/user-model");
const { ensureAuthenticated } = require("../../middleware/authMiddleware");

// GET /friends
router.get("/friends", ensureAuthenticated, async (req, res) => {
  console.log("getting latest changes");
  try {
    const users = await User.find({ email: { $ne: req.user.email } });
    res.render("friends", { user_friends: users });
  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).send("Internal Server Error");
  }
});

module.exports = router;
