document.addEventListener("DOMContentLoaded", function () {
  console.log("Script chargé");
  const user_role = window.user_role;
  const user_email = window.user_email;

  // Fonction pour créer une nouvelle critique de livre
  const createStatus = function (event) {
    if (event) {
      event.preventDefault();
    }

    // Sélectionnez le formulaire et les champs
    const form = document.querySelector(".status-form form");
    const bookTitle = document.getElementById("book_title").value.trim();
    const bookAuthor = document.getElementById("book_author").value.trim();
    const publicationDate = document
      .getElementById("publication_date")
      .value.trim();
    const rating = document.getElementById("rating").value.trim();
    const bookSummary = document.getElementById("book_summary").value.trim();
    const statusTextarea = document.getElementById("statuses_textarea");
    const status_val = statusTextarea.value.trim();

    // Sélectionnez l'élément pour afficher les messages d'erreur
    const errorMessageDiv = document.getElementById("error_container");

    // Réinitialisez les messages d'erreur
    errorMessageDiv.style.display = "none";
    errorMessageDiv.textContent = "";

    // Vérifiez si les champs sont valides
    if (
      !bookTitle ||
      !bookAuthor ||
      !publicationDate ||
      !bookSummary ||
      !status_val
    ) {
      errorMessageDiv.textContent = "Tous les champs doivent être remplis.";
      errorMessageDiv.style.display = "block";
      return;
    }

    if (rating < 1 || rating > 5) {
      errorMessageDiv.textContent = "La note doit être entre 1 et 5.";
      errorMessageDiv.style.display = "block";
      return;
    }

    const user_status = {
      user_status: status_val,
      book_title: bookTitle,
      book_author: bookAuthor,
      publication_date: publicationDate,
      rating: rating,
      book_summary: bookSummary,
    };

    fetch("/user_status/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(user_status),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
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
            <p><strong>Titre:</strong> ${saved_status.book_title}</p>
            <p><strong>Auteur:</strong> ${saved_status.book_author}</p>
            <p><strong>Date de parution:</strong> ${
              saved_status.publication_date
            }</p>
            <p><strong>Note Moyenne:</strong> ${saved_status.rating}</p>
             <p><strong>Ma note:</strong> ${saved_status.initial_rating}</p>
            <p><strong>Résumé:</strong> ${saved_status.book_summary}</p>
            <p><strong>Mon avis:</strong> ${status_val}</p>
            ${
              user_role === "admin" || saved_status.user_email === user_email
                ? '<button class="delete_status_button">X</button>'
                : ""
            }
          </div>
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

        form.reset();
      })
      .catch((error) => console.error("Error during status posting:", error));
  };

  // Fonction pour gérer les clics sur les éléments dynamiques
  document.addEventListener("click", function (event) {
    // Gestion des clics sur les boutons de suppression de statut
    if (event.target.matches(".delete_comment_button")) {
      const commentId = event.target
        .closest("li")
        .getAttribute("data-comment-id");
      const statusId = event.target
        .closest("li")
        .parentElement.parentElement.getAttribute("data-id");

      fetch(`/comment/${commentId}/delete`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      })
        .then((response) => {
          if (response.ok) {
            event.target.closest("li").remove();
            updateAverageRating(statusId);
          } else {
            return response.json().then((data) => {
              throw new Error(data.error);
            });
          }
        })
        .catch((error) => console.error("Error deleting comment:", error));
    }
  });

  // Fonction pour mettre à jour la note moyenne
  function updateAverageRating(statusId) {
    fetch(`/user_status/${statusId}`)
      .then((response) => response.json())
      .then((status) => {
        const comments = status.comments;
        const initialRating = status.initial_rating || 0;
        const totalRatings = comments.reduce(
          (acc, comment) => acc + (comment.rating || 0),
          initialRating
        );
        const averageRating = comments.length
          ? totalRatings / (comments.length + (initialRating ? 1 : 0))
          : initialRating;
        document.querySelector(
          `.user_statuses li[data-id="${statusId}"] p:nth-of-type(4)`
        ).innerHTML = `<strong>Note Moyenne:</strong> ${averageRating.toFixed(
          1
        )}`;
      })
      .catch((error) => console.error("Error updating average rating:", error));
  }

  // Fonction pour ajouter un commentaire
  document.addEventListener("submit", function (event) {
    if (event.target.matches(".comment_form")) {
      event.preventDefault();
      const form = event.target;
      const statusId = form.getAttribute("data-id");
      const commentText = form.querySelector(
        'textarea[name="comment_text"]'
      ).value;
      const rating = form.querySelector('input[name="rating"]').value;

      fetch(`/user_status/${statusId}/comment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ comment_text: commentText, rating: rating }),
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
            <p><strong>Ma note:</strong> ${savedComment.rating || "N/A"}</p>
            ${
              user_role === "admin" || savedComment.user_email === user_email
                ? '<button class="delete_comment_button">X</button>'
                : ""
            }
          `;
          commentList.appendChild(commentElement);

          updateAverageRating(statusId);

          form.querySelector('textarea[name="comment_text"]').value = "";
          form.querySelector('input[name="rating"]').value = "";
        })
        .catch((error) =>
          console.error("Error during comment posting:", error)
        );
    }
  });

  const handleButtonClick = function (event) {
    if (event.target.matches("#submit_status_button")) {
      createStatus(event);
    }
  };

  document.addEventListener("click", handleButtonClick);
});
