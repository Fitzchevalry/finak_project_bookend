document.addEventListener("DOMContentLoaded", function () {
  // Fonction pour gérer la soumission du formulaire de modification
  console.log("DOM fully loaded and parsed");
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

  // Fonction pour gérer la suppression des utilisateurs
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

  // Fonction pour afficher un message de succès
  function showSuccessMessage(message) {
    const messageContainer = document.getElementById("message-container");
    if (messageContainer) {
      messageContainer.innerHTML = `<div class="success-message">${message}</div>`;
      setTimeout(() => {
        messageContainer.innerHTML = "";
      }, 3000);
    }
  }

  // Fonction pour afficher un message d'erreur
  function showErrorMessage(message) {
    const messageContainer = document.getElementById("message-container");
    if (messageContainer) {
      messageContainer.innerHTML = `<div class="error-message">${message}</div>`;
      setTimeout(() => {
        messageContainer.innerHTML = "";
      }, 5000);
    }
  }

  // Fonction pour charger une nouvelle page via AJAX
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
