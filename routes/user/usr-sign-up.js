const express = require("express");
const router = express.Router();
const passport = require("passport");
const User = require("../../database-models/user-model");
const Connection = require("../../database-models/connection-model");

// Middleware pour valider l'email
function validateEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

// Middleware pour valider la longueur des noms
function validateNameLength(name) {
  return name.length >= 3;
}

function validatePassword(password) {
  return password.length >= 1;
}

// Route POST /sign-up
router.post("/", async (req, res, next) => {
  const { email, lastname, firstname, password } = req.body;

  // Validation des données côté serveur
  if (!validateEmail(email)) {
    return res
      .status(400)
      .json({ message: "Veuillez entrer une adresse email valide." });
  }

  if (!validateNameLength(lastname) || !validateNameLength(firstname)) {
    return res.status(400).json({
      message: "Le nom et le prénom doivent contenir au moins 3 caractères.",
    });
  }

  if (!validatePassword(password)) {
    return res
      .status(400)
      .json({ message: "Veuillez entrer un mot de passe." });
  }

  try {
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        message:
          "Cette adresse email est déjà enregistrée. Veuillez utiliser une autre adresse email.",
      });
    }

    // Création d'un nouvel utilisateur
    const newUser = new User({
      email,
      lastname,
      firstname,
      password,
      role: "user",
    });
    const savedUser = await newUser.save();

    // Enregistrement de la connexion
    try {
      await new Connection({
        userId: savedUser._id,
        loginTime: new Date(),
      }).save();
      console.log(`User ${savedUser._id} connected at ${new Date()}`);
    } catch (error) {
      console.error("Error saving connection record:", error);
    }

    // Authentification de l'utilisateur après inscription
    req.login(savedUser, (err) => {
      if (err) {
        console.error("Error during login after registration:", err);
        return res.status(500).json({ message: "Internal server error" });
      }
      return res.status(200).json({
        message: "Inscription réussie",
        redirect: "/home",
      });
    });
  } catch (err) {
    console.error("Erreur lors de l'inscription:", err);
    return res.status(500).json({ message: "Erreur lors de l'inscription" });
  }
});

module.exports = router;
