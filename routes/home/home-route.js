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
        // Ajoutez d'autres propriétés de l'utilisateur que vous souhaitez sauvegarder
      };
    }

    // Maintenant vous pouvez accéder à req.session.user.firstname
    const firstname = req.session.user.firstname;

    // Récupérez les statuts des utilisateurs
    const statuses = await UserStatus.find({});

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
      const profile_pic =
        user.user_profile && user.user_profile[0]
          ? user.user_profile[0].profile_pic
          : "default_profile_1.jpg";
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
