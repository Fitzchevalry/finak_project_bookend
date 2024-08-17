/**
 * Lorsque le DOM est complètement chargé, configure la recherche d'amis,
 * la gestion des demandes d'amis, la suppression d'amis, et les interactions avec les profils des utilisateurs.
 */
document.addEventListener("DOMContentLoaded", function () {
  const searchInput = document.getElementById("search_term");
  const searchForm = document.getElementById("search_friends_form");
  const dataList = document.getElementById("suggestions_list");

  searchInput.addEventListener("input", function () {
    const query = searchInput.value.trim();
    if (query.length > 0) {
      fetch(`/search_suggestions?query=${encodeURIComponent(query)}`, {
        headers: {
          "X-Requested-With": "XMLHttpRequest",
        },
      })
        .then((response) => response.json())
        .then((data) => {
          dataList.innerHTML = "";

          data.suggestions.forEach((suggestion) => {
            const option = document.createElement("option");
            option.value = suggestion;
            dataList.appendChild(option);
          });
        })
        .catch((error) => {
          console.error("Error fetching suggestions:", error);
        });
    } else {
      dataList.innerHTML = "";
    }
  });

  /**
   * Gère la soumission du formulaire de recherche d'amis en utilisant AJAX.
   *
   * @param {Event} event - L'événement de soumission du formulaire.
   */
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
          const tempDiv = document.createElement("div");
          tempDiv.innerHTML = html;

          const mainContent = document.getElementById("main-content");
          if (mainContent) {
            mainContent.innerHTML =
              tempDiv.querySelector("#main-content").innerHTML;
          } else {
            console.error("Main content element not found");
          }

          loadScripts(tempDiv);
          searchInput.value = "";
        })
        .catch((error) => {
          console.error("Error searching for friends:", error);
        });
    }
  });

  /**
   * Charge les scripts JavaScript dynamiques présents dans le contenu HTML récupéré.
   *
   * @param {HTMLElement} tempDiv - Conteneur temporaire contenant le HTML récupéré.
   */
  function loadScripts(tempDiv) {
    document
      .querySelectorAll("script[data-dynamic]")
      .forEach((script) => script.remove());

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

  /**
   * Gère les clics sur les boutons de demande d'ami et de suppression d'ami.
   *
   * @param {Event} event - L'événement de clic.
   */
  document.addEventListener("click", function (event) {
    if (event.target.classList.contains("request_button")) {
      const clickedButton = event.target;
      let friendMemberId;
      if (clickedButton.hasAttribute("data-member-id")) {
        friendMemberId = clickedButton.getAttribute("data-member-id");
      } else {
        friendMemberId = clickedButton.id.replace("friend_", "");
      }

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
    } else if (event.target.closest(".potential_friends")) {
      const clickedElement = event.target.closest(".potential_friends");
      const memberId = clickedElement.getAttribute("data-member-id");

      console.log("Clicked member ID:", memberId);

      try {
        fetch(`/user_profile/${memberId}`)
          .then((response) => {
            if (!response.ok) {
              throw new Error(
                "Network response was not ok: " + response.status
              );
            }
            return response.text();
          })
          .then((html) => {
            const tempDiv = document.createElement("div");
            tempDiv.innerHTML = html;

            const mainContent = document.getElementById("main-content");
            if (mainContent) {
              mainContent.innerHTML = tempDiv.querySelector(
                "#user_profile_visit_div"
              ).innerHTML;
            } else {
              console.error("Main content element not found");
            }

            loadScripts(tempDiv);

            window.history.pushState(
              { url: `/user_profile/${memberId}` },
              "",
              `/user_profile/${memberId}`
            );
          })
          .catch((error) => {
            console.error("Error loading profile:", error);
          });
      } catch (error) {
        console.error("Error handling profile click:", error);
      }
    }
  });
});
