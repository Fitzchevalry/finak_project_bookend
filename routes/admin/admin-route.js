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
  try {
    const users = await User.find().select("-password");
    res.render("admin", { users });
  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).send("Internal Server Error");
  }
});

// Route GET /administration/edit/:memberId
router.get("/administration/edit/:memberId", ensureAdmin, async (req, res) => {
  const memberId = req.params.memberId;

  try {
    const user = await User.findOne({ member_id: memberId }).select(
      "-password"
    );
    if (!user) {
      return res.status(404).send("User not found");
    }
    res.render("edit-user", { user });
  } catch (err) {
    console.error("Error fetching user:", err);
    res.status(500).send("Internal Server Error");
  }
});

// Route POST /administration/edit/:memberId
router.post("/administration/edit/:memberId", ensureAdmin, async (req, res) => {
  const memberId = req.params.memberId;
  const { firstname, lastname, email, description } = req.body;

  try {
    const user = await User.findOne({ member_id: memberId });
    if (!user) {
      return res.status(404).send("User not found");
    }

    user.firstname = firstname;
    user.lastname = lastname;
    user.email = email;
    user.description = description;

    await user.save();
    res.redirect("/administration");
  } catch (err) {
    console.error("Error updating user:", err);
    res.status(500).send("Internal Server Error");
  }
});

// DELETE /administration/users/:userId
router.delete(
  "/administration/users/:userId",
  ensureAdmin,
  async (req, res) => {
    const userId = req.params.userId;

    try {
      const user = await User.findById(userId);
      if (!user) {
        console.log(`Utilisateur avec l'ID ${userId} non trouvé`);
        return res.status(404).json({ message: "Utilisateur non trouvé" });
      }

      await user.deleteOne();
      res
        .status(200)
        .json({ message: "Profil utilisateur supprimé avec succès" });
    } catch (err) {
      console.error(
        "Erreur lors de la suppression du profil utilisateur:",
        err
      );
      res.status(500).json({ message: "Erreur serveur interne" });
    }
  }
);

module.exports = router;
