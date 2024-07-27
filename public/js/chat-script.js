document.addEventListener("DOMContentLoaded", () => {
  const socket = io();
  const currentUserId = document.querySelector("#senderId").value;
  const chatButtons = document.querySelectorAll(".chat_button");

  function loadNotifications() {
    socket.emit("get notifications", currentUserId);
  }

  function markNotificationsAsRead(notificationIds) {
    socket.emit("mark notifications as read", notificationIds);
  }

  socket.on("notifications", (notifications) => {
    notifications.forEach((notification) => {
      const chatButton = document.querySelector(
        `.chat_button[data-friend-member-id="${notification.senderId}"]`
      );
      if (chatButton && !notification.read) {
        chatButton.classList.add("new-message");
        chatButton.setAttribute("data-notification-id", notification._id);
      }
    });
  });

  chatButtons.forEach((button) => {
    button.addEventListener("click", async () => {
      const receiverId = button.getAttribute("data-friend-member-id");
      const receiverName = `${button.getAttribute(
        "data-user-firstname"
      )} ${button.getAttribute("data-user-lastname")}`;
      const senderId = document.querySelector("#senderId").value;
      const senderProfilePic =
        document.querySelector("#senderProfilePic").value;
      const roomId = [senderId, receiverId].sort().join("_");

      socket.emit("join room", roomId);

      // Marquer les notifications comme lues
      const notificationsToMarkAsRead = Array.from(
        document.querySelectorAll(
          `.chat_button[data-friend-member-id="${receiverId}"]`
        )
      ).map((btn) => btn.getAttribute("data-notification-id"));

      if (notificationsToMarkAsRead.length > 0) {
        markNotificationsAsRead(notificationsToMarkAsRead);
        button.classList.remove("new-message");
        notificationsToMarkAsRead.forEach((id) =>
          button.removeAttribute("data-notification-id")
        );
      }

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
        document
          .querySelector("#chat_section_wrapper")
          .appendChild(chatSection);
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

      const response = await fetch(`/messages/${roomId}`);
      const messages = await response.json();
      const chatMessages = document.querySelector(`#chat_messages_${roomId}`);
      chatMessages.innerHTML = messages
        .map(
          (msg) => `
        <div class="message">
          <img src="${msg.senderProfilePic}" class="profile_pic" alt="Profile Pic"/>
          <div class="message_content">
            <strong>${msg.senderName}:</strong>
            <p>${msg.message}</p>
          </div>
        </div>
      `
        )
        .join("");
      chatMessages.scrollTop = chatMessages.scrollHeight;

      chatSection.style.display = "flex";
    });
  });

  socket.on("chat message", (data) => {
    console.log("Received chat message:", data);
    if (data.receiverId === currentUserId) {
      notifyNewMessage(data);
    }

    const chatMessages = document.querySelector(
      `#chat_messages_${data.roomId}`
    );
    if (chatMessages) {
      const messageElement = document.createElement("div");
      messageElement.className = "message";
      messageElement.innerHTML = `
        <img src="${data.senderProfilePic}" class="profile_pic" alt="Profile Pic"/>
        <div class="message_content">
        <strong>${data.senderName}:</strong>
        <p>${data.message}</p></div>
      `;
      chatMessages.appendChild(messageElement);
      chatMessages.scrollTop = chatMessages.scrollHeight;
    } else {
      console.error(`Element #chat_messages_${data.roomId} not found`);
    }
  });

  function notifyNewMessage(data) {
    const chatButton = document.querySelector(
      `.chat_button[data-friend-member-id="${data.senderId}"]`
    );

    console.log("Élément chatButton trouvé:", chatButton);
    console.log("Classes actuelles de chatButton:", chatButton?.className);

    if (chatButton) {
      chatButton.classList.add("new-message");
      chatButton.setAttribute("data-notification-id", data.notificationId);
      console.log("Classes après ajout:", chatButton.className);
    } else {
      console.error(
        `Bouton de chat pour l'utilisateur ${data.senderId} non trouvé`
      );
    }
  }

  loadNotifications();
});

function closeChat(roomId) {
  const chatSection = document.querySelector(`#chat_section_${roomId}`);
  if (chatSection) {
    chatSection.remove();
  } else {
    console.error(`Chat section with ID #chat_section_${roomId} not found`);
  }
}
