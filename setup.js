// Track whether location was selected from autocomplete
window.locationPlaceSelected = false;

// Predefined skill options
const skillOptions = [/* long list from your original post (omitted here for brevity) */];

// Wait for DOM load
document.addEventListener("DOMContentLoaded", () => {
  // Tooltips
  const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
  tooltipTriggerList.forEach(el => new bootstrap.Tooltip(el));

  // Footer
  fetch('footer.html').then(res => res.text()).then(html => {
    document.getElementById('footer').innerHTML = html;
  });

  // Google Places Autocomplete
  const input = document.getElementById("location");
  if (input && typeof google !== 'undefined') {
    const autocomplete = new google.maps.places.Autocomplete(input, { types: ['geocode'] });
    autocomplete.addListener("place_changed", () => {
      const place = autocomplete.getPlace();
      window.locationPlaceSelected = !!(place && place.geometry);
    });
    input.addEventListener("input", () => {
      window.locationPlaceSelected = false;
    });
  }

  // Populate availability
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  const container = document.getElementById("availability-fields");
  days.forEach(day => {
    const row = document.createElement("div");
    row.className = "d-flex align-items-center gap-2 flex-wrap";
    row.innerHTML = `
      <input type="checkbox" id="${day}-check" class="form-check-input" />
      <label for="${day}-check" class="form-label mb-0" style="width: 90px;">${day}</label>
      <input type="time" id="${day}-start" class="form-control" style="width: 130px;" disabled />
      <span>to</span>
      <input type="time" id="${day}-end" class="form-control" style="width: 130px;" disabled />
    `;
    container.appendChild(row);
  });

  // Enable/disable time inputs
  days.forEach(day => {
    document.addEventListener("change", (e) => {
      if (e.target.id === `${day}-check`) {
        document.getElementById(`${day}-start`).disabled = !e.target.checked;
        document.getElementById(`${day}-end`).disabled = !e.target.checked;
      }
    });
  });

  // Build datalist of predefined skills
  const datalist = document.getElementById("skills-datalist");
  skillOptions.forEach(skill => {
    const option = document.createElement("option");
    option.value = skill;
    datalist.appendChild(option);
  });

  // Add skill rows
  const skillsContainer = document.getElementById("skills-container");
  const addSkillBtn = document.getElementById("add-skill-btn");

  const addSkillRow = () => {
    const row = document.createElement("div");
    row.className = "skill-entry row g-2 align-items-center mb-2";

    row.innerHTML = `
      <div class="col-md-5">
        <input type="text" class="form-control skill-name" placeholder="Skill name" list="skills-datalist" />
      </div>
      <div class="col-md-6">
        <input type="text" class="form-control skill-desc" placeholder="Description" />
      </div>
      <div class="col-md-1 text-end">
        <button type="button" class="btn btn-sm btn-outline-danger remove-skill-btn">
          <i class="bi bi-x-circle"></i>
        </button>
      </div>
    `;

    row.querySelector(".remove-skill-btn").addEventListener("click", () => {
      row.remove();
    });

    skillsContainer.appendChild(row);
  };

  // Attach to + button
  addSkillBtn.addEventListener("click", addSkillRow);

  // Make sure first skill row can be removed
  document.querySelectorAll(".remove-skill-btn").forEach(btn => {
    btn.addEventListener("click", (e) => e.target.closest(".skill-entry")?.remove());
  });
});

// Firebase setup
import { auth, db } from './firebase-config.js';
import { doc, setDoc } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js';
import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js';

// Handle form submission
document.getElementById("profile-form").addEventListener("submit", async (e) => {
  e.preventDefault();

  const firstName = document.getElementById("firstName").value.trim();
  const lastName = document.getElementById("lastName").value.trim();
  const location = document.getElementById("location").value.trim();
  const bio = document.getElementById("bio").value.trim();

  const skills = [];
  let hasInvalidSkill = false;

  document.querySelectorAll(".skill-entry").forEach(entry => {
    const name = entry.querySelector(".skill-name").value.trim();
    const desc = entry.querySelector(".skill-desc").value.trim();
    if (name && desc) {
      if (!skillOptions.includes(name)) {
        hasInvalidSkill = true;
        entry.querySelector(".skill-name").classList.add("is-invalid");
      } else {
        entry.querySelector(".skill-name").classList.remove("is-invalid");
        skills.push({ name, description: desc });
      }
    }
  });

  if (hasInvalidSkill) {
    document.getElementById("error-message").textContent = "Please choose valid skill names from the list.";
    return;
  }

  // Availability
  const availability = {};
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  days.forEach(day => {
    const check = document.getElementById(`${day}-check`);
    const start = document.getElementById(`${day}-start`);
    const end = document.getElementById(`${day}-end`);
    if (check?.checked) {
      availability[day] = { start: start.value, end: end.value };
    }
  });

  onAuthStateChanged(auth, async (user) => {
    if (user) {
      try {
        await setDoc(doc(db, "users", user.uid), {
          firstName,
          lastName,
          location,
          bio,
          skills,
          availability,
          friends: 0
        });

        document.getElementById("success-message").textContent = "Profile saved!";
        document.getElementById("error-message").textContent = "";
        setTimeout(() => {
          window.location.href = "profile.html";
        }, 1000);

      } catch (error) {
        document.getElementById("error-message").textContent = "Error saving profile: " + error.message;
        document.getElementById("success-message").textContent = "";
      }
    } else {
      document.getElementById("error-message").textContent = "You are not signed in.";
      document.getElementById("success-message").textContent = "";
    }
  });
});
