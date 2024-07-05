// EN COURS...

const express = require("express");
const router = express.Router();
const {
  ensureAuthenticated,
  ensureUser,
  ensureAdmin,
} = require("../../middleware/authMiddleware");
const User = require("../../database-models/user-model");
const UserStatus = require("../../database-models/user_statuses_model");
const Comment = require("../../database-models/comment-model");

// Route GET /home
router.get("/home", ensureAuthenticated, async (req, res) => {
  try {
    if (!req.session.user) {
      const user = await User.findById(req.user.id);
      if (!user) {
        throw new Error("User not found in database");
      }
      req.session.user = {
        id: user.id,
        firstname: user.firstname,
        lastname: user.lastname,
        email: user.email,
        profile_pic: user.profile_pic,
      };
    }
    const firstname = req.session.user.firstname;
    const profile_pic = req.session.user.profile_pic;
    const email = req.session.user.email;

    const statuses = await UserStatus.find({}).populate("comments");
    const updatedStatuses = await Promise.all(
      statuses.map(async (status) => {
        const user = await User.findOne({ email: status.user_email });
        if (!user) {
          console.error(`User not found for status ${status._id}`);
          return status;
        }

        status.profile_pic = user.profile_pic || "default_profile_1.jpg";
        status.firstname = user.firstname;
        return status;
      })
    );

    res.render("home", {
      firstname: firstname,
      user_statuses: statuses,
      user_email: email,
    });
  } catch (err) {
    console.error("Error retrieving statuses:", err);
    res.status(500).send("Error retrieving statuses");
  }
});

// Route POST /user_status/create
router.post(
  "/user_status/create",
  ensureUser || ensureAdmin,
  async (req, res) => {
    try {
      const user = await User.findById(req.session.user.id);
      if (!user) {
        console.error("User not found");
        res.status(500).json("Error finding user");
        return;
      }
      const profile_pic = user.profile_pic || "default_profile_1.jpg";
      const user_status = new UserStatus({
        user_email: req.session.user.email,
        user_status: req.body.user_status,
        firstname: req.session.user.firstname,
        profile_pic: profile_pic,
      });

      const result = await user_status.save();
      res.status(200).json(result);
    } catch (err) {
      console.error("Error during submitting status:", err);
      res.status(500).json("Error during submitting status");
    }
  }
);

// Route DELETE /user_status/:id/delete
router.delete(
  "/user_status/:id/delete",
  ensureUser || ensureAdmin,
  async (req, res) => {
    try {
      const statusId = req.params.id;
      const userEmail = req.session.user.email;

      const status = await UserStatus.findById(statusId);

      if (!status) {
        return res.status(404).json({ error: "Status not found" });
      }

      if (status.user_email !== userEmail) {
        return res.status(403).json({ error: "Unauthorized action" });
      }

      await UserStatus.findByIdAndDelete(statusId);
      res.status(200).json({ message: "Status deleted successfully" });
    } catch (err) {
      console.error("Error deleting status:", err);
      res.status(500).json("Error deleting status");
    }
  }
);

router.post(
  "/user_status/:id/comment",
  ensureAuthenticated,
  async (req, res) => {
    try {
      const statusId = req.params.id;
      const user = await User.findById(req.session.user.id);
      if (!user) {
        console.error("User not found");
        res.status(500).json("Error finding user");
        return;
      }

      const profile_pic = user.profile_pic || "default_profile_1.jpg";
      const comment = new Comment({
        user_email: req.session.user.email,
        comment_text: req.body.comment_text,
        firstname: req.session.user.firstname,
        profile_pic: profile_pic,
        status_id: statusId,
      });

      const savedComment = await comment.save();

      const status = await UserStatus.findById(statusId);
      if (!status) {
        console.error("Status not found");
        res.status(404).json("Status not found");
        return;
      }

      status.comments.push(savedComment._id);
      await status.save();

      res.redirect("/home");
    } catch (err) {
      console.error("Error during comment creation:", err);
      res.status(500).json("Error during comment creation");
    }
  }
);

module.exports = router;
