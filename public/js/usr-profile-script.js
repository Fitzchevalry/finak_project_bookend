// document.addEventListener("DOMContentLoaded", () => {
// const socket = io();

// // Attach member_id and user_name to socket
// socket.emit("attach_member_id", {
//   member_id: "#{member_id}",
//   user_name: "#{name}",
// });

// // Handle sending user message
// function sendUserMessage(usr_msg) {
//   socket.emit("send_chat_message", usr_msg);
// }

// // Handle receiving chat message
// socket.on("receive_chat_message", (received_msg) => {
//   const specificChatboxId = "#" + received_msg.user_member_id;
//   const chatSection = document.querySelector(
//     .chat_section ${specificChatboxId}
//   );
//   if (chatSection) {
//     const usrMsgDiv = document.createElement("div");
//     usrMsgDiv.className = "usr_msg";
//     usrMsgDiv.innerHTML = <span class='user_with_message'>${received_msg.user_name}:&nbsp</span><div class=usr_msg_box>${received_msg.msg}</div>;
//     chatSection.appendChild(usrMsgDiv);
//   }
// });

// // Handle sending chat message on Enter key press
// document.addEventListener("keypress", (event) => {
//   if (
//     event.target &&
//     event.target.id === "send_message_input" &&
//     event.keyCode === 13
//   ) {
//     const chatMessageContent = event.target.value;
//     const allChatMessages = document.querySelector(".all_chat_messages");
//     if (allChatMessages) {
//       const usrMsgDiv = document.createElement("div");
//       usrMsgDiv.className = "usr_msg";
//       usrMsgDiv.innerHTML = <span class='user_with_message'>You:</span><div class='usr_msg_box'><p>${chatMessageContent}</p></div>;
//       allChatMessages.appendChild(usrMsgDiv);
//     }
//     socket.emit("send_chat_message", {
//       msg: chatMessageContent,
//       friend_member_id: event.target.getAttribute("data-friend-member-id"),
//     });
//     event.target.value = "";
//   }
// });

// // Handle opening chat box
// const chatButtons = document.querySelectorAll(".chat_button");
// if (chatButtons) {
//   chatButtons.forEach((chatButton) => {
//     chatButton.addEventListener("click", () => {
//       const specificMemberId = chatButton.parentNode.id;
//       let chatBox = '<div class="chat_section">';
//       chatBox +=
//         '<div id="chat_title_section"><span>Node Connect Chat</span><div class="chat_close"><img src="http://localhost:3000/images/node_connect_close.png"></div></div>';
//       chatBox += <div id="${specificMemberId}" class="all_chat_messages"></div>;
//       chatBox += '<div id="send_message">';
//       chatBox +=
//         '<input id="send_message_input" type="text" data-friend-member-id="' +
//         specificMemberId +
//         '" placeholder="Send Message">';
//       chatBox += "</div>";
//       chatBox += "</div>";
//       const chatSectionWrapper = document.getElementById(
//         "chat_section_wrapper"
//       );
//       if (chatSectionWrapper) {
//         chatSectionWrapper.innerHTML += chatBox;
//       }
//     });
//   });
// }

// // Handle closing chat box
// document.addEventListener("click", (event) => {
//   if (event.target && event.target.classList.contains("chat_close")) {
//     const chatSection = event.target.closest(".chat_section");
//     if (chatSection) {
//       chatSection.remove();
//     }
//   }
// });

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

  // document
  //   .getElementById("accept_friend_request")
  //   .addEventListener("click", function () {
  //     const friendMemberId = this.parentNode.getAttribute("id");
  //     fetch("/accept_friend_request", {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //       body: JSON.stringify({ member_id: friendMemberId }),
  //     })
  //       .then((response) => {
  //         if (response.ok) {
  //           console.log("Friend request accepted");
  //           location.reload();
  //         } else {
  //           console.log("Error accepting friend request");
  //         }
  //       })
  //       .catch((error) => {
  //         console.error("There was an error!", error);
  //       });
  //   });
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
            location.reload(); // Recharger la page après acceptation
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
