//EN COURS...

document.addEventListener("DOMContentLoaded", () => {
  const editProfileButton = document.getElementById("edit_profile_button");
  if (editProfileButton) {
    editProfileButton.addEventListener("click", () => {
      console.log("Edit profile button clicked");
      const editProfileFormContainer = document.getElementById(
        "edit_profile_form_container"
      );
      if (editProfileFormContainer) {
        editProfileFormContainer.style.display = "block";
      }
    });
  }

  document.addEventListener("click", (event) => {
    if (event.target && event.target.id === "cancel_edit_profile") {
      console.log("Cancel edit profile button clicked");
      const editProfileFormContainer = document.getElementById(
        "edit_profile_form_container"
      );
      if (editProfileFormContainer) {
        editProfileFormContainer.style.display = "none";
      }
    }
  });

  const editProfileForm = document.getElementById("edit_profile_form");
  if (editProfileForm) {
    editProfileForm.addEventListener("submit", (event) => {
      event.preventDefault();
      console.log("Save profile form submitted");

      const formData = new FormData(editProfileForm);
      fetch("/user_profile/edit", {
        method: "POST",
        body: formData,
      })
        .then((response) => {
          if (response.ok) {
            return response.json();
          } else {
            return response.json().then((data) => {
              console.error(
                "Failed to save profile:",
                data.message || response.statusText
              );
            });
          }
        })
        .then((data) => {
          if (data.success) {
            console.log("Profile successfully updated");
            const editProfileFormContainer = document.getElementById(
              "edit_profile_form_container"
            );
            if (editProfileFormContainer) {
              editProfileFormContainer.style.display = "none";
            }

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
          }
        })
        .catch((error) => {
          console.error("Error saving profile:", error);
        });
    });
  }

  const requestButton = document.getElementById("request_button");
  if (requestButton) {
    requestButton.addEventListener("click", () => {
      const friendMemberId = requestButton.dataset.friendMemberId;

      fetch("/friend_request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ friend_member_id: friendMemberId }),
      })
        .then((response) => {
          if (!response.ok) {
            if (response.status === 400) {
              throw new Error("Friend request already sent");
            } else {
              throw new Error(`HTTP error! Status: ${response.status}`);
            }
          }
          return response.json();
        })
        .then((data) => {
          requestButton.textContent = "Demande envoyée";
          requestButton.disabled = true;
          console.log("Friend request sent successfully");
        })
        .catch((error) => {
          console.error("Error sending friend request:", error);
          if (error.message === "Friend request already sent") {
            requestButton.textContent = "Demande déjà envoyée";
            requestButton.disabled = true;
          } else {
            requestButton.textContent = "Envoyer une invitation";
            requestButton.disabled = false;
          }
        });
    });
  }

  const viewProfileButtons = document.querySelectorAll("#visiting_profile");
  viewProfileButtons.forEach((button) => {
    button.addEventListener("click", (event) => {
      const friendId = event.target.parentElement.id;
      window.location.href = `/user_profile/${friendId}`;
    });
  });

  document.querySelectorAll(".accept_friend_request").forEach((button) => {
    button.addEventListener("click", function () {
      const friendMemberId = this.getAttribute("data-member-id");
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
            const friendListSection = document.querySelector(
              "#user_friends_list_section ul"
            );
            if (friendListSection) {
              const newFriendItem = document.createElement("li");
              newFriendItem.innerHTML = `
                <div class="user_friend_list" id="${data.newFriend.member_id}">
                  <img src="${data.newFriend.profile_pic}" />
                  <span>${data.newFriend.friend_firstname} ${data.newFriend.friend_lastname}</span>
                  <button type="button" id="visiting_profile">Voir le profil</button>
                  <button type="button" class="chat_button">Chat</button>
                  <button type="button" class="delete_friend_button" data-friend-member-id="${data.newFriend.member_id}">Supprimer</button>
                </div>`;

              friendListSection.appendChild(newFriendItem);
            } else {
              console.error("Friend list section not found");
            }

            const suggestionElements =
              document.querySelectorAll(".potential_friends");
            suggestionElements.forEach((element) => {
              const h3Element = element.querySelector("h3");
              if (
                h3Element.innerText ===
                `${data.newFriend.friend_firstname} ${data.newFriend.friend_lastname}`
              ) {
                element.remove();
              }
            });
          }
        })
        .catch((error) => {
          console.error("There was an error!", error);
        });
    });
  });

  document.querySelectorAll(".reject_friend_request").forEach((button) => {
    button.addEventListener("click", function () {
      const friendMemberId = this.getAttribute("data-member-id");
      fetch("/reject_friend_request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ member_id: friendMemberId }),
      })
        .then((response) => {
          if (response.ok) {
            console.log("Friend request rejected");
            // Mettre à jour le DOM pour retirer la demande d'ami
            const requestElement = document.getElementById(friendMemberId);
            if (requestElement) {
              requestElement.remove();
            }
          } else {
            console.log("Error rejecting friend request");
          }
        })
        .catch((error) => {
          console.error("There was an error!", error);
        });
    });
  });

  // Délégué d'événement pour les boutons "Voir le profil"
  const friendListSection = document.querySelector(
    "#user_friends_list_section ul"
  );
  if (friendListSection) {
    friendListSection.addEventListener("click", function (event) {
      const target = event.target;
      if (target.matches("button#visiting_profile")) {
        const friendMemberId = target.closest(".user_friend_list").id;
        window.location.href = `/user_profile/${friendMemberId}`;
      }
    });
  }
});
