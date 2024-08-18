const argon2 = require("argon2");

async function testHashing() {
  const password = "@@@@@&";
  const hashedPassword = await argon2.hash(password);
  console.log("Mot de passe hashé manuellement:", hashedPassword);

  const isValid = await argon2.verify(hashedPassword, password);
  console.log("Mot de passe valide manuellement:", isValid);
}

testHashing().catch((err) => console.error(err));
