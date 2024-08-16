/**
 * Lorsque le DOM est complètement chargé, configure les écouteurs d'événements
 * pour les formulaires de modification et les boutons de suppression d'utilisateur.
 */

document.addEventListener("DOMContentLoaded", function () {
  console.log("DOM fully loaded and parsed");

  /**
   * Gère la soumission du formulaire de modification de l'utilisateur.
   * Empêche le comportement par défaut du formulaire, envoie les données du formulaire
   * via une requête POST, et affiche un message de succès ou d'erreur.
   *
   * @param {Event} event - L'événement de soumission du formulaire.
   * @returns {void}
   */
  function handleEditFormSubmit(event) {
    event.preventDefault();

    const editForm = event.target;
    const memberId = editForm.dataset.memberId;
    const formData = new FormData(editForm);

    fetch(`/administration/edit/${memberId}`, {
      method: "POST",
      body: formData,
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.message) {
          showSuccessMessage(data.message);
        }
        loadPage("/administration");
      })
      .catch((error) => {
        console.error("Error updating user:", error);
        showErrorMessage("Erreur lors de la mise à jour de l'utilisateur.");
      });
  }

  /**
   * Gère la suppression d'un utilisateur en fonction du bouton cliqué.
   * Affiche une confirmation avant d'envoyer une requête DELETE pour supprimer l'utilisateur.
   *
   * @param {Event} event - L'événement de clic sur le bouton de suppression.
   * @returns {void}
   */
  function handleDeleteUser(event) {
    const clickedButton = event.target;

    if (clickedButton.classList.contains("delete-user-btn")) {
      const userId = clickedButton.dataset.userId;

      if (
        confirm("Êtes-vous sûr de vouloir supprimer ce profil utilisateur ?")
      ) {
        fetch(`/administration/users/${userId}`, {
          method: "DELETE",
        })
          .then((response) => response.json())
          .then((data) => {
            if (data.message) {
              showSuccessMessage(data.message);
            }
            loadPage("/administration");
          })
          .catch((error) => {
            console.error(
              "Erreur lors de la suppression du profil utilisateur:",
              error
            );
            showErrorMessage("Erreur lors de la suppression de l'utilisateur.");
          });
      }
    }
  }

  /**
   * Affiche un message de succès à l'utilisateur.
   * Le message disparaît après 3 secondes.
   *
   * @param {string} message - Le message à afficher.
   * @returns {void}
   */
  function showSuccessMessage(message) {
    const messageContainer = document.getElementById("message-container");
    if (messageContainer) {
      messageContainer.innerHTML = `<div class="success-message">${message}</div>`;
      setTimeout(() => {
        messageContainer.innerHTML = "";
      }, 3000);
    }
  }

  /**
   * Affiche un message d'erreur à l'utilisateur.
   * Le message disparaît après 5 secondes.
   *
   * @param {string} message - Le message à afficher.
   * @returns {void}
   */
  function showErrorMessage(message) {
    const messageContainer = document.getElementById("message-container");
    if (messageContainer) {
      messageContainer.innerHTML = `<div class="error-message">${message}</div>`;
      setTimeout(() => {
        messageContainer.innerHTML = "";
      }, 5000);
    }
  }

  /**
   * Charge une nouvelle page via une requête AJAX et met à jour le contenu de la page.
   *
   * @param {string} url - L'URL de la page à charger.
   * @returns {void}
   */
  function loadPage(url) {
    fetch(url)
      .then((response) => response.text())
      .then((html) => {
        const tempDiv = document.createElement("div");
        tempDiv.innerHTML = html;
        const newContent = tempDiv.querySelector("#main-content");
        const mainContent = document.getElementById("main-content");
        if (mainContent) {
          mainContent.innerHTML = newContent ? newContent.innerHTML : "";
        }
      })
      .catch((error) => {
        console.error("Error loading page:", error);
      });
  }

  // Écouteurs d'événements
  document.addEventListener("submit", function (event) {
    if (event.target.id === "edit-user-form") {
      handleEditFormSubmit(event);
    }
  });

  document.addEventListener("click", function (event) {
    handleDeleteUser(event);
  });
});
