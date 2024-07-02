const port = 3000;
const path = require("path");
const passport = require("passport");
const socketIo = require("socket.io");
const cookieParser = require("cookie-parser");
const User = require("./database-models/user-model");
const LocalStrategy = require("passport-local").Strategy;
const bodyParser = require("body-parser");

const express = require("express");
const app = express();
const session = require("express-session");
const mongoose = require("mongoose");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));

mongoose.connect("mongodb://localhost/bookend");
mongoose.connection.on("connected", () => {
  console.log("Connected to MongoDB");
});

mongoose.connection.on("error", (err) => {
  console.error("Failed to connect to MongoDB:", err);
});

// Set Pug
app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));

// Statics files from 'public' repertory
app.use(express.static(path.join(__dirname, "public")));
app.use(
  "/user-profile-images",
  express.static(path.join(__dirname, "public/images/user-profile-images"))
);

// Middleware pour gérer les sessions
app.use(
  session({
    secret: "your_secret_key",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false, httpOnly: true }, // true si https
  })
);

// Passport.js
app.use(passport.initialize());
app.use(passport.session());

passport.use(
  new LocalStrategy(
    { usernameField: "email", passwordField: "password" },
    async function (email, password, done) {
      try {
        const user = await User.findOne({ email });
        if (!user) {
          return done(null, false, { message: "Incorrect email." });
        }
        const isMatch = await user.validPassword(password);
        if (!isMatch) {
          return done(null, false, { message: "Incorrect password." });
        }
        return done(null, user);
      } catch (err) {
        return done(err);
      }
    }
  )
);

// Middleware d'authentification Passport
passport.serializeUser(function (user, done) {
  done(null, user.id);
});

passport.deserializeUser(function (id, done) {
  User.findById(id)
    .then((user) => {
      done(null, user); // Utilisateur trouvé, passe à Passport
    })
    .catch((err) => {
      done(err); // Gestion des erreurs
    });
});

// Middleware cookies
app.use(cookieParser());

// Routes
app.get("/", (req, res) => {
  res.render("landing");
});

const signUpRoute = require("./routes/user/usr-sign-up");
const signInRoute = require("./routes/user/usr-sign-in");
const homeRoute = require("./routes/home/home-route");
const logoutRouter = require("./routes/user/usr-logout");
const userProfile = require("./routes/user_profile/usr-profile");
const adminRoute = require("./routes/admin/admin-route");
const friendsRoute = require("./routes/friends/friends-route");
const searchFriends = require("./routes/friends/search-friends-route");

// Use routes
app.use("/sign-up", signUpRoute);
app.use("/sign-in", signInRoute);
app.use(userProfile);
app.use(homeRoute);
app.use(logoutRouter);
app.use(adminRoute);
app.use(friendsRoute);
app.use(searchFriends);

// Server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});
