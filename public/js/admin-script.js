/**
 * Lorsque le DOM est complètement chargé, configure les écouteurs d'événements
 * pour le chargement de la page de modification de l'utilisateur et la gestion des clics sur les boutons.
 */
document.addEventListener("DOMContentLoaded", function () {
  /**
   * Charge la page de modification d'utilisateur via AJAX et met à jour le contenu principal.
   * Met également à jour l'URL du navigateur sans recharger la page.
   *
   * @param {string} memberId - L'identifiant de l'utilisateur dont la page de modification doit être chargée.
   */
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

  /**
   * Gère les clics sur les boutons "Modifier" pour charger la page de modification correspondante.
   *
   * @param {Event} event - L'événement de clic sur le bouton de modification.
   */
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

  /**
   * Gère les changements d'état dans l'historique du navigateur pour charger le contenu approprié
   * lorsque l'utilisateur utilise le bouton de retour ou d'avant dans le navigateur.
   *
   * @param {PopStateEvent} event - L'événement de changement d'état dans l'historique du navigateur.
   */
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
