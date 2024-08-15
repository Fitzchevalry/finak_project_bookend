document.addEventListener("DOMContentLoaded", function () {
  const resetPasswordForm = document.getElementById("reset_password_form");

  if (resetPasswordForm && resetPasswordForm.classList.contains("disabled")) {
    // Le formulaire est désactivé, aucune action supplémentaire nécessaire
    return;
  }

  resetPasswordForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const passwordInput = document.querySelector('input[name="password"]');
    const password = passwordInput.value.trim();

    if (!password) {
      displayError("Veuillez entrer un mot de passe.");
      return;
    }

    // Envoyer le formulaire si la validation passe
    this.submit();
  });

  function displayError(message) {
    const errorElement = document.getElementById("error_message");
    if (errorElement) {
      errorElement.textContent = message;
    } else {
      console.error("Element with ID 'error_message' not found");
    }
  }
});
