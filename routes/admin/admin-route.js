const express = require("express");
const router = express.Router();
const {
  ensureAuthenticated,
  ensureUser,
  ensureAdmin,
} = require("../../middleware/authMiddleware");
const User = require("../../database-models/user-model");
const UserStatus = require("../../database-models/user_statuses_model");

// Route GET /administration
router.get("/administration", ensureAdmin, async (req, res) => {
  res.render("admin");
});

module.exports = router;
