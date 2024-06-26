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
        return response.json().then((data) => {
          if (response.ok) {
            window.location.href = data.redirect;
          } else {
            alert(data.message); // Affichage de la réponse du serveur
          }
          document.getElementById("sign_up_form").reset();
        });
      })
      .catch((error) => {
        alert(error.message); // Affichage de l'erreur en cas d'échec de la requête
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
