/**
 * Lorsque le DOM est complètement chargé, configure les fonctionnalités
 * liées à la gestion des scripts et des statistiques.
 */
document.addEventListener("DOMContentLoaded", () => {
  /**
   * Charge un script JavaScript de manière dynamique.
   *
   * @param {string} url - L'URL du script à charger.
   * @param {Function} [callback] - Fonction optionnelle à appeler une fois le script chargé avec succès.
   */
  function loadScript(url, callback) {
    console.log(`Attempting to load script: ${url}`);
    const script = document.createElement("script");
    script.src = url;
    script.onload = () => {
      console.log(`Script loaded successfully: ${url}`);
      if (callback) callback();
    };
    script.onerror = (e) => {
      console.error(`Failed to load script: ${url}`, e);
    };
    document.body.appendChild(script);
  }

  /**
   * Initialise les statistiques en se connectant au serveur via Socket.IO
   * et met à jour les éléments de la page avec les statistiques reçues.
   */
  function initializeStats() {
    try {
      // const socket = io("https://bookend.koyeb.app");
      const socket = io();

      console.log("Socket.IO initialized.");

      socket.on("updateStatistics", (stats) => {
        const connectionsElem = document.getElementById("connections");
        const sentMessagesElem = document.getElementById("sentMessages");
        const postStatusesElem = document.getElementById("postStatuses");
        const postCommentsElem = document.getElementById("postComments");

        if (connectionsElem) {
          connectionsElem.innerText = `Membres connectés : ${stats.connections}`;
        }
        if (postStatusesElem) {
          postStatusesElem.innerText = `Posts dans le trend : ${stats.statuses}`;
        }
        if (postCommentsElem) {
          postCommentsElem.innerText = `Commentaires : ${stats.comments}`;
        }
        if (sentMessagesElem) {
          sentMessagesElem.innerText = `Messages envoyés : ${stats.messagesSent}`;
        }
      });
    } catch (error) {
      console.error("Error initializing stats:", error);
    }
  }

  /**
   * Vérifie la présence des éléments nécessaires sur la page.
   * Si tous les éléments requis sont présents, initialise les statistiques.
   * Sinon, réessaie après un délai.
   */
  function checkElementsAndInitializeStats() {
    const requiredElements = ["#connections", "#postStatuses", "#postComments"];
    const elementsExist = requiredElements.every((selector) =>
      document.querySelector(selector)
    );

    if (elementsExist) {
      console.log("Required elements are present. Initializing statistics...");
      initializeStats();
    } else {
      console.log("Required elements not found. Retrying...");
      setTimeout(checkElementsAndInitializeStats, 2000);
    }
  }

  /**
   * Charge les scripts nécessaires en fonction du rôle de l'utilisateur.
   * Les scripts sont chargés conditionnellement pour les utilisateurs admin.
   */
  function loadScriptsBasedOnRole() {
    const userRole = window.user_role;

    if (userRole === "admin" || userRole === undefined) {
      console.log("Loading necessary scripts.");
      loadScript("/socket.io/socket.io.js", () => {
        loadScript("/js/admin-script.js", () => {
          checkElementsAndInitializeStats();
        });
      });
    } else {
      console.log("Admin scripts will not be loaded.");
    }
  }

  loadScriptsBasedOnRole();
});
