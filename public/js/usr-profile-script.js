/**
 * Lorsque le DOM est complètement chargé, configure les fonctionnalités pour
 * la gestion des boutons, des formulaires et des requêtes d'amis sur le profil de l'utilisateur.
 */
document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM fully loaded and parsed");

  // Délégation d'événements pour les boutons
  document.body.addEventListener("click", (event) => {
    const target = event.target;

    // Gère le clic sur le bouton d'édition du profil
    if (target.id === "edit_profile_button") {
      console.log("Edit profile button clicked");
      const editProfileFormContainer = document.getElementById(
        "edit_profile_form_container"
      );
      if (editProfileFormContainer) {
        editProfileFormContainer.style.display = "block";
      }
    }
    // Gère le clic sur le bouton d'annulation de l'édition du profil
    else if (target.id === "cancel_edit_profile") {
      console.log("Cancel edit profile button clicked");
      const editProfileFormContainer = document.getElementById(
        "edit_profile_form_container"
      );
      if (editProfileFormContainer) {
        editProfileFormContainer.style.display = "none";
      }
    }
    // Gère le clic sur le bouton pour visiter le profil d'un ami
    else if (target.matches("button#visiting_profile")) {
      const friendMemberId = target.closest(".user_friend_list").id;
      fetch(`/user_profile/${friendMemberId}`)
        .then((response) => response.text())
        .then((html) => {
          const tempDiv = document.createElement("div");
          tempDiv.innerHTML = html;

          document.getElementById("main-content").innerHTML =
            tempDiv.querySelector("#user_profile_visit_div").innerHTML;
          loadScripts(tempDiv);

          window.history.pushState(
            { url: `/user_profile/${friendMemberId}` },
            "",
            `/user_profile/${friendMemberId}`
          );
        })
        .catch((error) => console.error("Error loading profile:", error));
    }
    // Gère le clic sur le bouton pour accepter une demande d'ami
    else if (target.matches(".accept_friend_request")) {
      const friendMemberId = target.getAttribute("data-member-id");
      fetch("/accept_friend_request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ member_id: friendMemberId }),
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.message === "You have accepted a friend request") {
            const requestElement = document.getElementById(friendMemberId);
            if (requestElement) {
              requestElement.remove();
            }

            // Ajoute le nouvel ami à la liste
            const friendListSection = document.querySelector(
              "#user_friends_list_section ul"
            );
            if (friendListSection) {
              const newFriendItem = document.createElement("li");
              newFriendItem.className = "friend-item";
              newFriendItem.innerHTML = `
              <div class="user_friend_list" id="${data.newFriend.member_id}">
                <img src="${data.newFriend.profile_pic}" />
                <span>${data.newFriend.friend_firstname} ${data.newFriend.friend_lastname}</span>
                <div class="button_friend">
                  <button type="button" id="visiting_profile">Voir le profil</button>
                  <button type="button" class="delete_friend_button" data-friend-member-id="${data.newFriend.member_id}">Supprimer</button>
                  <button type="button" class="chat_button" data-friend-member-id="${data.newFriend.member_id}" data-user-firstname="${data.newFriend.friend_firstname}" data-user-lastname="${data.newFriend.friend_lastname}">Chat</button>
                </div>
              </div>`;
              friendListSection.appendChild(newFriendItem);
            }

            // Mettre à jour les suggestions d'amis
            const suggestionsSection = document.querySelector(
              "#suggestions_section"
            );
            suggestionsSection.innerHTML = "<h2>Suggestion de Bookies</h2>";
            const limitedSuggestions = data.suggestionFriends.slice(0, 3);

            const sentFriendRequests = data.sentFriendRequests || [];

            if (Array.isArray(data.suggestionFriends)) {
              limitedSuggestions.forEach((friend) => {
                const isRequestSent = sentFriendRequests.includes(
                  friend.member_id
                );
                const newFriendItem = document.createElement("div");
                newFriendItem.className = "potential_friend";
                newFriendItem.innerHTML = `
                  <div class="friends_profile_pic">
                    <img src="${friend.profile_pic}" width="100" height="100" />
                  </div>
                  <h3>${friend.firstname} ${friend.lastname}</h3>
                  <button type="button" id="friend_${
                    friend.member_id
                  }" class="request_button" ${isRequestSent ? "disabled" : ""}>
                    ${
                      isRequestSent
                        ? "Demande envoyée"
                        : "Envoyer une invitation"
                    }
                  </button>
                `;
                suggestionsSection.appendChild(newFriendItem);
              });
            } else {
              console.error("Error: 'data.suggestionFriends' is not an array");
            }

            // Met à jour l'affichage des demandes d'amis
            const friendRequestsSection = document.querySelector(
              ".friend_requests_section"
            );
            if (friendRequestsSection) {
              const requests =
                friendRequestsSection.querySelectorAll(".friend_request");
              if (requests.length === 0) {
                friendRequestsSection.style.display = "none";
              } else {
                friendRequestsSection.style.display = "block";
              }
            }
          }
        })
        .catch((error) =>
          console.error("Error accepting friend request:", error)
        );
    }
    // Gère le clic sur le bouton pour rejeter une demande d'ami
    else if (target.matches(".reject_friend_request")) {
      const friendMemberId = target.getAttribute("data-member-id");
      fetch("/reject_friend_request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ member_id: friendMemberId }),
      })
        .then((response) => {
          if (response.ok) {
            const requestElement = target.closest(".friend_request");
            if (requestElement) {
              requestElement.remove();
            }
            const friendRequestsSection = document.querySelector(
              ".friend_requests_section"
            );
            if (friendRequestsSection) {
              const requests =
                friendRequestsSection.querySelectorAll(".friend_request");
              if (requests.length === 0) {
                friendRequestsSection.style.display = "none";
              } else {
                friendRequestsSection.style.display = "block";
              }
            }
          } else {
            console.error("Error rejecting friend request");
          }
        })
        .catch((error) =>
          console.error("Error rejecting friend request:", error)
        );
    }
    // Gère le clic sur le bouton pour afficher plus ou moins d'amis
    else if (target.id === "see_more_friends") {
      const button = target;
      const allFriends = document.querySelectorAll(
        "#user_friends_list_section ul .friend-item"
      );

      if (button.dataset.state === "show-more") {
        allFriends.forEach((friend, index) => {
          if (index >= 3) {
            friend.style.display = "block";
          }
        });
        button.textContent = "Voir moins";
        button.dataset.state = "show-less";
      } else {
        allFriends.forEach((friend, index) => {
          if (index >= 3) {
            friend.style.display = "none";
          }
        });
        button.textContent = "Voir plus";
        button.dataset.state = "show-more";
      }
    }
  });

  // Délégation pour le formulaire de profil
  document.addEventListener("submit", (event) => {
    if (event.target.id === "edit_profile_form") {
      event.preventDefault();
      console.log("Save profile form submitted");

      const formData = new FormData(event.target);
      fetch("/user_profile", {
        method: "PUT",
        body: formData,
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.success) {
            console.log("Profile successfully updated");
            const editProfileFormContainer = document.getElementById(
              "edit_profile_form_container"
            );
            if (editProfileFormContainer) {
              editProfileFormContainer.style.display = "none";
            }
            // Mise à jour des informations du profil
            document.querySelector(
              "#profile_header"
            ).innerText = `Profil de ${data.firstname} ${data.lastname}`;
            document.querySelector(
              "#profile_picture_div h2"
            ).innerText = `Nom: ${data.firstname} ${data.lastname}`;
            document.querySelector(
              "#profile_picture_div h3"
            ).innerText = `Pseudonyme: ${data.pseudonym}`;
            document.querySelector("#profile_picture_div img").src =
              data.profile_pic;
            document.querySelector("#about_me p").innerText = data.description;
            document.querySelector("#interests p").innerText =
              data.literary_preferences;
            document.querySelector(
              "#profile_picture_div h4"
            ).innerText = `Âge: ${data.age}`;
            document
              .querySelectorAll(`[data-user-email="${data.user_email}"]`)
              .forEach((img) => {
                img.src = data.profile_pic;
              });
            document.querySelectorAll(".user-status-pic").forEach((img) => {
              img.src = data.profile_pic;
            });
            document.querySelectorAll(".user-comment-pic").forEach((img) => {
              img.src = data.profile_pic;
            });
            document.querySelector(
              ".poster_name"
            ).innerText = `${data.firstname}`;
          }
        })
        .catch((error) => console.error("Error saving profile:", error));
    }
  });

  function loadScripts(tempDiv) {
    // Supprime les scripts précédemment ajoutés
    document
      .querySelectorAll("script[data-dynamic]")
      .forEach((script) => script.remove());

    // Ajoute les nouveaux scripts présents dans le contenu HTML récupéré
    const scripts = tempDiv.querySelectorAll("script[src]");
    scripts.forEach((script) => {
      const newScript = document.createElement("script");
      newScript.src = script.src;
      newScript.dataset.dynamic = "true";
      newScript.onerror = (e) =>
        console.error(`Failed to load script: ${script.src}`, e);
      document.body.appendChild(newScript);
    });
  }

  const createStatus = function (event) {
    if (event) {
      event.preventDefault();
    }

    // Sélectionne le formulaire et les champs
    const form = document.querySelector(
      "#user_statuses_div .message-form form"
    );
    const statusTextarea = document.querySelector("#statusText");
    const status_val = statusTextarea.value.trim();

    // Sélectionne l'élément pour afficher les messages d'erreur
    const errorMessageDiv = document.querySelector("#error_container");

    // Réinitialise les messages d'erreur
    if (errorMessageDiv) {
      errorMessageDiv.style.display = "none";
      errorMessageDiv.textContent = "";
    }

    const user_status = {
      status_text: status_val,
    };

    fetch("/user_message/create", {
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
        <p>${saved_status.status_text}</p>
        ${
          window.user_role === "admin" ||
          saved_status.user_email === window.user_email
            ? '<button class="delete_message_button" type="button">X</button>'
            : ""
        }
        </div>
        <ul class="friendComment-list"></ul>
        <form action="/user_message/${
          saved_status._id
        }/comment" method="POST" class="friendComment_form" data-id="${
          saved_status._id
        }">
          <textarea name="friendComment_text" placeholder="Commenter..."></textarea>
          <button type="submit">Commenter</button>
        </form>
      `;

        document
          .querySelector("#community_messages_div .messageList")
          .prepend(listItem);

        form.reset();
      })
      .catch((error) => console.error("Error during status posting:", error));
  };

  document.addEventListener("click", function (event) {
    // Gestion des clics sur les boutons de suppression de message
    if (event.target.matches(".delete_message_button")) {
      const listItem = event.target.closest(".clearfix");
      const statusId = listItem.getAttribute("data-id");
      fetch(`/user_message/${statusId}/delete`, {
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
    if (event.target.matches(".delete_friendComment_button")) {
      const commentId = event.target
        .closest("li")
        .getAttribute("data-comment-id");

      fetch(`/friendComment/${commentId}/delete`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      })
        .then((response) => {
          if (!response.ok) {
            return response.json().then((data) => {
              throw new Error(data.error);
            });
          }
          event.target.closest("li").remove();
        })
        .catch((error) => console.error("Error deleting comment:", error));
    }
  });

  document.addEventListener("submit", function (event) {
    if (event.target.matches(".friendComment_form")) {
      event.preventDefault();
      const form = event.target;
      const statusId = form.getAttribute("data-id");
      const commentText = form.querySelector(
        'textarea[name="friendComment_text"]'
      ).value;

      fetch(`/user_message/${statusId}/comment`, {
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
            `#community_messages_div li[data-id="${statusId}"] .friendComment-list`
          );
          const commentElement = document.createElement("li");
          commentElement.setAttribute("data-comment-id", savedComment._id);
          commentElement.innerHTML = `
          <img src="${savedComment.profile_pic}" alt="Avatar de l'utilisateur">
          <strong>${savedComment.firstname} :</strong>
          <p>${savedComment.user_comment_text}</p>
          ${
            window.user_role === "admin" ||
            savedComment.user_email === window.user_email
              ? '<button class="delete_friendComment_button" type="button">X</button>'
              : ""
          }
        `;
          commentList.appendChild(commentElement);

          form.querySelector('textarea[name="friendComment_text"]').value = "";
        })
        .catch((error) =>
          console.error("Error during comment posting:", error)
        );
    }
  });

  document.addEventListener("click", function (event) {
    if (event.target.matches("#createMessageButton")) {
      createStatus(event);
    }
  });
});
