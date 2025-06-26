import { auth, db } from './firebase-config.js';
import {
  doc, getDoc, updateDoc
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import {
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

const skillOptions = [/* full list from earlier */];

const datalist = document.createElement("datalist");
datalist.id = "skills-datalist";
skillOptions.forEach(skill => {
  const opt = document.createElement("option");
  opt.value = skill;
  datalist.appendChild(opt);
});
document.body.appendChild(datalist);

// DOM elements
const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const userNameEl = document.getElementById("user-name");
const userLocationEl = document.getElementById("user-location");
const userBioEl = document.getElementById("user-bio");
const userAvailabilityEl = document.getElementById("user-availability");
const skillsList = document.getElementById("skills-list");
const requestedSkillsList = document.getElementById("requested-skills-list");
const availabilityFields = document.getElementById("availability-fields");
const skillsContainer = document.getElementById("skills-container");
const requestedSkillsContainer = document.getElementById("requested-skills-container");
const addSkillBtn = document.getElementById("add-skill-btn");
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

// Build availability inputs
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

// Wire up enabling/disabling of time inputs
function setupAvailabilityEvents() {
  DAYS.forEach(day => {
    const check = document.getElementById(`${day}-check`);
    const start = document.getElementById(`${day}-start`);
    const end = document.getElementById(`${day}-end`);
    availabilityInputs[day] = { check, start, end };
    check.addEventListener("change", () => {
      start.disabled = end.disabled = !check.checked;
    });
  });
}

// Create a skill input row
function createSkillInput(skill = { name: "", description: "" }) {
  const row = document.createElement("div");
  row.className = "row g-2 align-items-center mb-2 position-relative";
  row.innerHTML = `
    <div class="col-md-5 position-relative">
      <input type="text" class="form-control skill-input" placeholder="Skill name" value="${skill.name}" autocomplete="off" />
      <div class="autocomplete-list"></div>
    </div>
    <div class="col-md-6">
      <input type="text" class="form-control" placeholder="Description" value="${skill.description}" />
    </div>
    <div class="col-md-1 text-end">
      <button type="button" class="btn btn-sm btn-outline-danger"><i class="bi bi-x-circle"></i></button>
    </div>
  `;
  row.querySelector("button").onclick = () => row.remove();
  skillsContainer.appendChild(row);
  setupSkillAutocomplete(row);
}

// Create a requested skill input row
function createRequestedSkillInput(skill = { name: "", description: "" }) {
  const row = document.createElement("div");
  row.className = "row g-2 align-items-center mb-2 position-relative";
  row.innerHTML = `
    <div class="col-md-5 position-relative">
      <input type="text" class="form-control skill-input" placeholder="Requested skill name" value="${skill.name}" autocomplete="off" />
      <div class="autocomplete-list"></div>
    </div>
    <div class="col-md-6">
      <input type="text" class="form-control" placeholder="Description" value="${skill.description}" />
    </div>
    <div class="col-md-1 text-end">
      <button type="button" class="btn btn-sm btn-outline-danger"><i class="bi bi-x-circle"></i></button>
    </div>
  `;
  row.querySelector("button").onclick = () => row.remove();
  requestedSkillsContainer.appendChild(row);
  setupSkillAutocomplete(row);
}

function formatTime(t) {
  if (!t) return "--";
  const [h, m] = t.split(":").map(Number);
  const suffix = h >= 12 ? "PM" : "AM";
  const hour = h % 12 || 12;
  return `${hour}:${m.toString().padStart(2, "0")}${suffix}`;
}

// Load user profile
onAuthStateChanged(auth, async (user) => {
  if (!user) return window.location.href = "sign_in.html";

  currentUserId = user.uid;
  const userRef = doc(db, "users", user.uid);
  const userSnap = await getDoc(userRef);
  if (!userSnap.exists()) return;

  const data = userSnap.data();
  userNameEl.textContent = `${data.firstName} ${data.lastName}`;
  userLocationEl.textContent = data.location?.city || data.location || "—";
  userBioEl.textContent = data.bio || "—";

  const readable = DAYS.map(day =>
    data.availability?.[day]
      ? `${day}: ${formatTime(data.availability[day].start)} - ${formatTime(data.availability[day].end)}`
      : `${day}: Unable`
  );
  userAvailabilityEl.innerHTML = readable.join("<br>");

  editFirst.value = data.firstName;
  editLast.value = data.lastName;
  editLocation.value = data.location?.city || data.location || "";
  editBio.value = data.bio || "";

  skillsContainer.innerHTML = '';
  (data.skills || []).forEach(s => createSkillInput(s));
  requestedSkillsContainer.innerHTML = '';
  (data.requestedSkills || []).forEach(s => createRequestedSkillInput(s));

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

// Save edits
editForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const skills = [];
  const requestedSkills = [];
  let skillError = false;

  skillsContainer.querySelectorAll(".row").forEach(row => {
    const [nameInput, descInput] = row.querySelectorAll("input");
    const name = nameInput.value.trim();
    const description = descInput.value.trim();
    if (name) {
      if (!skillOptions.includes(name)) {
        skillError = true;
        nameInput.classList.add("is-invalid");
      } else {
        nameInput.classList.remove("is-invalid");
        skills.push({ name, description });
      }
    }
  });

  requestedSkillsContainer.querySelectorAll(".row").forEach(row => {
    const [nameInput, descInput] = row.querySelectorAll("input");
    const name = nameInput.value.trim();
    const description = descInput.value.trim();
    if (name) {
      if (!skillOptions.includes(name)) {
        skillError = true;
        nameInput.classList.add("is-invalid");
      } else {
        nameInput.classList.remove("is-invalid");
        requestedSkills.push({ name, description });
      }
    }
  });

  if (skillError) {
    alert("Please choose valid skill names from the list.");
    return;
  }

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
    alert("Error saving profile: " + err.message);
  }
});

// Load navbar and footer
fetch('navbar.html').then(res => res.text()).then(html => {
  document.getElementById('navbar').innerHTML = html;
});
fetch('footer.html').then(res => res.text()).then(html => {
  document.getElementById('footer').innerHTML = html;
  initAutocomplete();
});

// Set up Google Places
window.initAutocomplete = () => {
  const input = document.getElementById("edit-location");
  if (!input || typeof google === 'undefined') return;

  const autocomplete = new google.maps.places.Autocomplete(input, {
    types: ['(cities)'],
    fields: ['address_components', 'formatted_address', 'geometry']
  });

  autocomplete.addListener("place_changed", () => {
    const place = autocomplete.getPlace();
    const cityComponent = place.address_components?.find(c => c.types.includes("locality"));
    const city = cityComponent?.long_name || place.formatted_address;
    input.value = city;
  });

  input.addEventListener("input", () => {
    // future: flag for validation if needed
  });
};

// Autocomplete for skills
function setupSkillAutocomplete(row) {
  const input = row.querySelector(".skill-input");
  const list = row.querySelector(".autocomplete-list");

  input.addEventListener("input", () => {
    const query = input.value.toLowerCase().trim();
    list.innerHTML = "";
    if (!query) return;

    const matches = skillOptions
      .filter(s => s.toLowerCase().includes(query))
      .slice(0, 5);

    matches.forEach(skill => {
      const item = document.createElement("div");
      item.className = "autocomplete-item";
      item.textContent = skill;
      item.onclick = () => {
        input.value = skill;
        list.innerHTML = "";
      };
      list.appendChild(item);
    });
  });

  document.addEventListener("click", (e) => {
    if (!row.contains(e.target)) list.innerHTML = "";
  });
}

// Initial setup
document.addEventListener("DOMContentLoaded", () => {
  buildAvailabilityUI();
  setupAvailabilityEvents();
  addSkillBtn.addEventListener("click", () => createSkillInput());
  addRequestedSkillBtn.addEventListener("click", () => createRequestedSkillInput());
});

document.getElementById("editProfileModal").addEventListener("shown.bs.modal", () => {
  setTimeout(() => initAutocomplete(), 100);
});
