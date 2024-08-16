/**
 * Lorsque le DOM est complètement chargé, configure le chargement des pages via AJAX,
 * la gestion des scripts dynamiques, et les messages d'erreur.
 */
document.addEventListener("DOMContentLoaded", () => {
  /**
   * Charge le contenu d'une page via une requête fetch et met à jour le contenu principal.
   *
   * @param {string} url - L'URL de la page à charger.
   */
  function loadPage(url) {
    fetch(url)
      .then((response) => response.text())
      .then((html) => {
        const tempDiv = document.createElement("div");
        tempDiv.innerHTML = html;

        const newContent = tempDiv.querySelector("#main-content");

        if (newContent) {
          const mainContent = document.getElementById("main-content");
          if (mainContent) {
            mainContent.innerHTML = newContent.innerHTML;
          } else {
            console.error("Main content element not found");
            handleDisconnection(
              "Erreur lors du chargement de la page. Vous avez été déconnecté."
            );
          }
        } else {
          console.error("Main content element not found in fetched HTML");
          handleDisconnection(
            "Erreur lors du chargement de la page. Vous avez été déconnecté."
          );
        }

        loadScripts(tempDiv);

        window.history.pushState({ url: url }, "", url);
      })
      .catch((error) => {
        console.error("Error loading page:", error);
        handleDisconnection("Erreur de chargement. Vous avez été déconnecté.");
      });
  }

  /**
   * Charge les scripts JavaScript présents dans le contenu HTML récupéré.
   *
   * @param {HTMLElement} tempDiv - Conteneur temporaire contenant le HTML récupéré.
   */
  function loadScripts(tempDiv) {
    // Supprime les scripts précédemment ajoutés
    document
      .querySelectorAll("script[data-dynamic]")
      .forEach((script) => script.remove());

    // Ajoute les nouveaux scripts présents dans le contenu HTML récupéré
    const scripts = tempDiv.querySelectorAll("script[src]");
    scripts.forEach((script) => {
      const newScript = document.createElement("script");
      newScript.src = script.src;
      newScript.dataset.dynamic = "true";
      newScript.onerror = (e) =>
        console.error(`Failed to load script: ${script.src}`, e);
      document.body.appendChild(newScript);
    });
  }

  /**
   * Gère la déconnexion de l'utilisateur en envoyant une requête de déconnexion,
   * puis redirige vers la page d'accueil avec un message d'erreur.
   *
   * @param {string} message - Message d'erreur à afficher après la déconnexion.
   */
  function handleDisconnection(message) {
    fetch("/logout", { method: "POST", credentials: "include" })
      .then((response) => response.text())
      .then(() => {
        redirectToHome(message);
      })
      .catch((error) => {
        console.error("Error during logout:", error);
        redirectToHome(message);
      });
  }

  /**
   * Redirige l'utilisateur vers la page d'accueil en incluant un message d'erreur dans l'URL.
   *
   * @param {string} message - Message d'erreur à afficher.
   */
  function redirectToHome(message) {
    localStorage.setItem("error_message", message);
    window.location.href = `/?error_message=${encodeURIComponent(message)}`;
  }

  /**
   * Affiche le message d'erreur stocké dans le localStorage, le cas échéant.
   */
  function displayErrorMessage() {
    const message = localStorage.getItem("error_message");
    if (message) {
      const errorContainer = document.getElementById("error_container");
      const errorMessage = document.getElementById("error_message");
      if (errorContainer && errorMessage) {
        errorMessage.textContent = message;
        errorContainer.classList.remove("hidden");
        localStorage.removeItem("error_message");
      } else {
        console.error("Error container or message element not found");
      }
    }
  }

  // Afficher le message d'erreur s'il existe
  displayErrorMessage();

  // Ajoute des écouteurs d'événements aux liens pour charger les pages via AJAX
  document.querySelectorAll("a[data-page]").forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      const url = link.getAttribute("data-page");
      loadPage(url);
    });
  });

  // Gére les changements d'état dans l'historique pour les actions de navigation
  window.addEventListener("popstate", (event) => {
    if (event.state && event.state.url) {
      loadPage(event.state.url);
    }
  });

  // Charger la page actuelle au démarrage, si ce n'est pas la page d'accueil
  if (window.location.pathname !== "/") {
    loadPage(window.location.pathname);
  }
});
