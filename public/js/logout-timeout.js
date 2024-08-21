(function () {
  // Déclaration des variables
  let idleTime = 0;
  const errorMessage = document.querySelector("#error_message");
  const errorContainer = document.querySelector("#error_container");

  // Fonction pour réinitialiser le compteur d'inactivité
  function resetIdleTime() {
    idleTime = 0;
  }

  // Fonction pour afficher les messages d'erreur
  function displayError(message) {
    errorMessage.textContent = message;
    errorContainer.classList.remove("hidden");
  }

  // Ajout des écouteurs d'événements pour détecter l'activité de l'utilisateur
  document.addEventListener("mousemove", resetIdleTime);
  document.addEventListener("keypress", resetIdleTime);
  document.addEventListener("click", resetIdleTime);

  // Vérification de l'inactivité toutes les minutes
  setInterval(() => {
    idleTime++;
    if (idleTime >= 15) {
      // 15 minutes d'inactivité
      fetch("/logout", { method: "POST" })
        .then(() => {
          window.location.href = "/?error=timeout";
        })
        .catch((err) => {
          console.error("Erreur lors de la déconnexion:", err);
          displayError("Une erreur est survenue lors de la déconnexion.");
        });
    }
  }, 60000); //1 minute
})();
