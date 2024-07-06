//EN COURS...

document.addEventListener("DOMContentLoaded", function () {
  // Fonction pour créer un nouveau statut utilisateur
  const createStatus = function () {
    const status_val = document.getElementById("statuses_textarea").value;
    const user_status = { user_status: status_val };

    fetch("/user_status/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(user_status),
    })
      .then((response) => response.json())
      .then((saved_status) => {
        console.log("Response from server:", saved_status);
        const listItem = document.createElement("li");
        listItem.classList.add("clearfix");
        listItem.setAttribute("data-id", saved_status._id);
        listItem.innerHTML = `
          <img src="${saved_status.profile_pic}" alt="Profile Picture">
          <div class="poster_name">${saved_status.firstname}</div>
          <p>${status_val}</p>
          <button class="delete_status_button">Supprimer</button>
          <ul class="comments-list"></ul>
          <form action="/user_status/${saved_status._id}/comment" method="POST" class="comment_form" data-id="${saved_status._id}">
            <textarea name="comment_text"></textarea>
            <button type="submit">Commenter</button>
          </form>`;
        document.querySelector(".user_statuses").appendChild(listItem);

        listItem
          .querySelector(".delete_status_button")
          .addEventListener("click", deleteStatus);
        listItem
          .querySelector(".comment_form")
          .addEventListener("submit", addComment);
      })
      .catch((error) => {
        console.error("Error during status posting:", error);
      });
  };

  // Fonction pour supprimer un statut utilisateur
  const deleteStatus = function () {
    const listItem = this.closest("li");
    const statusId = listItem.getAttribute("data-id");

    fetch(`/user_status/${statusId}/delete`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((response) => {
        if (response.ok) {
          listItem.remove();
        } else {
          return response.json().then((data) => {
            throw new Error(data.error);
          });
        }
      })
      .catch((error) => {
        console.error("Error deleting status:", error);
      });
  };

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

  document
    .getElementById("submit_status_button")
    .addEventListener("click", createStatus);
  document.querySelectorAll(".delete_status_button").forEach((button) => {
    button.addEventListener("click", deleteStatus);
  });
  document.querySelectorAll(".comment_form").forEach((form) => {
    form.addEventListener("submit", addComment);
  });
  document.querySelectorAll(".delete_comment_button").forEach((button) => {
    button.addEventListener("click", deleteComment);
  });
});
