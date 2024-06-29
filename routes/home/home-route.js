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
    // Vérifiez si req.session.user est défini
    if (!req.session.user) {
      // Si req.session.user n'est pas défini, récupérez l'utilisateur à partir de la base de données
      const user = await User.findById(req.user.id);
      if (!user) {
        throw new Error("User not found in database");
      }
      // Sauvegardez l'utilisateur dans req.session.user
      req.session.user = {
        id: user.id,
        firstname: user.firstname,
        lastname: user.lastname,
        email: user.email,
        profile_pic: user.profile_pic,
        // Ajoutez d'autres propriétés de l'utilisateur que vous souhaitez sauvegarder
      };
    }

    // Maintenant vous pouvez accéder à req.session.user.firstname
    const firstname = req.session.user.firstname;
    const profile_pic = req.session.user.profile_pic;

    // Récupérez les statuts des utilisateurs
    const statuses = await UserStatus.find({});

    // Mettez à jour la photo de profil dans chaque statut avec la dernière photo de profil de l'utilisateur
    const updatedStatuses = await Promise.all(
      statuses.map(async (status) => {
        // Récupérez l'utilisateur associé à ce statut
        const user = await User.findOne({ email: status.user_email });
        if (!user) {
          console.error(`User not found for status ${status._id}`);
          return status; // Retournez le statut sans modification si l'utilisateur n'est pas trouvé
        }

        // Mettez à jour la photo de profil dans le statut
        status.profile_pic = user.profile_pic || "default_profile_1.jpg";
        return status;
      })
    );

    // Rendez la vue "home" avec les données
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
