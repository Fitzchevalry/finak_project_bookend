const ensureAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next(); // Autoriser l'accès à la route si l'utilisateur est authentifié
  }
  res.redirect("/"); // Rediriger vers la page de connexion si l'utilisateur n'est pas authentifié
};

const ensureUser = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  } else {
    res.redirect("/");
  }
};

const ensureAdmin = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  } else {
    res.redirect("/");
  }
};

module.exports = {
  ensureAuthenticated,
  ensureUser,
  ensureAdmin,
};
