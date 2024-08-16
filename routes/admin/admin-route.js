const express = require("express");
const router = express.Router();

const { ensureAdmin } = require("../../middleware/authMiddleware");
const User = require("../../database-models/user-model");
const UserStatus = require("../../database-models/user_statuses_model");
const Comment = require("../../database-models/comment-model");
const Message = require("../../database-models/message-model");
const Connection = require("../../database-models/connection-model");

// Route GET /administration
router.get("/administration", ensureAdmin, async (req, res) => {
  try {
    // Récupère tous les utilisateurs sans le mot de passe (sécurité)
    const users = await User.find().select("-password");
    res.render("admin", { users, user_role: req.session.user.role });
  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).send("Internal Server Error");
  }
});

// Route GET /administration/edit/:memberId
router.get("/administration/edit/:memberId", ensureAdmin, async (req, res) => {
  const memberId = req.params.memberId;
  try {
    // Trouve l'utilisateur à éditer en utilisant son ID de membre
    const user = await User.findOne({ member_id: memberId }).select(
      "-password"
    );
    // Récupère les postes de l'utilisateur et les commentaires associés
    const userStatuses = await UserStatus.find({
      user_email: user.email,
    }).populate("comments");

    const comments = await Comment.find({ user_email: user.email });
    if (!user) {
      return res.status(404).send("User not found");
    }
    res.render("edit-user", {
      user,
      userStatuses,
      comments,
      user_role: req.session.user.role,
    });
  } catch (err) {
    console.error("Error fetching user:", err);
    res.status(500).send("Internal Server Error");
  }
});

// Route POST /administration/edit/:memberId
router.post("/administration/edit/:memberId", ensureAdmin, async (req, res) => {
  const memberId = req.params.memberId;
  const { firstname, lastname, email, description, password } = req.body;
  const profilePic = req.file ? req.file.path : undefined;

  try {
    // Trouve l'utilisateur à mettre à jour
    const user = await User.findOne({ member_id: memberId });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Met à jour les informations de l'utilisateur
    user.firstname = firstname;
    user.lastname = lastname;
    user.email = email;
    user.description = description;
    if (profilePic) {
      user.profile_pic = profilePic;
    }
    if (password) {
      user.password = password;
    }

    // Sauvegarde les modifications
    await user.save();
    res.status(200).json({ message: "User updated successfully" });
  } catch (err) {
    console.error("Error updating user:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// Route DELETE /administration/users/:userId
router.delete(
  "/administration/users/:userId",
  ensureAdmin,
  async (req, res) => {
    const userId = req.params.userId;

    try {
      // Trouve l'utilisateur à supprimer
      const user = await User.findOne({ member_id: userId });
      if (!user) {
        console.log(`Utilisateur avec l'ID ${userId} non trouvé`);
        return res.status(404).json({ message: "Utilisateur non trouvé" });
      }

      // Supprime l'utilisateur
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

// Route GET /statistics
router.get("/admin/statistics", async (req, res) => {
  try {
    // Compte le nombre de connexions actives (sans déconnexion)
    const connectionsCount = await Connection.countDocuments({
      logoutTime: { $exists: false },
    });
    // Compte le nombre de messages envoyés
    const messagesSentCount = await Message.countDocuments({
      senderId: { $exists: true },
    });
    // Compte le nombre de postes d'utilisateur et de commentaires
    const statusesCount = await UserStatus.countDocuments();
    const commentsCount = await Comment.countDocuments();

    res.json({
      connections: connectionsCount,
      messagesSent: messagesSentCount,
      statuses: statusesCount,
      comments: commentsCount,
    });
  } catch (err) {
    console.error("Erreur lors de la récupération des statistiques:", err);
    res
      .status(500)
      .json({ error: "Erreur lors de la récupération des statistiques" });
  }
});
module.exports = router;
