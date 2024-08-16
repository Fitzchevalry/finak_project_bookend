const express = require("express");
const router = express.Router();
const passport = require("passport");
const Connection = require("../../database-models/connection-model");

// Route POST /sign-in
router.post("/", (req, res, next) => {
  passport.authenticate("local", async (err, user, info) => {
    if (err) {
      console.error("Error during authentication:", err);
      return res.status(500).json({ message: "Internal server error" });
    }
    if (!user) {
      console.log(`Failed login attempt for email: ${req.body.email}`);
      return res.status(400).json({ message: "Invalid email or password" });
    }
    req.logIn(user, async (err) => {
      if (err) {
        console.error("Error during login:", err);
        return res.status(500).json({ message: "Internal server error" });
      }

      // Enregistrement de la connexion
      try {
        await new Connection({
          userId: user._id,
          loginTime: new Date(),
        }).save();
        console.log(`User ${user._id} connected at ${new Date()}`);
      } catch (error) {
        console.error("Error saving connection record:", error);
      }

      // Redirection après connexion réussie
      if (user.role === "admin") {
        return res
          .status(200)
          .json({ message: "Login successful", redirect: "/home" });
      } else {
        return res
          .status(200)
          .json({ message: "Login successful", redirect: "/home" });
      }
    });
  })(req, res, next);
});

module.exports = router;
