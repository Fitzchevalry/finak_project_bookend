document.addEventListener("DOMContentLoaded", function () {
  const signInUserButton = document.getElementById("sign_in_user");
  const emailInput = document.getElementById("usr_email");
  const passwordInput = document.getElementById("usr_pwd");

  // Function to handle form submission
  function handleSubmit(event) {
    event.preventDefault();

    // Récupération des données du formulaire
    const formData = {
      email: emailInput.value,
      password: passwordInput.value,
    };

    // Envoi des données via Fetch
    fetch("/sign-in", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    })
      .then((response) => {
        if (response.ok) {
          return response.json(); // Convertit la réponse en JSON
        } else {
          throw new Error("Authentication failed"); // Lance une erreur si la réponse n'est pas OK
        }
      })
      .then((data) => {
        // Vérifie si la réponse contient un message de succès
        if (data.message === "Login successful") {
          window.location.href = data.redirect; // Redirige vers la page de destination
        } else {
          throw new Error("Authentication failed"); // Lance une erreur si le message de succès n'est pas présent
        }
      })
      .catch((error) => {
        console.error("Fetch error:", error);
        alert("Authentication failed. Please try again."); // Affiche une alerte en cas d'échec d'authentification
        document.getElementById("sign_up_form").reset(); // Réinitialise le formulaire (si nécessaire)
      });
  }

  // Add event listener for button click
  signInUserButton.addEventListener("click", handleSubmit);

  // Add event listener for 'Enter' key press
  emailInput.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
      handleSubmit(event);
    }
  });

  passwordInput.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
      handleSubmit(event);
    }
  });
});
