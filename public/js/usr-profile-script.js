document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM fully loaded and parsed");

  // Délégation d'événements pour les boutons
  document.body.addEventListener("click", (event) => {
    const target = event.target;

    if (target.id === "edit_profile_button") {
      console.log("Edit profile button clicked");
      const editProfileFormContainer = document.getElementById(
        "edit_profile_form_container"
      );
      if (editProfileFormContainer) {
        editProfileFormContainer.style.display = "block";
      }
    } else if (target.id === "cancel_edit_profile") {
      console.log("Cancel edit profile button clicked");
      const editProfileFormContainer = document.getElementById(
        "edit_profile_form_container"
      );
      if (editProfileFormContainer) {
        editProfileFormContainer.style.display = "none";
      }
    } else if (target.matches("button#visiting_profile")) {
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
    } else if (target.matches(".accept_friend_request")) {
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
            // Ajouter le nouvel ami à la liste
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
                <button type="button" id="visiting_profile">Voir le profil</button>
                <button type="button" class="delete_friend_button" data-friend-member-id="${data.newFriend.member_id}">Supprimer</button>
                <button type="button" class="chat_button" data-friend-member-id="${data.newFriend.member_id}" data-user-firstname="${data.newFriend.friend_firstname}" data-user-lastname="${data.newFriend.friend_lastname}">Chat</button>
              </div>`;
              friendListSection.appendChild(newFriendItem);
            }
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
                newFriendItem.className = "potential_friends";
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
    } else if (target.matches(".reject_friend_request")) {
      const friendMemberId = target.getAttribute("data-member-id");
      fetch("/reject_friend_request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ member_id: friendMemberId }),
      })
        .then((response) =>
          response.ok
            ? target.closest(".friend_request").remove()
            : console.error("Error rejecting friend request")
        )
        .catch((error) =>
          console.error("Error rejecting friend request:", error)
        );
    } else if (target.matches("#request_button")) {
      const friendMemberId = target.dataset.friendMemberId;
      fetch("/friend_request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ friend_member_id: friendMemberId }),
      })
        .then((response) => response.json())
        .then((data) => {
          target.textContent = "Demande envoyée";
          target.disabled = true;
        })
        .catch((error) =>
          console.error("Error sending friend request:", error)
        );
    } else if (target.id === "see_more_friends") {
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
            // Mettre à jour les informations du profil
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
              .querySelectorAll(".profile_picture_in_status")
              .forEach((element) => (element.src = data.profile_pic));
          }
        })
        .catch((error) => console.error("Error saving profile:", error));
    }
  });
});
