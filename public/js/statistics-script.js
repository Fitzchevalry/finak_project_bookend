document.addEventListener("DOMContentLoaded", () => {
  // Fonction pour charger un script
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

  // Fonction pour initialiser les statistiques
  function initializeStats() {
    try {
      const socket = io("https://bookend.koyeb.app");
      // const socket = io();

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

  // Fonction pour vérifier les éléments et initialiser les statistiques
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

  // Fonction principale pour charger les scripts conditionnellement
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
