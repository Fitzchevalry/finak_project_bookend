const express = require("express");
const router = express.Router();
const {
  ensureAuthenticated,
  ensureUser,
  ensureAdmin,
} = require("../../middleware/authMiddleware");
const User = require("../../database-models/user-model");
const UserStatus = require("../../database-models/user_statuses_model");

// Route GET /home
router.get("/home", ensureAuthenticated, async (req, res) => {
  try {
    if (!req.session.user) {
      const user = await User.findById(req.user.id);
      if (!user) {
        throw new Error("User not found in database");
      }
      // Sauvegarde de l'utilisateur
      req.session.user = {
        id: user.id,
        firstname: user.firstname,
        lastname: user.lastname,
        email: user.email,
        profile_pic: user.profile_pic,
      };
    }
    const firstname = req.session.user.firstname;
    const profile_pic = req.session.user.profile_pic;

    // Récupération des statuts des utilisateurs
    const statuses = await UserStatus.find({});

    // Mise à jour des post avec des dernières mise à jour de profil
    const updatedStatuses = await Promise.all(
      statuses.map(async (status) => {
        // Récupérez l'utilisateur associé à ce statut
        const user = await User.findOne({ email: status.user_email });
        if (!user) {
          console.error(`User not found for status ${status._id}`);
          return status;
        }

        // Mise à jour des modifications de profil dans le statut
        status.profile_pic = user.profile_pic || "default_profile_1.jpg";
        status.firstname = user.firstname;
        return status;
      })
    );

    // Affichage de "home" avec les données
    res.render("home", { firstname: firstname, user_statuses: statuses });
  } catch (err) {
    console.error("Error retrieving statuses:", err);
    res.status(500).send("Error retrieving statuses");
  }
});

// Route POST /user_status/create
router.post(
  "/user_status/create",
  ensureUser || ensureAdmin,
  async (req, res) => {
    try {
      const user = await User.findById(req.session.user.id);
      if (!user) {
        console.error("User not found");
        res.status(500).json("Error finding user");
        return;
      }
      const profile_pic = user.profile_pic || "default_profile_1.jpg";
      const user_status = new UserStatus({
        user_email: req.session.user.email,
        user_status: req.body.user_status,
        firstname: req.session.user.firstname,
        profile_pic: profile_pic,
      });

      const result = await user_status.save();
      res.status(200).json(result);
    } catch (err) {
      console.error("Error during submitting status:", err);
      res.status(500).json("Error during submitting status");
    }
  }
);

module.exports = router;
