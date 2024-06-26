const port = 3000;
const path = require("path");
const passport = require("passport");
const mongoose = require("mongoose");
const socketIo = require("socket.io");
const bodyParser = require("body-parser");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const User = require("./database-models/user-model");
const LocalStrategy = require("passport-local").Strategy;

const express = require("express");
const app = express();

mongoose.connect("mongodb://localhost/bookend");
mongoose.connection.on("connected", () => {
  console.log("Connected to MongoDB");
});

mongoose.connection.on("error", (err) => {
  console.error("Failed to connect to MongoDB:", err);
});

// Set Pug as the template engine
app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));

// Use statics files from 'public' repertory
app.use(express.static(path.join(__dirname, "public")));
app.use(
  express.static(path.join(__dirname, "public/images/user-profile-images"))
);

// Parse JSON bodies
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Middleware pour gérer les sessions
app.use(
  session({
    secret: "your_secret_key",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }, // set to true if using https
  })
);

// Initialiser Passport.js
app.use(passport.initialize());
app.use(passport.session());

// Configurer le middleware d'authentification
passport.serializeUser(function (user, done) {
  done(null, user.id);
});

passport.deserializeUser(function (id, done) {
  User.findById(id, function (err, user) {
    done(err, user);
  });
});

passport.use(
  new LocalStrategy(function (username, password, done) {
    User.findOne({ email: username }, function (err, user) {
      if (err) {
        return done(err);
      }
      if (!user) {
        return done(null, false, { message: "Incorrect email." });
      }
      if (!user.validPassword(password)) {
        // Assurez-vous que la méthode validPassword est implémentée dans votre modèle User
        return done(null, false, { message: "Incorrect password." });
      }
      return done(null, user);
    });
  })
);

// Route pour la connexion
app.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/user/user_profile",
    failureRedirect: "/login",
    failureFlash: true, // Utilisez le middleware connect-flash si vous voulez afficher des messages flash
  })
);

// Middleware pour parser les cookies
app.use(cookieParser());

// Define a route
app.get("/", (req, res) => {
  res.render("landing");
});

// app.get("/:param*", (req, res) => {
//   const param = req.params.param;
//   // if (param === "home") {
//   //   res.render("home");
//   // } else {
//   res.sendFile(param, { root: path.join(__dirname, "public") });
//   // }
// });

const signUpRoute = require("./routes/user/usr-sign-up");
const signInRoute = require("./routes/user/usr-sign-in");
const homeRoute = require("./routes/home/home-route");
const logoutRouter = require("./routes/user/usr-logout");
const userProfile = require("./routes/user_profile/usr-profile");

// Use routes
app.use("/sign-up", signUpRoute);
app.use("/sign-in", signInRoute);
app.use(userProfile);
app.use(homeRoute);
app.use(logoutRouter);

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});
