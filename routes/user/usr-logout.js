const express = require("express");
const router = express.Router();
const Connection = require("../../database-models/connection-model");

// Route de déconnexion
router.post("/logout", async (req, res) => {
  try {
    const connection = await Connection.findOneAndUpdate(
      { userId: req.user._id, logoutTime: { $exists: false } },
      { logoutTime: new Date() },
      { new: true }
    );

    if (!connection) {
      console.error("No active connection found for user:", req.user._id);
    } else {
      console.log(`User ${req.user._id} disconnected at ${new Date()}`);
    }

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
  } catch (error) {
    console.error("Error during logout:", error);
    res.status(500).send("Error during logout");
  }
});

module.exports = router;
