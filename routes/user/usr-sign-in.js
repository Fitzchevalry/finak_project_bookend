const express = require("express");
const router = express.Router();
const passport = require("passport");

// POST /sign-in
router.post("/", (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) {
      console.error("Error during authentication:", err);
      return res.status(500).json({ message: "Internal server error" });
    }
    if (!user) {
      console.log(`Failed login attempt for email: ${req.body.email}`);
      return res.status(400).json({ message: "Invalid email or password" });
    }
    req.logIn(user, (err) => {
      if (err) {
        console.error("Error during login:", err);
        return res.status(500).json({ message: "Internal server error" });
      }
      console.log("Login successful. User:", user.email); // Ajout du log pour voir quel utilisateur s'est connecté avec succès
      return res
        .status(200)
        .json({ message: "Login successful", redirect: "/home" });
    });
  })(req, res, next);
});

module.exports = router;
