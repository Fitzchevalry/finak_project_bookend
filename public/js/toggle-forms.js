document.addEventListener("DOMContentLoaded", function () {
  const showSignUpButton = document.getElementById("show_sign_up");
  const showSignInButton = document.getElementById("show_sign_in");
  const signUpDiv = document.getElementById("sign_up_div");
  const signInDiv = document.getElementById("sign_in_div");
  const errorContainer = document.getElementById("error_container");

  function hideError() {
    errorContainer.classList.add("hidden");
  }

  function showSignUpForm() {
    signUpDiv.style.display = "block";
    signInDiv.style.display = "none";
    showSignUpButton.classList.add("hidden");
    showSignInButton.classList.remove("hidden");
    hideError();
  }

  function showSignInForm() {
    signUpDiv.style.display = "none";
    signInDiv.style.display = "block";
    showSignInButton.classList.add("hidden");
    showSignUpButton.classList.remove("hidden");
    hideError();
  }

  showSignUpButton.addEventListener("click", showSignUpForm);
  showSignInButton.addEventListener("click", showSignInForm);

  showSignInForm();
});
