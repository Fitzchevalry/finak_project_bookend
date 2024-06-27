// passwordUtils.js

const bcrypt = require("bcrypt");

// Fonction pour hasher un mot de passe
async function hashPassword(password) {
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(password, saltRounds);
  return hashedPassword;
}

// Fonction pour comparer un mot de passe entré avec le mot de passe hashé en base de données
async function comparePasswords(plainPassword, hashedPassword) {
  const match = await bcrypt.compare(plainPassword, hashedPassword);
  return match;
}

module.exports = {
  hashPassword,
  comparePasswords,
};
