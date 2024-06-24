document.addEventListener("DOMContentLoaded", function () {
  document
    .getElementById("sign_in_user")
    .addEventListener("click", function (event) {
      event.preventDefault();

      // Récupération des données du formulaire
      const formData = {
        email: document.getElementById("usr_email").value,
        password: document.getElementById("usr_pwd").value,
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
    });
});
