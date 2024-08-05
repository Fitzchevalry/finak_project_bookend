document.addEventListener("DOMContentLoaded", function () {
  const searchInput = document.getElementById("search_term");
  const searchForm = document.getElementById("search_friends_form");
  const searchResultsContainer = document.getElementById(
    "search_results_container"
  );

  // Gestion de la soumission du formulaire avec AJAX
  searchForm.addEventListener("submit", function (event) {
    event.preventDefault();
    const searchQuery = searchInput.value.trim();

    if (searchQuery) {
      fetch(`/search_friends?search_term=${encodeURIComponent(searchQuery)}`, {
        headers: {
          "X-Requested-With": "XMLHttpRequest",
        },
      })
        .then((response) => response.text())
        .then((html) => {
          // Remplacer le contenu principal de la page sans recharger
          const tempDiv = document.createElement("div");
          tempDiv.innerHTML = html;

          const mainContent = document.getElementById("main-content");
          if (mainContent) {
            mainContent.innerHTML =
              tempDiv.querySelector("#main-content").innerHTML;
          } else {
            console.error("Main content element not found");
          }

          // Charger les scripts spécifiques à la page
          loadScripts(tempDiv);
          searchInput.value = "";
        })
        .catch((error) => {
          console.error("Error searching for friends:", error);
        });
    }
  });

  function loadScripts(tempDiv) {
    // Supprimer les anciens scripts dynamiques
    document
      .querySelectorAll("script[data-dynamic]")
      .forEach((script) => script.remove());

    // Ajouter les nouveaux scripts
    tempDiv.querySelectorAll("script[src]").forEach((script) => {
      const newScript = document.createElement("script");
      newScript.src = script.src;
      newScript.dataset.dynamic = "true";
      newScript.onload = () => console.log(`Script loaded: ${script.src}`);
      newScript.onerror = (e) =>
        console.error(`Failed to load script: ${script.src}`, e);
      document.body.appendChild(newScript);
    });
  }

  // Gestion des clics sur les boutons de demande d'ami et de suppression d'ami
  document.addEventListener("click", function (event) {
    if (event.target.classList.contains("request_button")) {
      const clickedButton = event.target;
      const friendMemberId = clickedButton.id.replace("friend_", "");

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
    } else if (event.target.classList.contains("delete_friend_button")) {
      const clickedButton = event.target;
      const friendMemberId = clickedButton.dataset.friendMemberId;

      fetch(`/delete_friend/${friendMemberId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }
          return response.json();
        })
        .then((data) => {
          console.log("Friend deleted successfully:", data);
          clickedButton.closest(".user_friend_list").remove();
        })
        .catch((error) => {
          console.error("Error deleting friend:", error);
        });
    }
  });
});
