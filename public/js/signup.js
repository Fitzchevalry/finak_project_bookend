document.addEventListener("DOMContentLoaded", function () {
  document
    .getElementById("register_user")
    .addEventListener("click", function (event) {
      event.preventDefault(); // Empêche le comportement par défaut du bouton

      // Récupération des données du formulaire
      const formData = {
        lastname: document.getElementById("lastname").value,
        firstname: document.getElementById("firstname").value,
        email: document.getElementById("email").value,
        password: document.getElementById("password").value,
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
    });
});
