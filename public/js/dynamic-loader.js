document.addEventListener("DOMContentLoaded", () => {
  function loadPage(url) {
    fetch(url)
      .then((response) => response.text())
      .then((html) => {
        // Créez un élément temporaire pour analyser le HTML
        const tempDiv = document.createElement("div");
        tempDiv.innerHTML = html;

        // Remplacez le contenu principal
        const newContent = tempDiv.querySelector("#main-content").innerHTML;
        const mainContent = document.getElementById("main-content");

        if (mainContent) {
          mainContent.innerHTML = newContent;
        } else {
          console.error("Main content element not found");
        }

        // Chargez les scripts spécifiques à la page
        loadScripts(tempDiv);

        // Mettre à jour l'URL
        window.history.pushState({ url: url }, "", url);
      })
      .catch((error) => console.error("Error loading page:", error));
  }

  function loadScripts(tempDiv) {
    // Supprime les anciens scripts dynamiques
    document
      .querySelectorAll("script[data-dynamic]")
      .forEach((script) => script.remove());

    // Ajoute les nouveaux scripts
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

  // Gestion des clics sur les liens pour charger différentes pages
  document.querySelectorAll("a[data-page]").forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      const url = link.getAttribute("data-page");
      loadPage(url);
    });
  });

  // Gestion de la navigation avec les boutons Précédent/Suivant
  window.addEventListener("popstate", (event) => {
    if (event.state && event.state.url) {
      loadPage(event.state.url);
    }
  });

  // Charger la page initiale (si nécessaire)
  if (window.location.pathname !== "/") {
    loadPage(window.location.pathname);
  }
});
// document.addEventListener("DOMContentLoaded", () => {
//   // Cache des scripts chargés
//   const scriptCache = new Set();

//   function loadScripts(tempDiv) {
//     // Supprime les anciens scripts dynamiques
//     document.querySelectorAll("script[data-dynamic]").forEach((script) => {
//       console.log(`Removing script: ${script.src}`);
//       script.remove();
//     });

//     // Ajoute les nouveaux scripts
//     const scripts = tempDiv.querySelectorAll("script[src]");
//     scripts.forEach((script) => {
//       if (!scriptCache.has(script.src)) {
//         console.log(`Loading script: ${script.src}`);
//         const newScript = document.createElement("script");
//         newScript.src = script.src;
//         newScript.dataset.dynamic = "true";
//         newScript.onload = () => console.log(`Script loaded: ${script.src}`);
//         newScript.onerror = (e) =>
//           console.error(`Failed to load script: ${script.src}`, e);
//         document.body.appendChild(newScript);
//         scriptCache.add(script.src); // Ajouter au cache
//       } else {
//         console.log(`Script already cached: ${script.src}`);
//       }
//     });
//   }

//   function loadPage(url) {
//     fetch(url)
//       .then((response) => response.text())
//       .then((html) => {
//         // Créez un élément temporaire pour analyser le HTML
//         const tempDiv = document.createElement("div");
//         tempDiv.innerHTML = html;

//         // Remplacez le contenu principal
//         const newContent = tempDiv.querySelector("#main-content").innerHTML;
//         const mainContent = document.getElementById("main-content");

//         if (mainContent) {
//           mainContent.innerHTML = newContent;
//           console.log("Page content replaced");
//         } else {
//           console.error("Main content element not found");
//         }

//         // Chargez les scripts spécifiques à la page
//         loadScripts(tempDiv);

//         // Mettre à jour l'URL
//         window.history.pushState({ url: url }, "", url);

//         // Charger le script de chat seulement pour la page spécifique
//         if (url.endsWith("user-profile.pug")) {
//           loadChatScript();
//         }
//       })
//       .catch((error) => console.error("Error loading page:", error));
//   }

//   function loadChatScript() {
//     const script = document.createElement("script");
//     script.src = "/js/chat-script.js";
//     script.type = "module";
//     script.onload = () => {
//       console.log("Chat script loaded");
//       import("/js/chat-script.js")
//         .then((module) => {
//           if (module.initializeChat) {
//             module.initializeChat();
//           } else {
//             console.error("initializeChat function not found in chat-script");
//           }
//         })
//         .catch((e) => console.error("Failed to load chat module:", e));
//     };
//     script.onerror = (e) => console.error("Failed to load chat script:", e);
//     document.body.appendChild(script);
//   }

//   // Gestion des clics sur les liens pour charger différentes pages
//   document.querySelectorAll("a[data-page]").forEach((link) => {
//     link.addEventListener("click", (event) => {
//       event.preventDefault();
//       const url = link.getAttribute("data-page");
//       loadPage(url);
//     });
//   });

//   // Gestion de la navigation avec les boutons Précédent/Suivant
//   window.addEventListener("popstate", (event) => {
//     if (event.state && event.state.url) {
//       loadPage(event.state.url);
//     }
//   });

//   // Charger la page initiale (si nécessaire)
//   if (window.location.pathname !== "/") {
//     loadPage(window.location.pathname);
//   } else {
//     // Charger le script de chat si la page actuelle est la page de profil utilisateur
//     if (window.location.pathname.endsWith("user-profile.pug")) {
//       loadChatScript();
//     }
//   }
// });

// problème pour lancer le chat au démarrage sans tout faire capoter
