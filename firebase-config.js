// firebase-config.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// Optional: Only include if you're actually using analytics
// import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-analytics.js";

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

// Export services for use in other modules
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
export const db = getFirestore(app);

// Optional: Uncomment if you're actually using analytics
// const analytics = getAnalytics(app);
