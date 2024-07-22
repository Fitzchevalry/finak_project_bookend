require("dotenv").config();
const port = process.env.PORT || 3000;
const path = require("path");
const passport = require("passport");
const socketIo = require("socket.io");
const cookieParser = require("cookie-parser");
const User = require("./database-models/user-model");
const LocalStrategy = require("passport-local").Strategy;
const bodyParser = require("body-parser");
const mongodbURI = process.env.MONGODB_URI;
const sessionSecret = process.env.SESSION_SECRET;

const express = require("express");
const app = express();
const session = require("express-session");
const mongoose = require("mongoose");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));

mongoose.connect(mongodbURI);
mongoose.connection.on("connected", () => {
  console.log("Connected to MongoDB");
});

mongoose.connection.on("error", (err) => {
  console.error("Failed to connect to MongoDB:", err);
});

// Set Pug
app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));

// Fichiers statics
app.use(express.static(path.join(__dirname, "public")));
app.use(
  "/user-profile-images",
  express.static(path.join(__dirname, "public/images/user-profile-images"))
);

// Middleware pour gérer les sessions
app.use(
  session({
    secret: sessionSecret,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false, httpOnly: true }, // true pour https
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
      done(null, user);
    })
    .catch((err) => {
      done(err);
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
const forgotPasswordRoute = require("./routes/user/forgot-pwd");

// Use routes
app.use("/sign-up", signUpRoute);
app.use("/sign-in", signInRoute);
app.use(userProfile);
app.use(homeRoute);
app.use(logoutRouter);
app.use(adminRoute);
app.use(friendsRoute);
app.use(searchFriends);
app.use(forgotPasswordRoute);

// Server
const server = app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});

const io = socketIo(server);
io.on("connection", (socket) => {
  console.log("A user connected");
  // Join a room when a user starts a chat with someone
  socket.on("join room", (roomId) => {
    socket.join(roomId);
    console.log(`User joined room: ${roomId}`);
  });
  // Listener pour les messages de chat
  socket.on("chat message", (data) => {
    const { senderId, receiverId, message, senderName, senderProfilePic } =
      data;
    io.to(data.roomId).emit("chat message", data);
    console.log(`Message sent from ${senderId} to ${receiverId}: ${message}`);
  });
  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});
// io.on("connection", (socket) => {
//   console.log("A user connected");

//   socket.on("sendMessage", (message) => {
//     console.log("Message received:", message);
//     io.emit("receiveMessage", message);
//   });

//   socket.on("disconnect", () => {
//     console.log("User disconnected");
//   });
// });
