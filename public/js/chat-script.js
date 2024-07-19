document.addEventListener("DOMContentLoaded", () => {
  const chatButtons = document.querySelectorAll(".chat_button");

  chatButtons.forEach((button) => {
    button.addEventListener("click", function () {
      const friendMemberId = this.getAttribute("data-friend-member-id");
      const firstname = this.getAttribute("data-user-firstname");
      const lastname = this.getAttribute("data-user-lastname");

      // Utiliser les informations récupérées pour personnaliser la boîte de chat
      const chatBox = document.createElement("div");
      chatBox.classList.add("chat_section");

      chatBox.innerHTML = `
        <div id="chat_title_section">
          <span>${firstname} ${lastname}</span>
          <div class="chat_close">
            <img src="images/node_connect_close.png">
          </div>
        </div>
        <div id="${friendMemberId}" class="all_chat_messages"></div>
        <div id="send_message">
          <input id="send_message_input" type="text" placeholder="Envoyer un message">
        </div>
      `;

      const chatSectionWrapper = document.getElementById(
        "chat_section_wrapper"
      );
      chatSectionWrapper.appendChild(chatBox);
    });
  });

  document.addEventListener("click", function (event) {
    const target = event.target;

    if (target.closest(".chat_close img")) {
      const chatSection = target.closest(".chat_section");
      if (chatSection) {
        chatSection.remove();
      }
    }
  });
});
