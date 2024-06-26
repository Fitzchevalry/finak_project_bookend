const express = require("express");
const router = express.Router();
const User = require("../../database-models/user-model");

router.post("/", (req, res) => {
  const { email, lastname, firstname, password } = req.body;

  User.findOne({ email })
    .then((existingUser) => {
      if (existingUser) {
        return res.status(400).json({
          message:
            "This email has already been registered. Try again with another email.",
        });
      } else {
        const user = new User({
          email,
          lastname,
          firstname,
          password,
        });

        return user.save();
      }
    })
    .then((savedUser) => {
      if (savedUser) {
        req.session.user = {
          email: savedUser.email,
          member_id: savedUser.member_id,
          lastname: savedUser.lastname,
          firstname: savedUser.firstname,
        };
        return res.status(200).json({
          message: "Successfully signed up",
          redirect: "/home",
        });
      }
    })
    .catch((err) => {
      console.error("Error during sign-up:", err);
      return res.status(500).json({ message: "Error during signing up" });
    });
});

module.exports = router;
