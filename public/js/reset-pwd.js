/**
 * Lorsque le DOM est complètement chargé, configure les fonctionnalités
 * liées à la réinitialisation du mot de passe.
 */
document.addEventListener("DOMContentLoaded", function () {
  const resetPasswordForm = document.getElementById("reset_password_form");

  if (resetPasswordForm && resetPasswordForm.classList.contains("disabled")) {
    // Le formulaire est désactivé, aucune action supplémentaire nécessaire
    return;
  }

  /**
   * Gère la soumission du formulaire de réinitialisation du mot de passe.
   *
   * @param {Event} event - L'événement de soumission du formulaire.
   */
  resetPasswordForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const passwordInput = document.querySelector('input[name="password"]');
    const password = passwordInput.value.trim();

    if (!password) {
      displayError("Veuillez entrer un mot de passe.");
      return;
    }

    // Envoie le formulaire si la validation passe
    this.submit();
  });

  /**
   * Affiche un message d'erreur dans l'élément prévu à cet effet.
   *
   * @param {string} message - Le message d'erreur à afficher.
   */
  function displayError(message) {
    const errorElement = document.getElementById("error_message");
    if (errorElement) {
      errorElement.textContent = message;
    } else {
      console.error("Element with ID 'error_message' not found");
    }
  }
});
