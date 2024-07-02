document.addEventListener("DOMContentLoaded", function () {
  const searchInput = document.getElementById("search_term");
  const searchForm = document.getElementById("search_friends_form");

  searchInput.addEventListener("keyup", function () {
    const searchQuery = this.value.trim();

    if (searchQuery === "") {
      document.getElementById("search_results_container").innerHTML = "";
      return;
    }

    fetch(`/search_friends?search_term=${searchQuery}`, {
      headers: {
        "X-Requested-With": "XMLHttpRequest",
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.text();
      })
      .then((data) => {
        document.getElementById("search_results_container").innerHTML = data;
      })
      .catch((error) => {
        console.error("Error searching for friends:", error);
      });
  });

  searchForm.addEventListener("submit", function (event) {
    const searchQuery = searchInput.value.trim();
    if (searchQuery) {
      event.preventDefault();
      window.location.href = `/search_friends?search_term=${searchQuery}`;
    }
  });

  document.addEventListener("click", function (event) {
    if (event.target.classList.contains("request_button")) {
      const clickedButton = event.target;
      const friendMemberId = clickedButton.id.replace("friend_", "");

      // Envoi de la requête AJAX pour vérifier et envoyer une nouvelle demande d'ami
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
          clickedButton.textContent = "Demande envoyée";
          clickedButton.disabled = true;
          console.log("Friend request sent successfully");
        })
        .catch((error) => {
          console.error("Error sending friend request:", error);
          if (error.message === "Friend request already sent") {
            clickedButton.textContent = "Demande déjà envoyée";
            clickedButton.disabled = true;
          } else {
            clickedButton.textContent = "Envoyer une invitation";
            clickedButton.disabled = false;
          }
        });
    }
  });
});
