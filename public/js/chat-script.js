document.addEventListener("DOMContentLoaded", () => {
  const socket = io();

  const chatButtons = document.querySelectorAll(".chat_button");

  chatButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const receiverId = button.getAttribute("data-friend-member-id");
      const receiverName = `${button.getAttribute(
        "data-user-firstname"
      )} ${button.getAttribute("data-user-lastname")}`;
      const senderId = document.querySelector("#senderId").value;
      const senderProfilePic =
        document.querySelector("#senderProfilePic").value;
      const roomId = [senderId, receiverId].sort().join("_");

      socket.emit("join room", roomId);

      let chatSection = document.querySelector(`#chat_section_${roomId}`);
      if (!chatSection) {
        chatSection = document.createElement("div");
        chatSection.id = `chat_section_${roomId}`;
        chatSection.classList.add("chat_section");
        chatSection.style.display = "none";
        chatSection.innerHTML = `
          <div id="chat_title_section_${roomId}" class="chat_title_section">
            Chat with ${receiverName}
            <img src="/images/node_connect_close.png" class="chat_close" alt="Close Chat" onclick="closeChat('${roomId}')"/>
          </div>
          <div id="chat_messages_${roomId}" class="chat_messages"></div>
          <div class="send_message">
            <input type="text" id="send_message_input_${roomId}" class="send_message_input" placeholder="Écrivez un message" autocomplete="off"/>
            <button type="button" id="send_message_button_${roomId}" class="send_message_button">Envoyer</button>
          </div>
        `;
        document.body.appendChild(chatSection);

        document
          .querySelector(`#send_message_button_${roomId}`)
          .addEventListener("click", () => {
            const messageInput = document.querySelector(
              `#send_message_input_${roomId}`
            );
            const message = messageInput.value;
            if (message.trim()) {
              const data = {
                senderId: senderId,
                receiverId: receiverId,
                roomId: roomId,
                message: message,
                senderName: document.querySelector("#senderName").value,
                senderProfilePic: senderProfilePic,
              };
              console.log("Sending message:", data);
              socket.emit("chat message", data);
              messageInput.value = "";
            }
          });
      }

      chatSection.style.display = "block";
    });
  });

  socket.on("chat message", (data) => {
    console.log("Received chat message:", data);
    const chatMessages = document.querySelector(
      `#chat_messages_${data.roomId}`
    );
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
      console.error(`Element #chat_messages_${data.roomId} not found`);
    }
  });
});

function closeChat(roomId) {
  const chatSection = document.querySelector(`#chat_section_${roomId}`);
  if (chatSection) {
    chatSection.style.display = "none";
  } else {
    console.error(`Chat section with ID #chat_section_${roomId} not found`);
  }
}
