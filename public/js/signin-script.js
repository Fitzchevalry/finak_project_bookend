/**
 * Lorsque le DOM est complètement chargé, configure les fonctionnalités
 * liées à l'identification de l'utilisateur.
 */
document.addEventListener("DOMContentLoaded", function () {
  const signInUserButton = document.getElementById("sign_in_user");
  const emailInput = document.getElementById("usr_email");
  const passwordInput = document.getElementById("usr_pwd");
  const errorContainer = document.getElementById("error_container");
  const errorMessage = document.getElementById("error_message");

  /**
   * Affiche un message d'erreur dans l'élément prévu à cet effet.
   *
   * @param {string} message - Le message d'erreur à afficher.
   */
  function displayError(message) {
    errorMessage.textContent = message;
    errorContainer.classList.remove("hidden");
  }

  /**
   * Cache l'élément contenant les messages d'erreur.
   */
  function hideError() {
    errorContainer.classList.add("hidden");
  }

  /**
   * Gère la soumission du formulaire d'identification de l'utilisateur.
   *
   * @param {Event} event - L'événement de clic ou de touche sur le formulaire.
   */
  function handleSubmit(event) {
    event.preventDefault();
    hideError();

    const formData = {
      email: emailInput.value,
      password: passwordInput.value,
    };

    fetch("/sign-in", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    })
      .then((response) => {
        if (response.ok) {
          return response.json();
        } else {
          throw new Error("Authentication failed");
        }
      })
      .then((data) => {
        if (data.message === "Login successful") {
          window.location.href = data.redirect;
        } else {
          throw new Error("Authentication failed");
        }
      })
      .catch((error) => {
        console.error("Fetch error:", error);
        displayError("Erreur lors de l'identification, merci de réessayer.");
        document.getElementById("sign_up_form").reset();
      });
  }

  // Configure le bouton d'identification pour appeler handleSubmit lors du clic
  signInUserButton.addEventListener("click", handleSubmit);

  emailInput.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
      handleSubmit(event);
    }
  });

  // Configure les champs de saisie pour soumettre le formulaire lors de la touche "Enter"
  passwordInput.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
      handleSubmit(event);
    }
  });
});
