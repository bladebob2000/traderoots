import { auth, db } from './firebase-config.js';
import { doc, setDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

const profileForm = document.getElementById('profile-form');
const addSkillBtn = document.getElementById('add-skill');
const skillsSection = document.getElementById('skills-section');
const errorMsg = document.getElementById('error-message');
const successMsg = document.getElementById('success-message');

let currentUserId = null;

onAuthStateChanged(auth, (user) => {
  if (user) {
    currentUserId = user.uid;
  } else {
    window.location.href = 'sign_up.html';
  }
});

addSkillBtn.addEventListener('click', () => {
  const row = document.createElement('div');
  row.className = 'skill-entry row g-2';

  row.innerHTML = `
    <div class="col-md-6">
      <input type="text" class="form-control skill-name" placeholder="Skill" />
    </div>
    <div class="col-md-6">
      <input type="text" class="form-control skill-desc" placeholder="Description of experience" />
    </div>
  `;

  skillsSection.appendChild(row);
});

profileForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  if (!currentUserId) return;

  const locationInput = document.getElementById('location').value.trim();

  // Enforce autocomplete selection if location entered
  if (locationInput && !window.locationPlaceSelected) {
    errorMsg.textContent = "Please select a location from the suggestions.";
    successMsg.textContent = "";
    return;
  }

  const profileData = {
    firstName: document.getElementById('firstName').value.trim(),
    lastName: document.getElementById('lastName').value.trim(),
    location: locationInput || null,
    bio: document.getElementById('bio').value.trim() || null,
    availability: {},
    skills: []
  };

  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  days.forEach(day => {
    const check = document.getElementById(`${day}-check`);
    const start = document.getElementById(`${day}-start`);
    const end = document.getElementById(`${day}-end`);
    if (check?.checked && start?.value && end?.value) {
      profileData.availability[day] = { start: start.value, end: end.value };
    }
  });

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
      window.location.href = "profile.html";
    }, 1000);
  } catch (err) {
    errorMsg.textContent = err.message;
    successMsg.textContent = "";
  }
});
