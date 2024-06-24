const express = require("express");
const router = express.Router();

// Route de déconnexion
router.post("/logout", (req, res) => {
  // Détruire la session
  req.session.destroy((err) => {
    if (err) {
      console.error("Error destroying session:", err);
      res.status(500).send("Error during logout");
    } else {
      // Suppression des cookies d'authentification
      res.clearCookie("user");
      res.send("Logout successful");
    }
  });
});

module.exports = router;
