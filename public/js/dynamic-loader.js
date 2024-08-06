document.addEventListener("DOMContentLoaded", () => {
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
            redirectToHome(
              "Erreur lors du chargement de la page. Vous avez été déconnecté."
            );
          }
        } else {
          console.error("Main content element not found in fetched HTML");
          redirectToHome(
            "Erreur lors du chargement de la page. Vous avez été déconnecté."
          );
        }

        loadScripts(tempDiv);

        window.history.pushState({ url: url }, "", url);
      })
      .catch((error) => {
        console.error("Error loading page:", error);
        redirectToHome("Erreur de chargement. Vous avez été déconnecté.");
      });
  }

  function loadScripts(tempDiv) {
    document
      .querySelectorAll("script[data-dynamic]")
      .forEach((script) => script.remove());

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

  function redirectToHome(message) {
    localStorage.setItem("error_message", message);
    window.location.href = `/?error_message=${encodeURIComponent(message)}`;
  }

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

  displayErrorMessage();

  document.querySelectorAll("a[data-page]").forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      const url = link.getAttribute("data-page");
      loadPage(url);
    });
  });

  window.addEventListener("popstate", (event) => {
    if (event.state && event.state.url) {
      loadPage(event.state.url);
    }
  });

  if (window.location.pathname !== "/") {
    loadPage(window.location.pathname);
  }
});
