// user-profile-visit-script.js

document.addEventListener("DOMContentLoaded", function () {
  // Fonction pour ajouter un commentaire à un statut
  const addComment = function (event) {
    event.preventDefault();
    const statusId = this.getAttribute("data-id");
    const commentText = this.querySelector(
      'textarea[name="comment_text"]'
    ).value;

    fetch(`/user_status/${statusId}/comment`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ comment_text: commentText }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Error posting comment");
        }
        return response.json();
      })
      .then((savedComment) => {
        console.log("Comment posted successfully:", savedComment);

        const commentList = this.closest("li").querySelector(".comments-list");
        const commentElement = document.createElement("li");
        commentElement.setAttribute("data-comment-id", savedComment._id);
        commentElement.innerHTML = `
            <strong>${savedComment.firstname} :</strong>
            <span>${savedComment.comment_text}</span>
            <button class="delete_comment_button">Supprimer</button>`;

        commentElement
          .querySelector(".delete_comment_button")
          .addEventListener("click", deleteComment);

        commentList.appendChild(commentElement);

        this.querySelector('textarea[name="comment_text"]').value = "";
      })
      .catch((error) => {
        console.error("Error during comment posting:", error);
      });
  };

  // Fonction pour supprimer un commentaire
  const deleteComment = function () {
    const commentId = this.closest("li").getAttribute("data-comment-id");
    if (!commentId) {
      console.error("Comment ID is missing or invalid.");
      return;
    }

    fetch(`/comment/${commentId}/delete`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((response) => {
        if (response.ok) {
          this.closest("li").remove();
        } else {
          return response.json().then((data) => {
            throw new Error(data.error);
          });
        }
      })
      .catch((error) => {
        console.error("Error deleting comment:", error);
      });
  };

  // Ajouter les événements aux formulaires de commentaire et aux boutons de suppression de commentaire
  document.querySelectorAll(".comment_form").forEach((form) => {
    form.addEventListener("submit", addComment);
  });

  document.querySelectorAll(".delete_comment_button").forEach((button) => {
    button.addEventListener("click", deleteComment);
  });
});
