// EN COURS...

const express = require("express");
const router = express.Router();
const {
  ensureAuthenticated,
  ensureUser,
  ensureAdmin,
} = require("../../middleware/authMiddleware");
const mongoose = require("mongoose");
const User = require("../../database-models/user-model");
const UserStatus = require("../../database-models/user_statuses_model");
const Comment = require("../../database-models/comment-model");

function formatDate(dateString) {
  const options = { day: "2-digit", month: "2-digit", year: "numeric" };
  const date = new Date(dateString);
  return date.toLocaleDateString("fr-FR", options);
}

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
        role: user.role,
      };
    }
    const firstname = req.session.user.firstname;
    const profile_pic = req.session.user.profile_pic;
    const email = req.session.user.email;

    const statuses = await UserStatus.find({})
      .sort({ createdAt: -1 })
      .populate("comments");

    const updatedStatuses = await Promise.all(
      statuses.map(async (status) => {
        const user = await User.findOne({ email: status.user_email });
        if (!user) {
          console.error(User`not found for status ${status._id}`);
          return status;
        }

        status.profile_pic = user.profile_pic || "default_profile_1.jpg";
        status.firstname = user.firstname;
        status.publication_date_formatted = formatDate(status.publication_date);

        return status;
      })
    );

    res.render("home", {
      firstname: firstname,
      user_statuses: updatedStatuses,
      user_email: email,
      profile_pic: profile_pic,
      user_role: req.session.user.role,
    });
  } catch (err) {
    console.error("Error retrieving statuses:", err);
    res.status(500).send("Error retrieving statuses");
  }
});

router.post(
  "/user_status/create",
  ensureUser || ensureAdmin,
  async (req, res) => {
    try {
      const user = await User.findById(req.session.user.id);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      const profile_pic = user.profile_pic || "default_profile_1.jpg";

      // Convertir la date en objet Date
      const publicationDate = new Date(req.body.publication_date);

      const user_status = new UserStatus({
        user_email: req.session.user.email,
        user_status: req.body.user_status,
        book_title: req.body.book_title,
        book_author: req.body.book_author,
        publication_date: publicationDate,
        initial_rating: req.body.rating,
        rating: req.body.rating,
        book_summary: req.body.book_summary,
        firstname: req.session.user.firstname,
        profile_pic: profile_pic,
      });

      const result = await user_status.save();

      // Formatage de la date pour l'envoi au frontend
      result.publication_date_formatted = formatDate(result.publication_date);

      res.status(200).json(result);
    } catch (err) {
      console.error("Error during submitting status:", err);
      res.status(500).json({ error: "Error during submitting status" });
    }
  }
);

router.delete(
  "/user_status/:id/delete",
  ensureAuthenticated || ensureAdmin,
  async (req, res) => {
    try {
      const statusId = req.params.id;
      const userEmail = req.session.user.email;

      const status = await UserStatus.findById(statusId);
      if (!status) {
        return res.status(404).json({ error: "Status not found" });
      }

      // Vérifier si l'utilisateur est admin ou le propriétaire du post
      if (req.user.role !== "admin" && status.user_email !== userEmail) {
        return res.status(403).json({ error: "Unauthorized action" });
      }

      // Supprimer les commentaires associés au post
      await Comment.deleteMany({ _id: { $in: status.comments } });
      await UserStatus.findByIdAndDelete(statusId);

      res.status(200).json(status);
    } catch (err) {
      console.error("Error deleting status:", err);
      res.status(500).json({ error: "Error deleting status" });
    }
  }
);

// Route pour obtenir un statut spécifique avec ses commentaires
router.get("/user_status/:id", async (req, res) => {
  try {
    const statusId = req.params.id;
    const status = await UserStatus.findById(statusId).populate("comments");
    if (!status) {
      return res.status(404).json({ error: "Status not found" });
    }
    res.json(status);
  } catch (err) {
    console.error("Error retrieving status:", err);
    res.status(500).json({ error: "Error retrieving status" });
  }
});

router.post(
  "/user_status/:id/comment",
  ensureAuthenticated || ensureAdmin,
  async (req, res) => {
    try {
      const statusId = req.params.id;
      const user = await User.findById(req.session.user.id);
      if (!user) {
        console.error("User not found");
        res.status(500).json({ error: "Error finding user" });
        return;
      }

      const profile_pic = user.profile_pic || "default_profile_1.jpg";
      const comment = new Comment({
        user_email: req.session.user.email,
        comment_text: req.body.comment_text,
        firstname: req.session.user.firstname,
        profile_pic: user.profile_pic,
        status_id: statusId,
        rating: req.body.rating, // Note donnée par l'utilisateur
      });

      const savedComment = await comment.save();

      const status = await UserStatus.findById(statusId);
      if (!status) {
        console.error("Status not found");
        res.status(404).json({ error: "Status not found" });
        return;
      }

      status.comments.push(savedComment._id);

      // Recalculer la note moyenne
      const comments = await Comment.find({ status_id: statusId });
      const totalRatings = comments.reduce(
        (acc, comment) => acc + (comment.rating || 0),
        status.initial_rating || 0
      );
      const averageRating =
        totalRatings / (comments.length + (status.initial_rating ? 1 : 0));
      status.rating = averageRating; // Mettre à jour la note moyenne
      await status.save();

      res.status(200).json(savedComment);
    } catch (err) {
      console.error("Error during comment creation:", err);
      res.status(500).json({ error: "Error during comment creation" });
    }
  }
);

router.delete(
  "/comment/:id/delete",
  ensureAuthenticated || ensureAdmin,
  async (req, res) => {
    try {
      const commentId = req.params.id;
      const userEmail = req.session.user.email;

      if (!mongoose.Types.ObjectId.isValid(commentId)) {
        return res.status(400).json({ error: "Invalid comment ID" });
      }

      const comment = await Comment.findById(commentId);
      if (!comment) {
        return res.status(404).json({ error: "Comment not found" });
      }

      if (req.user.role !== "admin" && comment.user_email !== userEmail) {
        return res.status(403).json({ error: "Unauthorized action" });
      }

      await Comment.findByIdAndDelete(commentId);
      await UserStatus.updateOne(
        { _id: comment.status_id },
        { $pull: { comments: commentId } }
      );

      const status = await UserStatus.findById(comment.status_id).populate(
        "comments"
      );
      if (status) {
        const comments = status.comments;
        const initialRating = status.initial_rating || 0;
        const totalRatings = comments.reduce(
          (acc, comment) => acc + (comment.rating || 0),
          initialRating
        );
        const averageRating = comments.length
          ? totalRatings / (comments.length + (initialRating ? 1 : 0))
          : initialRating;
        status.rating = averageRating; // Recalculer la note moyenne
        await status.save();
      }

      res.status(204).send();
    } catch (err) {
      console.error("Error deleting comment:", err);
      res.status(500).json({ error: "Error deleting comment" });
    }
  }
);

module.exports = router;
