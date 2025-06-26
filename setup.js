
// Track whether location was selected from autocomplete
window.locationPlaceSelected = false;

document.addEventListener("DOMContentLoaded", () => {
    // Tooltips
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.forEach(el => new bootstrap.Tooltip(el));

    // Footer
    fetch('footer.html').then(res => res.text()).then(html => {
        document.getElementById('footer').innerHTML = html;
    });

    // Autocomplete
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

    // Enable/disable times
    days.forEach(day => {
        document.addEventListener("change", (e) => {
            if (e.target.id === `${day}-check`) {
                document.getElementById(`${day}-start`).disabled = !e.target.checked;
                document.getElementById(`${day}-end`).disabled = !e.target.checked;
            }
        });
    });
});