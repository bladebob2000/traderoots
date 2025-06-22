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
    window.location.href = 'sign_up.html'; // redirect to sign-up if not logged in
  }
});

addSkillBtn.addEventListener('click', () => {
  const row = document.createElement('div');
  row.className = 'skill-entry row g-2';

  const col1 = document.createElement('div');
  col1.className = 'col-md-6';
  const skillInput = document.createElement('input');
  skillInput.type = 'text';
  skillInput.className = 'form-control skill-name';
  skillInput.placeholder = 'Skill';
  col1.appendChild(skillInput);

  const col2 = document.createElement('div');
  col2.className = 'col-md-6';
  const descInput = document.createElement('input');
  descInput.type = 'text';
  descInput.className = 'form-control skill-desc';
  descInput.placeholder = 'Description of experience';
  col2.appendChild(descInput);

  row.appendChild(col1);
  row.appendChild(col2);

  skillsSection.appendChild(row);
});

profileForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  if (!currentUserId) return;

  const profileData = {
    firstName: document.getElementById('firstName').value,
    lastName: document.getElementById('lastName').value,
    location: document.getElementById('location').value || null,
    bio: document.getElementById('bio').value || null,
    availability: {},
    skills: []
  };

  // Collect availability
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  days.forEach(day => {
    const check = document.getElementById(`${day}-check`);
    const start = document.getElementById(`${day}-start`);
    const end = document.getElementById(`${day}-end`);
    if (check && check.checked && start && end) {
      profileData.availability[day] = {
        start: start.value,
        end: end.value
      };
    }
  });

  // Collect skills
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
