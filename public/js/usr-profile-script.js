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

      const formData = new FormData(editProfileForm); // Utilisez FormData pour gérer le fichier
      fetch("/user_profile/edit", {
        method: "POST",
        body: formData, // Envoyez le formulaire avec le fichier
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
});
