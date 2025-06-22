// signup.js
import { auth } from './firebase-config.js';
import {
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

const form = document.getElementById('signup-form');
const errorMsg = document.getElementById('error-message');
const googleBtn = document.getElementById('google-signup');

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const confirmPassword = document.getElementById('confirm-password').value;

  if (password !== confirmPassword) {
    errorMsg.textContent = "Passwords do not match.";
    return;
  }

  try {
    await createUserWithEmailAndPassword(auth, email, password);
    window.location.href = 'profile-setup.html';
  } catch (error) {
    errorMsg.textContent = error.message;
  }
});

// Google signup
googleBtn.addEventListener('click', async () => {
  const provider = new GoogleAuthProvider();
  try {
    await signInWithPopup(auth, provider);
    window.location.href = 'profile-setup.html';
  } catch (error) {
    errorMsg.textContent = error.message;
  }
});
