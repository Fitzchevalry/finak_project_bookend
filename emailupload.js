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

async function updateFriendsEmails() {
  try {
    // Trouver tous les utilisateurs
    const users = await User.find();

    for (const user of users) {
      for (const friend of user.friends) {
        // Trouver l'ami correspondant
        const friendUser = await User.findOne({ member_id: friend.member_id });

        if (friendUser) {
          // Mettre à jour l'email de l'ami
          friend.email = friendUser.email;
        }
      }

      // Sauvegarder les changements
      await user.save();
    }

    console.log("Mise à jour terminée.");
  } catch (err) {
    console.error("Erreur lors de la mise à jour des amis:", err);
  } finally {
    mongoose.disconnect();
  }
}

updateFriendsEmails();
