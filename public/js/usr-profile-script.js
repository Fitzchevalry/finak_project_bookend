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
            console.log("Profile successfully updated");
            const editProfileFormContainer = document.getElementById(
              "edit_profile_form_container"
            );
            if (editProfileFormContainer) {
              editProfileFormContainer.style.display = "none";
            }
            location.reload();
          } else {
            return response.json().then((data) => {
              console.error(
                "Failed to save profile:",
                data.message || response.statusText
              );
            });
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

      fetch("/profile_friend_request", {
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
        .then((response) => {
          if (response.ok) {
            console.log("Friend request accepted");
            location.reload();
          } else {
            console.log("Error accepting friend request");
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
            console.log("Friend request accepted");
            location.reload();
          } else {
            console.log("Error accepting friend request");
          }
        })
        .catch((error) => {
          console.error("There was an error!", error);
        });
    });
  });
});
