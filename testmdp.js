require("dotenv").config();
const mongoose = require("mongoose");
const User = require("./database-models/user-model");

const mongodbURI = process.env.MONGODB_URI;

mongoose.connect(mongodbURI);

mongoose.connection.on("connected", () => {
  console.log("Connected to MongoDB");
});

mongoose.connection.on("error", (err) => {
  console.error("Failed to connect to MongoDB:", err);
});

async function updatePassword(userId, newPassword) {
  try {
    console.log(`Searching for user with ID: ${userId}`);
    const user = await User.findById(userId);

    if (!user) throw new Error("Utilisateur non trouvé");

    console.log("Utilisateur trouvé. Updating password...");
    await user.setPassword(newPassword);
    await user.save();

    console.log("Mot de passe mis à jour avec succès.");

    const updatedUser = await User.findById(userId);
    console.log("Mot de passe hashé après mise à jour:", updatedUser.password);

    const isValid = await updatedUser.validPassword(newPassword);
    console.log("Mot de passe valide après mise à jour:", isValid);
  } catch (err) {
    console.error("Erreur lors de la mise à jour du mot de passe:", err);
  }
}

// Exemple d'utilisation
updatePassword("6685656b92fd8fa362a735ab", "11111");
