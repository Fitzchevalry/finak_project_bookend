// EN COURS...

document.addEventListener("DOMContentLoaded", function () {
  const editForm = document.getElementById("edit_user_form");

  if (editForm) {
    editForm.addEventListener("submit", function (event) {
      event.preventDefault();

      const memberId = editForm.dataset.memberId;
      const formData = new FormData(editForm);

      fetch(`/administration/edit/${memberId}`, {
        method: "POST",
        body: formData,
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }
          window.location.href = "/administration";
        })
        .catch((error) => {
          console.error("Error updating user:", error);
        });
    });
  }

  const deleteUserButtons = document.querySelectorAll(".delete-user-btn");

  if (deleteUserButtons) {
    deleteUserButtons.forEach((button) => {
      button.addEventListener("click", function (event) {
        const userId = this.dataset.userId;
        console.log("userID", this.dataset.userId);

        if (
          confirm("Êtes-vous sûr de vouloir supprimer ce profil utilisateur ?")
        ) {
          console.log(`URL DELETE: /administration/users/${userId}`);
          fetch(`/administration/users/${userId}`, {
            method: "DELETE",
          })
            .then((response) => {
              if (!response.ok) {
                throw new Error(`Erreur HTTP! Statut: ${response.status}`);
              }
              window.location.reload();
            })
            .catch((error) => {
              console.error(
                "Erreur lors de la suppression du profil utilisateur:",
                error
              );
            });
        }
      });
    });
  }
});
