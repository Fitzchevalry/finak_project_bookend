// EN COURS...

// document.addEventListener("DOMContentLoaded", function () {
//   const resetPasswordForm = document.getElementById("reset_password_form");

//   resetPasswordForm.addEventListener("submit", function (event) {
//     event.preventDefault();

//     const emailInput = document.getElementById("email");
//     const email = emailInput.value.trim();

//     if (!validateEmail(email)) {
//       displayError("Veuillez entrer une adresse email valide.");
//       return;
//     }

//     // Envoyer le formulaire si la validation passe
//     this.submit();
//   });

//   function validateEmail(email) {
//     const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//     return regex.test(email);
//   }

//   function displayError(message) {
//     const errorElement = document.getElementById("error_message");
//     if (errorElement) {
//       errorElement.textContent = message;
//     } else {
//       console.error("Element with ID 'error_message' not found");
//     }
//   }
// });
