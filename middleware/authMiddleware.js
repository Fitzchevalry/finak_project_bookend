const ensureAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next(); //
  }
  res.redirect("/");
};

const ensureUser = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  } else {
    res.redirect("/");
  }
};

const ensureAdmin = (req, res, next) => {
  if (req.isAuthenticated() && req.user.role === "admin") {
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
