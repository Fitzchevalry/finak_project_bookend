document.addEventListener("DOMContentLoaded", function () {
  // Fonction pour charger la page de modification via AJAX
  function loadEditUserPage(memberId) {
    fetch(`/administration/edit/${memberId}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.text();
      })
      .then((html) => {
        const tempDiv = document.createElement("div");
        tempDiv.innerHTML = html;

        const newContent = tempDiv.querySelector("#main-content");
        const mainContent = document.getElementById("main-content");
        if (mainContent && newContent) {
          mainContent.innerHTML = newContent.innerHTML;

          // Met à jour l'URL sans recharger la page
          window.history.pushState(
            { url: `/administration/edit/${memberId}` },
            "",
            `/administration/edit/${memberId}`
          );
        } else {
          console.error("Main content element not found in fetched HTML");
        }
      })
      .catch((error) => {
        console.error("Error loading page:", error);
      });
  }

  // Fonction pour gérer les clics sur les boutons Modifier
  document.addEventListener("click", function (event) {
    if (event.target.classList.contains("edit-user-btn")) {
      const memberId = event.target.getAttribute("data-member-id");
      if (memberId) {
        loadEditUserPage(memberId);
      } else {
        console.error("No memberId found on the clicked button.");
      }
    }
  });

  // Gérer les changements d'état dans l'historique
  window.addEventListener("popstate", function (event) {
    if (event.state && event.state.url) {
      fetch(event.state.url)
        .then((response) => response.text())
        .then((html) => {
          const tempDiv = document.createElement("div");
          tempDiv.innerHTML = html;

          const newContent = tempDiv.querySelector("#main-content");
          const mainContent = document.getElementById("main-content");
          if (mainContent && newContent) {
            mainContent.innerHTML = newContent.innerHTML;
          } else {
            console.error("Main content element not found in fetched HTML");
          }
        })
        .catch((error) => {
          console.error("Error loading page:", error);
        });
    }
  });
});
