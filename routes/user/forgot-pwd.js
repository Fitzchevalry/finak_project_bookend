// EN COURS...

require("dotenv").config();
const express = require("express");
const router = express.Router();
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const User = require("../../database-models/user-model");

// GET /forgot-password
router.get("/forgot-password", (req, res) => {
  res.render("forgot-password");
});

// POST /forgot-password
router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.render("forgot-password", {
        error: "Adresse email non trouvée.",
      });
    }

    const token = crypto.randomBytes(20).toString("hex");

    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 600000; // 10min

    await user.save();

    const transporter = nodemailer.createTransport({
      host: process.env.HOST,
      port: 587,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      to: user.email,
      from: "mailtrap@demomailtrap.com",
      subject: "Réinitialisation de mot de passe",
      text: `Vous recevez cet email parce que vous (ou quelqu'un d'autre) avez demandé la réinitialisation du mot de passe de votre compte.\n\n
        Cliquez sur le lien suivant ou copiez-le dans votre navigateur pour compléter le processus :\n\n
        https://bookend.koyeb.app/forgot-password/${token}\n\n
        Si vous n'avez pas demandé cette réinitialisation, veuillez ignorer cet email et votre mot de passe restera inchangé.\n`,
    };

    transporter.sendMail(mailOptions, (err) => {
      if (err) {
        console.error("Erreur lors de l'envoi de l'email:", err);
        return res.render("forgot-password", {
          error: "Erreur lors de l'envoi de l'email.",
        });
      }
      return res.render("forgot-password", {
        success: "Un email a été envoyé à l'adresse indiquée.",
      });
    });
  } catch (err) {
    console.error(
      "Erreur lors de la demande de réinitialisation de mot de passe:",
      err
    );
    res.render("forgot-password", {
      error: "Erreur lors de la demande de réinitialisation de mot de passe.",
    });
  }
});

router.get("/reset-password/:token", async (req, res) => {
  try {
    const user = await User.findOne({
      resetPasswordToken: req.params.token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.render("reset-password", {
        token: req.params.token,
        error:
          "Le jeton de réinitialisation du mot de passe est invalide ou a expiré.",
      });
    }

    res.render("reset-password", { token: req.params.token });
  } catch (err) {
    console.error("Erreur lors de la réinitialisation du mot de passe:", err);
    res
      .status(500)
      .json({ message: "Erreur lors de la réinitialisation du mot de passe." });
  }
});

router.post("/reset-password/:token", async (req, res) => {
  try {
    const user = await User.findOne({
      resetPasswordToken: req.params.token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.render("reset-password", {
        token: req.params.token,
        error:
          "Le jeton de réinitialisation du mot de passe est invalide ou a expiré.",
      });
    }

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    return res.render("reset-password", {
      success: "Le mot de passe a été réinitialisé avec succès.",
    });
  } catch (err) {
    console.error("Erreur lors de la réinitialisation du mot de passe:", err);
    return res.render("reset-password", {
      error: "Erreur lors de la réinitialisation du mot de passe.",
    });
  }
});

module.exports = router;
