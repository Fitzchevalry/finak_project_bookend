document.addEventListener("DOMContentLoaded", function () {
  const registerUserButton = document.getElementById("register_user");
  const lastnameInput = document.getElementById("lastname");
  const firstnameInput = document.getElementById("firstname");
  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");

  // Function to handle form submission
  function handleSubmit(event) {
    event.preventDefault(); // Empêche le comportement par défaut du bouton

    // Récupération des données du formulaire
    const formData = {
      lastname: lastnameInput.value,
      firstname: firstnameInput.value,
      email: emailInput.value,
      password: passwordInput.value,
    };

    // Envoi des données via Fetch
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
          alert(data.message); // Affichage de la réponse du serveur
        }
        document.getElementById("sign_up_form").reset();
      })
      .catch((error) => {
        alert(error.message); // Affichage de l'erreur en cas d'échec de la requête
      });
  }

  // Add event listener for button click
  registerUserButton.addEventListener("click", handleSubmit);

  // Add event listeners for 'Enter' key press on each input field
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
