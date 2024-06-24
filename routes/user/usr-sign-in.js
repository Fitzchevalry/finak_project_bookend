const express = require("express");
const router = express.Router();
const User = require("../../database-models/user-model");

router.post("/", (req, res) => {
  const { email, password } = req.body;
  console.log("Received login request for email:", email);

  User.findOne({ email, password })
    .then((valid_user) => {
      if (valid_user) {
        console.log("Valid user found:", valid_user.email);
        req.session.user = {
          email: valid_user.email,
          member_id: valid_user.member_id,
          firstname: valid_user.firstname,
        };
        res
          .status(200)
          .json({ message: "Login successful", redirect: "/home" });
      } else {
        console.log("Invalid email or password");
        res.status(400).json({ message: "Invalid email or password" });
      }
    })
    .catch((err) => {
      console.error("Error during login:", err);
      res.status(500).send("Error during login");
    });
});

module.exports = router;
