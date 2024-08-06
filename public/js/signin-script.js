document.addEventListener("DOMContentLoaded", function () {
  const signInUserButton = document.getElementById("sign_in_user");
  const emailInput = document.getElementById("usr_email");
  const passwordInput = document.getElementById("usr_pwd");
  const errorContainer = document.getElementById("error_container");
  const errorMessage = document.getElementById("error_message");

  function displayError(message) {
    errorMessage.textContent = message;
    errorContainer.classList.remove("hidden");
  }

  function hideError() {
    errorContainer.classList.add("hidden");
  }

  function handleSubmit(event) {
    event.preventDefault();
    hideError();

    const formData = {
      email: emailInput.value,
      password: passwordInput.value,
    };

    fetch("/sign-in", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    })
      .then((response) => {
        if (response.ok) {
          return response.json();
        } else {
          throw new Error("Authentication failed");
        }
      })
      .then((data) => {
        if (data.message === "Login successful") {
          window.location.href = data.redirect;
        } else {
          throw new Error("Authentication failed");
        }
      })
      .catch((error) => {
        console.error("Fetch error:", error);
        displayError("Erreur lors de l'identification, merci de réessayer.");
        document.getElementById("sign_up_form").reset();
      });
  }

  signInUserButton.addEventListener("click", handleSubmit);

  emailInput.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
      handleSubmit(event);
    }
  });

  passwordInput.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
      handleSubmit(event);
    }
  });
});
