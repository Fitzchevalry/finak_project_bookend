document.addEventListener("DOMContentLoaded", function () {
  const registerUserButton = document.getElementById("register_user");
  const lastnameInput = document.getElementById("lastname");
  const firstnameInput = document.getElementById("firstname");
  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");

  // Fonction pour valider l'email
  function validateEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  }

  // Fonction pour vérifier la longueur minimale des champs nom et prénom
  function validateNameLength(name) {
    return name.length >= 3;
  }

  // Fonction pour valider le mot de passe
  function validatePassword(password) {
    return password.length >= 1;
  }

  // Fonction pour gérer la soumission du formulaire
  function handleSubmit(event) {
    event.preventDefault();

    const lastname = lastnameInput.value.trim();
    const firstname = firstnameInput.value.trim();
    const email = emailInput.value.trim();
    const password = passwordInput.value;

    // Validation des champs
    if (!validateNameLength(lastname)) {
      displayError("Le nom doit contenir au moins 3 caractères.");
      return;
    }

    if (!validateNameLength(firstname)) {
      displayError("Le prénom doit contenir au moins 3 caractères.");
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

  // Fonction pour afficher les messages d'erreur dans la page
  function displayError(message) {
    const errorElement = document.getElementById("error_message");
    if (errorElement) {
      errorElement.textContent = message;
    } else {
      console.error("Element with ID 'error_message' not found");
      alert(message);
    }
  }

  // Ajout d'un écouteur d'événement sur le bouton d'inscription
  registerUserButton.addEventListener("click", handleSubmit);

  // Ajout d'un écouteur d'événement pour la touche 'Enter' sur chaque champ
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
