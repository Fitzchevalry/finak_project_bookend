document.addEventListener("DOMContentLoaded", function () {
  console.log("Script chargé");
  const user_role = window.user_role;
  const user_email = window.user_email;

  // Fonction pour créer un nouveau statut utilisateur
  const createStatus = function () {
    const statusTextarea = document.getElementById("statuses_textarea");
    const status_val = statusTextarea.value;
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
        const listItem = document.createElement("li");
        listItem.classList.add("clearfix");
        listItem.setAttribute("data-id", saved_status._id);
        listItem.innerHTML = `
          <div class="post">
            <div class="header">
              <img src="${saved_status.profile_pic}" alt="Profile Picture">
              <div class="poster_name">${saved_status.firstname}</div>
            </div>
            <p>${status_val}</p>
            ${
              user_role === "admin" || saved_status.user_email === user_email
                ? '<button class="delete_status_button">X</button>'
                : ""
            }          </div>
          <ul class="comments-list"></ul>
          <form action="/user_status/${
            saved_status._id
          }/comment" method="POST" class="comment_form" data-id="${
          saved_status._id
        }">
            <textarea name="comment_text" rows="2" cols="30"></textarea>
            <button type="submit">Commenter</button>
          </form>`;
        document.querySelector(".user_statuses").prepend(listItem);
        statusTextarea.value = "";
      })
      .catch((error) => console.error("Error during status posting:", error));
  };

  // Fonction pour gérer les clics sur les éléments dynamiques
  document.addEventListener("click", function (event) {
    if (event.target.matches(".delete_status_button")) {
      const listItem = event.target.closest(".clearfix");
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
        .catch((error) => console.error("Error deleting status:", error));
    }

    // Gestion des clics sur les boutons de suppression de commentaire
    if (event.target.matches(".delete_comment_button")) {
      const commentId = event.target
        .closest("li")
        .getAttribute("data-comment-id");

      fetch(`/comment/${commentId}/delete`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      })
        .then((response) => {
          if (response.ok) {
            event.target.closest("li").remove();
          } else {
            return response.json().then((data) => {
              throw new Error(data.error);
            });
          }
        })
        .catch((error) => console.error("Error deleting comment:", error));
    }
  });

  // Fonction pour ajouter un commentaire
  document.addEventListener("submit", function (event) {
    if (event.target.matches(".comment_form")) {
      event.preventDefault();
      const form = event.target;
      const statusId = form.getAttribute("data-id");
      const commentText = form.querySelector(
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
          const commentList = document.querySelector(
            `.user_statuses li[data-id="${statusId}"] .comments-list`
          );
          const commentElement = document.createElement("li");
          commentElement.setAttribute("data-comment-id", savedComment._id);
          commentElement.innerHTML = `
            <img src="${
              savedComment.profile_pic
            }" alt="Avatar de l'utilisateur">
            <strong>${savedComment.firstname} :</strong>
            <span>${savedComment.comment_text}</span>
            ${
              user_role === "admin" || savedComment.user_email === user_email
                ? '<button class="delete_comment_button">X</button>'
                : ""
            }`;
          commentList.appendChild(commentElement);
          form.querySelector('textarea[name="comment_text"]').value = "";
        })
        .catch((error) =>
          console.error("Error during comment posting:", error)
        );
    }
  });

  const handleButtonClick = function (event) {
    if (event.target.matches("#submit_status_button")) {
      createStatus();
    }
  };

  document.addEventListener("click", handleButtonClick);
});
