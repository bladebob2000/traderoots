// profile.js
import { auth, db } from './firebase-config.js';
import { doc, setDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

const profileForm = document.getElementById('profile-form');
const addSkillBtn = document.getElementById('add-skill');
const skillsSection = document.getElementById('skills-section');
const errorMsg = document.getElementById('error-message');
const successMsg = document.getElementById('success-message');

let currentUserId = null;

// Confirm user is logged in
onAuthStateChanged(auth, (user) => {
  if (user) {
    currentUserId = user.uid;
  } else {
    window.location.href = 'index.html'; // redirect to sign-up if not logged in
  }
});

addSkillBtn.addEventListener('click', () => {
  const div = document.createElement('div');
  div.classList.add('skill-entry');
  div.innerHTML = `
    <input type="text" class="skill-name" placeholder="Skill">
    <input type="text" class="skill-desc" placeholder="Description of experience">
  `;
  skillsSection.appendChild(div);
});

profileForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  if (!currentUserId) return;

  const profileData = {
    firstName: document.getElementById('firstName').value,
    lastName: document.getElementById('lastName').value,
    location: document.getElementById('location').value || null,
    bio: document.getElementById('bio').value || null,
    availability: document.getElementById('availability').value || null,
    skills: []
  };

  const skillNames = document.querySelectorAll('.skill-name');
  const skillDescs = document.querySelectorAll('.skill-desc');

  for (let i = 0; i < skillNames.length; i++) {
    const name = skillNames[i].value.trim();
    const desc = skillDescs[i].value.trim();
    if (name) {
      profileData.skills.push({ name, description: desc });
    }
  }

  try {
    await setDoc(doc(db, 'users', currentUserId), profileData);
    successMsg.textContent = "Profile saved successfully!";
    errorMsg.textContent = "";
    setTimeout(() => {
      window.location.href = "profile.html"; // or any profile display page
    }, 1000);
  } catch (err) {
    errorMsg.textContent = err.message;
    successMsg.textContent = "";
  }
});
