require("dotenv").config();
const port = process.env.PORT || 3000;
const path = require("path");
const passport = require("passport");
const socketIo = require("socket.io");
const cookieParser = require("cookie-parser");
const User = require("./database-models/user-model");
const Message = require("./database-models/message-model");
const Notification = require("./database-models/notifications-model");
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
app.use("/images", express.static(path.join(__dirname, "public/images")));
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
        const isValid = await user.validPassword(password);
        if (!isValid) {
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

// app.get("*", (req, res) => {
//   res.render("home"); // Affiche la vue principale de votre SPA
// });

// Server
const server = app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});

const io = socketIo(server);
io.on("connection", (socket) => {
  console.log("A user connected");

  socket.on("get notifications", async (userId) => {
    try {
      const notifications = await Notification.find({
        receiverId: userId,
        read: false,
      });
      socket.emit("notifications", notifications);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  });

  socket.on("mark notifications as read", async (notificationIds) => {
    try {
      await Notification.updateMany(
        { _id: { $in: notificationIds } },
        { read: true }
      );
      console.log(
        `Notifications marked as read: ${notificationIds.join(", ")}`
      );
    } catch (error) {
      console.error("Error marking notifications as read:", error);
    }
  });

  socket.on("join room", (roomId) => {
    socket.join(roomId);
    console.log(`User joined room: ${roomId}`);
  });

  socket.on("chat message", async (data) => {
    const {
      senderId,
      receiverId,
      message,
      senderName,
      senderProfilePic,
      roomId,
    } = data;

    try {
      const newMessage = new Message({
        senderId,
        receiverId,
        message,
        senderName,
        senderProfilePic,
        roomId,
      });
      await newMessage.save();
      console.log(`Message saved: ${message}`);

      const notification = new Notification({
        receiverId,
        senderId,
        messageId: newMessage._id,
      });
      await notification.save();
      console.log(`Notification saved for receiver ${receiverId}`);

      io.to(roomId).emit("chat message", {
        ...data,
        notificationId: notification._id,
      });
      console.log(`Message sent from ${senderId} to ${receiverId}: ${message}`);
    } catch (error) {
      console.error("Error saving message or notification:", error);
    }
  });

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});
