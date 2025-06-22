// signin.js
import { auth, provider } from './firebase-config.js';
import {
  signInWithEmailAndPassword,
  signInWithPopup
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

// Handle email/password sign-in
document.querySelector('form').addEventListener('submit', async (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value;
  const pass = document.getElementById("password").value;

  try {
    await signInWithEmailAndPassword(auth, email, pass);
    window.location.href = "profile.html"; // or dashboard, etc.
  } catch (err) {
    alert("Login failed: " + err.message);
  }
});

// Handle Google sign-in
document.querySelector('.google-btn').addEventListener('click', async () => {
  try {
    await signInWithPopup(auth, provider);
    window.location.href = "profile.html"; // or dashboard, etc.
  } catch (err) {
    alert("Google sign-in failed: " + err.message);
  }
});
