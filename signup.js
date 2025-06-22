// signup.js
import { auth, provider } from './firebase-config.js';
import { createUserWithEmailAndPassword, signInWithPopup } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

document.getElementById("signup-form").addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value;
  const pass = document.getElementById("password").value;
  const confirm = document.getElementById("confirm").value;
  const errorMsg = document.getElementById("error-message");

  if (pass !== confirm) {
    errorMsg.textContent = "Passwords do not match.";
    return;
  }

  try {
    await createUserWithEmailAndPassword(auth, email, pass);
    window.location.href = "profile-setup.html";
  } catch (err) {
    errorMsg.textContent = err.message;
  }
});

document.getElementById("google-signin").addEventListener("click", async () => {
  try {
    await signInWithPopup(auth, provider);
    window.location.href = "profile-setup.html";
  } catch (err) {
    document.getElementById("error-message").textContent = err.message;
  }
});
