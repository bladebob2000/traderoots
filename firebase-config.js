// firebase-config.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBBID6kUONp-bHIuQC24cvCLHYQ9cWIel0",
  authDomain: "traderoots-9a940.firebaseapp.com",
  projectId: "traderoots-9a940",
  storageBucket: "traderoots-9a940.appspot.com",
  messagingSenderId: "357280583649",
  appId: "1:357280583649:web:2c0c221c60195c5713cca0",
  measurementId: "G-HZY5ZC81L0"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider(); // ✅ required for Google Sign-In

export { auth, db, provider };
