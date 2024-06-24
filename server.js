const express = require("express");
const path = require("path");
const app = express();
const port = 3000;
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const session = require("express-session");

const User = require("./database-models/user-model");
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

// Parse JSON bodies
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Middleware pour parser les cookies
app.use(cookieParser());

// Middleware pour gérer les sessions
app.use(
  session({
    secret: "your_secret_key",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }, // set to true if using https
  })
);

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

// app.get("/home", simpleCookieStrategy, (req, res) => {
//   if (req.session.user) {
//     res.render("home", { user: req.session.user });
//   } else {
//     res.redirect("/sign-in");
//   }
// });

const signUpRoute = require("./routes/user/usr-sign-up");
const signInRoute = require("./routes/user/usr-sign-in");
const homeRoute = require("./routes/home/home-route");
const logoutRouter = require("./routes/user/usr-logout");

// Use routes
app.use("/sign-up", signUpRoute);
app.use("/sign-in", signInRoute);
app.use(homeRoute);
app.use(logoutRouter);
app.use(
  express.static(path.join(__dirname, "public/images/user-profile-images"))
);

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});
