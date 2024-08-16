/**
 * Lorsque le DOM est complètement chargé, configure les fonctionnalités
 * liées à l'inscription de l'utilisateur.
 */
document.addEventListener("DOMContentLoaded", function () {
  const registerUserButton = document.getElementById("register_user");
  const lastnameInput = document.getElementById("lastname");
  const firstnameInput = document.getElementById("firstname");
  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");
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
   * Valide l'adresse email en utilisant une expression régulière.
   *
   * @param {string} email - L'adresse email à valider.
   * @returns {boolean} - Retourne true si l'email est valide, sinon false.
   */
  function validateEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  }

  /**
   * Vérifie que la longueur du nom est d'au moins 3 caractères.
   *
   * @param {string} name - Le nom à vérifier.
   * @returns {boolean} - Retourne true si le nom est suffisamment long, sinon false.
   */
  function validateNameLength(name) {
    return name.length >= 3;
  }

  /**
   * Valide que le mot de passe a une longueur minimale (au moins 1 caractère).
   *
   * @param {string} password - Le mot de passe à valider.
   * @returns {boolean} - Retourne true si le mot de passe est valide, sinon false.
   */
  function validatePassword(password) {
    return password.length >= 1;
  }

  /**
   * Gère la soumission du formulaire d'inscription. Effectue la validation
   * des champs et envoie les données au serveur si la validation réussit.
   *
   * @param {Event} event - L'événement de clic ou de touche sur le formulaire.
   */
  function handleSubmit(event) {
    event.preventDefault();
    hideError();

    const lastname = lastnameInput.value.trim();
    const firstname = firstnameInput.value.trim();
    const email = emailInput.value.trim();
    const password = passwordInput.value;

    // Validation des champs
    if (!validateNameLength(firstname)) {
      displayError("Le prénom doit contenir au moins 3 caractères.");
      return;
    }

    if (!validateNameLength(lastname)) {
      displayError("Le nom doit contenir au moins 3 caractères.");
      return;
    }

    if (!validateEmail(email)) {
      displayError("Veuillez entrer une adresse email valide.");
      return;
    }

    if (!validatePassword(password)) {
      displayError("Veuillez entrer un mot de passe");
      return;
    }

    //  Envoi des données via Fetch
    const formData = {
      lastname,
      firstname,
      email,
      password,
    };

    fetch("/sign-up", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    })
      .then(async (response) => {
        const data = await response.json();
        if (response.ok) {
          window.location.href = data.redirect;
        } else {
          displayError(data.message);
        }
      })
      .catch((error) => {
        displayError("Erreur lors de l'inscription.");
      });
  }

  // Configure le bouton d'inscription pour appeler handleSubmit lors du clic
  registerUserButton.addEventListener("click", handleSubmit);

  // Configure les champs de saisie pour soumettre le formulaire lors de la touche "Enter"
  [lastnameInput, firstnameInput, emailInput, passwordInput].forEach(
    (input) => {
      input.addEventListener("keydown", function (event) {
        if (event.key === "Enter") {
          handleSubmit(event);
        }
      });
    }
  );
});
