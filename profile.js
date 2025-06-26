// profile.js
import { auth, db } from './firebase-config.js';
import {
  doc,
  getDoc,
  updateDoc
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import {
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const userNameEl = document.getElementById("user-name");
const userLocationEl = document.getElementById("user-location");
const userBioEl = document.getElementById("user-bio");
const userAvailabilityEl = document.getElementById("user-availability");
const skillsList = document.getElementById("skills-list");
const requestedSkillsList = document.getElementById("requested-skills-list");
const availabilityFields = document.getElementById("availability-fields");
const skillsContainer = document.getElementById("skills-container");
const addSkillBtn = document.getElementById("add-skill-btn");
const requestedSkillsContainer = document.getElementById("requested-skills-container");
const addRequestedSkillBtn = document.getElementById("add-requested-skill-btn");
const editForm = document.getElementById("edit-profile-form");
const editFirst = document.getElementById("edit-first");
const editLast = document.getElementById("edit-last");
const editLocation = document.getElementById("edit-location");
const editBio = document.getElementById("edit-bio");

const skillModal = new bootstrap.Modal(document.getElementById("skillModal"));
const skillModalLabel = document.getElementById("skillModalLabel");
const skillModalBody = document.getElementById("skillModalBody");

const availabilityInputs = {};

let currentUserId = null;

// Dynamically generate availability input rows
function buildAvailabilityUI() {
  DAYS.forEach(day => {
    const row = document.createElement("div");
    row.className = "col-12 d-flex align-items-center mb-1";
    row.innerHTML = `
      <input type="checkbox" id="${day}-check" class="form-check-input me-2" />
      <label class="form-label me-2" style="width: 80px;">${day}</label>
      <input type="time" id="${day}-start" class="form-control me-2" style="width: 140px;" disabled />
      <span class="me-2">to</span>
      <input type="time" id="${day}-end" class="form-control" style="width: 140px;" disabled />
    `;
    availabilityFields.appendChild(row);
  });
}

// Event listeners for enabling/disabling time inputs
function setupAvailabilityEvents() {
  DAYS.forEach(day => {
    const check = document.getElementById(`${day}-check`);
    const start = document.getElementById(`${day}-start`);
    const end = document.getElementById(`${day}-end`);
    availabilityInputs[day] = { check, start, end };

    check.addEventListener("change", () => {
      const enabled = check.checked;
      start.disabled = !enabled;
      end.disabled = !enabled;
    });
  });
}

// Create skill input row
function createSkillInput(skill = { name: "", description: "" }) {
  const row = document.createElement("div");
  row.className = "row g-2 align-items-center mb-2";
  row.innerHTML = `
    <div class="col-md-5">
      <input type="text" class="form-control" placeholder="Skill name" value="${skill.name || ''}" />
    </div>
    <div class="col-md-6">
      <input type="text" class="form-control" placeholder="Description" value="${skill.description || ''}" />
    </div>
    <div class="col-md-1 text-end">
      <button type="button" class="btn btn-sm btn-outline-danger"><i class="bi bi-x-circle"></i></button>
    </div>
  `;
  row.querySelector("button").onclick = () => row.remove();
  skillsContainer.appendChild(row);
}

// Create requested skill input row
function createRequestedSkillInput(skill = { name: "", description: "" }) {
  const row = document.createElement("div");
  row.className = "row g-2 align-items-center mb-2";
  row.innerHTML = `
    <div class="col-md-5">
      <input type="text" class="form-control" placeholder="Requested skill name" value="${skill.name || ''}" />
    </div>
    <div class="col-md-6">
      <input type="text" class="form-control" placeholder="Description" value="${skill.description || ''}" />
    </div>
    <div class="col-md-1 text-end">
      <button type="button" class="btn btn-sm btn-outline-danger"><i class="bi bi-x-circle"></i></button>
    </div>
  `;
  row.querySelector("button").onclick = () => row.remove();
  requestedSkillsContainer.appendChild(row);
}

// Format 24hr to AM/PM
function formatTime(t) {
  if (!t) return "--";
  const [h, m] = t.split(":").map(Number);
  const suffix = h >= 12 ? "PM" : "AM";
  const hour = h % 12 || 12;
  return `${hour}:${m.toString().padStart(2, "0")}${suffix}`;
}

onAuthStateChanged(auth, async (user) => {
  if (!user) return window.location.href = "sign_in.html";

  currentUserId = user.uid;
  const docRef = doc(db, "users", currentUserId);
  const userDoc = await getDoc(docRef);
  if (!userDoc.exists()) return;

  const data = userDoc.data();
  userNameEl.textContent = `${data.firstName} ${data.lastName}`;
  userLocationEl.textContent = data.location?.city || data.location || '—';
  userBioEl.textContent = data.bio || '—';

  const readable = DAYS.map(day => {
    if (data.availability?.[day]) {
      const { start, end } = data.availability[day];
      return `${day}: ${formatTime(start)} - ${formatTime(end)}`;
    } else {
      return `${day}: Unable`;
    }
  });
  userAvailabilityEl.innerHTML = readable.join("<br>");

  editFirst.value = data.firstName || '';
  editLast.value = data.lastName || '';
  editLocation.value = data.location?.city || data.location || '';
  editBio.value = data.bio || '';

  skillsContainer.innerHTML = '';
  (data.skills || []).forEach(skill => createSkillInput(skill));

  requestedSkillsContainer.innerHTML = '';
  (data.requestedSkills || []).forEach(skill => createRequestedSkillInput(skill));

  skillsList.innerHTML = '';
  (data.skills || []).forEach(skill => {
    const btn = document.createElement("button");
    btn.className = "btn btn-outline-success skill-btn";
    btn.textContent = skill.name;
    btn.onclick = () => {
      skillModalLabel.textContent = skill.name;
      skillModalBody.textContent = skill.description || "No description provided.";
      skillModal.show();
    };
    skillsList.appendChild(btn);
  });

  requestedSkillsList.innerHTML = '';
  (data.requestedSkills || []).forEach(skill => {
    const btn = document.createElement("button");
    btn.className = "btn btn-outline-danger skill-btn";
    btn.textContent = skill.name;
    btn.onclick = () => {
      skillModalLabel.textContent = skill.name;
      skillModalBody.textContent = skill.description || "No description provided.";
      skillModal.show();
    };
    requestedSkillsList.appendChild(btn);
  });
});

editForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const skills = Array.from(skillsContainer.querySelectorAll(".row")).map(row => {
    const inputs = row.querySelectorAll("input");
    return {
      name: inputs[0].value.trim(),
      description: inputs[1].value.trim()
    };
  }).filter(skill => skill.name);

  const requestedSkills = Array.from(requestedSkillsContainer.querySelectorAll(".row")).map(row => {
    const inputs = row.querySelectorAll("input");
    return {
      name: inputs[0].value.trim(),
      description: inputs[1].value.trim()
    };
  }).filter(skill => skill.name);

  const availability = {};
  for (const [day, { check, start, end }] of Object.entries(availabilityInputs)) {
    if (check.checked && start.value && end.value) {
      availability[day] = { start: start.value, end: end.value };
    }
  }

  const updateData = {
    firstName: editFirst.value.trim(),
    lastName: editLast.value.trim(),
    location: editLocation.value.trim(),
    bio: editBio.value.trim(),
    availability,
    skills,
    requestedSkills
  };

  try {
    await updateDoc(doc(db, "users", currentUserId), updateData);
    location.reload();
  } catch (err) {
    alert("Error updating profile: " + err.message);
  }
});

// Navbar and footer
fetch('navbar.html')
  .then(res => res.text())
  .then(html => document.getElementById('navbar').innerHTML = html);

fetch("footer.html")
  .then(res => res.text())
  .then(html => {
    document.getElementById("footer").innerHTML = html;
    initAutocomplete();
  });

// Google Autocomplete setup
window.initAutocomplete = () => {
  const input = document.getElementById("edit-location");
  if (!input || typeof google === 'undefined' || !google.maps?.places) {
    console.warn("Google Places API not ready or #edit-location not found");
    return;
  }

  const autocomplete = new google.maps.places.Autocomplete(input, {
    types: ['(cities)'],
    fields: ['address_components', 'formatted_address', 'geometry']
  });

  autocomplete.addListener("place_changed", () => {
    const place = autocomplete.getPlace();
    if (place?.formatted_address) {
      const cityComponent = place.address_components?.find(c => c.types.includes("locality"));
      const city = cityComponent?.long_name || place.formatted_address;
      input.value = city;
      window.locationPlaceSelected = true;

    }
  });

  input.addEventListener("input", () => {
    window.locationPlaceSelected = false;
  });
};


document.addEventListener("DOMContentLoaded", () => {
  buildAvailabilityUI();
  setupAvailabilityEvents();

  // Attach button handlers
  addSkillBtn.addEventListener("click", () => createSkillInput());
  addRequestedSkillBtn.addEventListener("click", () => createRequestedSkillInput());
});

// Initialize Google Places *after* modal becomes visible
const editModal = document.getElementById("editProfileModal");
if (editModal) {
  editModal.addEventListener("shown.bs.modal", () => {
    setTimeout(() => initAutocomplete(), 100); // slight delay ensures input is fully visible
  });
}
