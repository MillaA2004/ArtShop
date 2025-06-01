let isSignUp = false;

function toggleForm() {
  isSignUp = !isSignUp;
  document.getElementById("form-title").innerText = isSignUp ? "Sign Up" : "Sign In";
  document.getElementById("form-subtext").innerText = isSignUp
    ? "Please fill in this form to create an account."
    : "Please enter your credentials to sign in.";
  document.getElementById("submit-button").innerText = isSignUp ? "Sign Up" : "Sign In";
  document.getElementById("toggle-message").innerHTML = isSignUp
    ? `Already have an account? <a onclick="toggleForm()" class="form-toggle">Sign In</a>`
    : `Don’t have an account? <a onclick="toggleForm()" class="form-toggle">Sign Up</a>`;
  document.getElementById("confirm-password-container").style.display = isSignUp ? "block" : "none";
}

// Auto-load based on ?mode=signup in URL
window.onload = () => {
  const params = new URLSearchParams(window.location.search);
  if (params.get("mode") === "signup") toggleForm();
};

