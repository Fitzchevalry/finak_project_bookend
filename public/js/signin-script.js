document.addEventListener("DOMContentLoaded", function () {
  const signInUserButton = document.getElementById("sign_in_user");
  const emailInput = document.getElementById("usr_email");
  const passwordInput = document.getElementById("usr_pwd");

  function handleSubmit(event) {
    event.preventDefault();

    // Récupération des données du formulaire
    const formData = {
      email: emailInput.value,
      password: passwordInput.value,
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
        alert("Authentication failed. Please try again.");
        document.getElementById("sign_up_form").reset();
      });
  }

  // Add event listener for button click
  signInUserButton.addEventListener("click", handleSubmit);

  // Add event listener for 'Enter' key press
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
