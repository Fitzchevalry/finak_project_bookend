document.addEventListener("DOMContentLoaded", function () {
  const showSignUpButton = document.getElementById("show_sign_up");
  const showSignInButton = document.getElementById("show_sign_in");
  const signUpDiv = document.getElementById("sign_up_div");
  const signInDiv = document.getElementById("sign_in_div");

  function showSignUpForm() {
    signUpDiv.style.display = "block";
    signInDiv.style.display = "none";
    showSignUpButton.classList.add("hidden");
    showSignInButton.classList.remove("hidden");
  }

  function showSignInForm() {
    signUpDiv.style.display = "none";
    signInDiv.style.display = "block";
    showSignInButton.classList.add("hidden");
    showSignUpButton.classList.remove("hidden");
  }

  showSignUpButton.addEventListener("click", showSignUpForm);
  showSignInButton.addEventListener("click", showSignInForm);

  showSignInForm();
});
