/**
 * Lorsque le DOM est complètement chargé, configure les fonctionnalités
 * pour afficher les formulaires de connexion et d'inscription.
 */
document.addEventListener("DOMContentLoaded", function () {
  const showSignUpButton = document.getElementById("show_sign_up");
  const showSignInButton = document.getElementById("show_sign_in");
  const signUpDiv = document.getElementById("sign_up_div");
  const signInDiv = document.getElementById("sign_in_div");
  const errorContainer = document.getElementById("error_container");

  /**
   * Cache le conteneur d'erreurs en ajoutant la classe "hidden".
   */
  function hideError() {
    errorContainer.classList.add("hidden");
  }

  /**
   * Affiche le formulaire d'inscription et cache le formulaire de connexion.
   * Met à jour la visibilité des boutons d'affichage de chaque formulaire
   * et cache le conteneur d'erreurs.
   */
  function showSignUpForm() {
    signUpDiv.style.display = "block";
    signInDiv.style.display = "none";
    showSignUpButton.classList.add("hidden");
    showSignInButton.classList.remove("hidden");
    hideError();
  }

  /**
   * Affiche le formulaire de connexion et cache le formulaire d'inscription.
   * Met à jour la visibilité des boutons d'affichage de chaque formulaire
   * et cache le conteneur d'erreurs.
   */
  function showSignInForm() {
    signUpDiv.style.display = "none";
    signInDiv.style.display = "block";
    showSignInButton.classList.add("hidden");
    showSignUpButton.classList.remove("hidden");
    hideError();
  }

  // Ajoute des écouteurs d'événements aux boutons pour afficher les formulaires
  showSignUpButton.addEventListener("click", showSignUpForm);
  showSignInButton.addEventListener("click", showSignInForm);

  // Affiche le formulaire de connexion par défaut lors du chargement de la page
  showSignInForm();
});
