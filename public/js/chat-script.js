// document.addEventListener("DOMContentLoaded", () => {
//   const chatButtons = document.querySelectorAll(".chat_button");

//   chatButtons.forEach((button) => {
//     button.addEventListener("click", function () {
//       const friendMemberId = this.getAttribute("data-friend-member-id");
//       const firstname = this.getAttribute("data-user-firstname");
//       const lastname = this.getAttribute("data-user-lastname");

//       // Vérifier si la boîte de chat pour cet ami existe déjà
//       let chatBox = document.querySelector(
//         `#chat_section_wrapper .chat_section[data-friend-id="${friendMemberId}"]`
//       );
//       if (!chatBox) {
//         // Créer une nouvelle boîte de chat
//         chatBox = document.createElement("div");
//         chatBox.classList.add("chat_section");
//         chatBox.setAttribute("data-friend-id", friendMemberId);

//         chatBox.innerHTML = `
//           <div id="chat_title_section">
//             <span>${firstname} ${lastname}</span>
//             <div class="chat_close">
//               <img src="images/node_connect_close.png">
//             </div>
//           </div>
//           <div id="chat_messages_${friendMemberId}" class="all_chat_messages"></div>
//           <div id="send_message_${friendMemberId}" class="send_message">
//             <input id="send_message_input_${friendMemberId}" class="send_message_input" type="text" placeholder="Envoyer un message">
//           </div>
//         `;

//         const chatSectionWrapper = document.getElementById(
//           "chat_section_wrapper"
//         );
//         chatSectionWrapper.appendChild(chatBox);
//       }
//     });
//   });

//   document.addEventListener("click", function (event) {
//     const target = event.target;

//     if (target.closest(".chat_close img")) {
//       const chatSection = target.closest(".chat_section");
//       if (chatSection) {
//         chatSection.remove();
//       }
//     }
//   });

//   const socket = io();

//   // Envoie des messages
//   document.addEventListener("keypress", (event) => {
//     if (event.key === "Enter") {
//       const inputElement = event.target;
//       if (inputElement.classList.contains("send_message_input")) {
//         const message = inputElement.value.trim();
//         if (message) {
//           const chatBox = inputElement.closest(".chat_section");
//           const friendId = chatBox.getAttribute("data-friend-id");

//           socket.emit("sendMessage", { message, friendId });
//           inputElement.value = "";
//         }
//       }
//     }
//   });

//   // Réception des messages du serveur
//   socket.on("connect", () => {
//     console.log("Connected to server via Socket.IO");
//   });

//   socket.on("receiveMessage", ({ message, friendId }) => {
//     const messagesContainer = document.getElementById(
//       `chat_messages_${friendId}`
//     );
//     if (messagesContainer) {
//       const messageElement = document.createElement("p");
//       messageElement.textContent = message;
//       messagesContainer.appendChild(messageElement);
//     }
//   });
// });
// public/js/chat-script.js

document.addEventListener("DOMContentLoaded", () => {
  const socket = io();

  const chatButtons = document.querySelectorAll(".chat_button");
  const chatSection = document.querySelector(".chat_section");
  const chatMessages = document.querySelector("#chat_messages");
  const sendMessageInput = document.querySelector("#send_message_input");
  const sendMessageButton = document.querySelector("#send_message_button");
  const receiverIdInput = document.querySelector("#receiverId");
  const senderIdInput = document.querySelector("#senderId");
  const senderNameInput = document.querySelector("#senderName");
  const senderProfilePic = document.querySelector("#senderProfilePic");

  chatButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const receiverId = button.getAttribute("data-friend-member-id");
      const receiverName = `${button.getAttribute(
        "data-user-firstname"
      )} ${button.getAttribute("data-user-lastname")}`;

      // Create a unique room ID based on sender and receiver IDs
      const roomId = [senderIdInput.value, receiverId].sort().join("_");

      receiverIdInput.value = receiverId;
      socket.emit("join room", roomId);

      chatSection.style.display = "block";
      document.querySelector(
        "#chat_title_section"
      ).textContent = `Chat with ${receiverName}`;
    });
  });

  sendMessageButton.addEventListener("click", () => {
    const message = sendMessageInput.value;
    if (message.trim()) {
      const roomId = [senderIdInput.value, receiverIdInput.value]
        .sort()
        .join("_");
      const data = {
        senderId: senderIdInput.value,
        receiverId: receiverIdInput.value,
        roomId: roomId,
        message: message,
        senderName: senderNameInput.value,
        senderProfilePic: senderProfilePic.src, // Default profile pic
      };
      console.log("Sending message:", data); // Debug log
      socket.emit("chat message", data);
      sendMessageInput.value = "";
    }
  });

  socket.on("chat message", (data) => {
    console.log("Received chat message:", data); // Debug log
    const chatMessages = document.querySelector("#chat_messages"); // Re-sélectionner pour s'assurer que l'élément existe
    if (chatMessages) {
      const messageElement = document.createElement("div");
      messageElement.className = "message";
      messageElement.innerHTML = `
        <img src="${data.senderProfilePic}" class="profile_pic" alt="Profile Pic"/>
        <strong>${data.senderName}:</strong>
        <p>${data.message}</p>
      `;
      chatMessages.appendChild(messageElement);
      chatMessages.scrollTop = chatMessages.scrollHeight;
    } else {
      console.error("Element #chat_messages not found");
    }
  });
});

function closeChat() {
  document.querySelector(".chat_section").style.display = "none";
}
