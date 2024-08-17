const express = require("express");
const router = express.Router();
const User = require("../../database-models/user-model");
const UserStatus = require("../../database-models/user_statuses_model");
const {
  ensureAuthenticated,
  ensureAdmin,
} = require("../../middleware/authMiddleware");

// Route GET /search_friends
router.get(
  "/search_friends",
  ensureAuthenticated || ensureAdmin,
  async (req, res) => {
    // Récupération du terme de recherche depuis la requête
    const searchQuery = req.query.search_term;

    try {
      // Recherche des utilisateurs dont le prénom ou le nom correspond au terme de recherche
      const users = await User.find({
        $or: [
          { firstname: { $regex: searchQuery, $options: "i" } },
          { lastname: { $regex: searchQuery, $options: "i" } },
        ],
        email: { $ne: req.user.email },
        role: "user",
      });
      console.log("Found Users:", users);

      // Recherche des statuts de livres dont le titre ou l'auteur correspond au terme de recherche
      const bookStatuses = await UserStatus.find({
        $or: [
          { book_title: { $regex: searchQuery, $options: "i" } },
          { book_author: { $regex: searchQuery, $options: "i" } },
        ],
      }).populate("comments");

      // Récupération des informations de l'utilisateur courant
      const currentUser = await User.findOne({ email: req.user.email });
      const sentFriendRequests = currentUser.sent_friend_requests.map(
        (req) => req.member_id
      );
      const friends = currentUser.friends.map((friend) => friend.member_id);

      if (req.xhr) {
        res.render("search-friends-results", {
          users,
          bookStatuses,
          searchQuery,
          sentFriendRequests,
          friends,
          user_role: req.session.user.role,
        });
      } else {
        res.render("search-friends-results", {
          users,
          bookStatuses,
          searchQuery,
          sentFriendRequests,
          friends,
          user_role: req.session.user.role,
        });
      }
    } catch (err) {
      console.error("Error searching for friends:", err);
      res.status(500).send("Internal Server Error");
    }
  }
);

router.get("/search_suggestions", async (req, res) => {
  const query = req.query.query;
  if (!query) {
    return res.json({ suggestions: [] });
  }

  try {
    // Rechercher les utilisateurs correspondant à la requête
    const users = await User.find({
      $or: [{ firstname: { $regex: query, $options: "i" } }],
      $or: [{ lastname: { $regex: query, $options: "i" } }],
    }).limit(10);

    // Rechercher les titres de livres correspondant à la requête
    const books = await UserStatus.find({
      $or: [
        { book_title: { $regex: query, $options: "i" } },
        { book_author: { $regex: query, $options: "i" } },
      ],
    }).limit(10);

    const suggestions = [
      ...users.map((user) => user.firstname),
      ...books.map((book) => book.book_title),
    ];

    res.json({ suggestions });
  } catch (err) {
    console.error("Error fetching suggestions:", err);
    res.status(500).send("Internal Server Error");
  }
});
module.exports = router;
