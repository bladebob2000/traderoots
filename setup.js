
// Track whether location was selected from autocomplete
window.locationPlaceSelected = false;

const skillOptions = [
    "Lawn Mowing", "Leaf Raking", "Edging Lawns", "Weeding Gardens", "Watering Plants", "Planting Flowers",
    "Shrub Trimming", "Tree Pruning", "Composting", "Mulching", "Snow Shoveling", "Salting Sidewalks",
    "Pool Cleaning", "Pool Chemical Balancing", "Skimming Leaves", "Refilling Water Levels",
    "Dog Walking", "Dog Bathing", "Pet Sitting", "Pet Feeding", "Pet Waste Cleanup",
    "Cat Sitting", "Aquarium Cleaning", "Bird Cage Cleaning", "Pet Medication Administration",
    "Baby Sitting", "Toddler Care", "Infant Feeding", "Story Time for Kids", "Play Supervision", "Diaper Changing",
    "Homework Help", "Math Tutoring", "Reading Tutoring", "Science Tutoring", "History Tutoring", "SAT Prep", "ACT Prep",
    "Essay Editing", "College App Coaching", "Music Lessons", "Piano Lessons", "Guitar Lessons", "Drum Lessons",
    "Language Tutoring", "Spanish Tutoring", "French Tutoring", "Mandarin Tutoring",
    "Senior Care", "Errands for Seniors", "Medicine Pickup", "Grocery Pickup", "Meal Prep for Elderly",
    "Companionship Visits", "Technology Help for Seniors", "Phone Setup", "TV Remote Help",
    "TV Mounting", "Cable Management", "Wiring Setup", "Router Setup", "Wi-Fi Troubleshooting", "Printer Setup",
    "Computer Cleanup", "Virus Removal", "App Installation", "Phone Backup Help",
    "Furniture Assembly", "Shelf Installation", "Curtain Hanging", "Picture Hanging",
    "Closet Organization", "Garage Cleaning", "Attic Cleaning", "Decluttering",
    "Moving Help", "Packing Help", "Unpacking Help", "Box Labeling", "Truck Loading", "Furniture Lifting",
    "Recycling Dropoff", "Donation Runs", "Trash Takeout", "Junk Removal",
    "Car Washing", "Car Vacuuming", "Bike Repair", "Bike Tire Pumping",
    "Grocery Shopping", "Personal Shopping", "Return Items to Stores",
    "Mail Pickup", "Package Dropoff", "Dry Cleaning Dropoff", "Laundry Folding",
    "Laundry Washing", "Ironing Clothes", "Closet Folding", "Shoe Cleaning",
    "Window Washing", "Mirror Cleaning", "Dusting", "Vacuuming", "Mopping Floors",
    "Dishwashing", "Fridge Cleaning", "Microwave Cleaning", "Oven Cleaning", "Countertop Wiping",
    "Meal Prep", "Simple Cooking", "BBQ Grilling", "Lunchbox Packing", "Smoothie Making",
    "Hosting Help", "Serving at Events", "Party Cleanup", "Event Setup", "Decorating for Events",
    "Balloon Setup", "Table Arrangement", "Chair Setup", "Audio Equipment Setup",
    "Face Painting", "Balloon Animals", "Party Games", "Supervising Kids at Events",
    "Social Media Help", "Instagram Reels Help", "TikTok Setup", "YouTube Editing", "Basic Video Editing",
    "Basic Graphic Design", "Flyer Design", "Poster Printing", "Resume Formatting",
    "Job Application Help", "Email Writing Help", "College Essay Editing", "Scholarship Search Help",
    "Babysitter CPR Certified", "First Aid Certified", "Lifeguard Certified", "Driver with Car",
    "Reliable Bike Transport", "Pet-Friendly Home", "Quiet Homework Environment",
    "Early Morning Availability", "Evening Availability", "Weekend Availability",
    "Summer Availability", "After School Availability",
    "Event Photography", "Photo Editing", "Video Recording", "Zoom Setup", "PowerPoint Help",
    "Google Docs Help", "Google Slides Help", "Microsoft Word Help", "Spreadsheet Help",
    "Crafting Help", "Knitting", "Sewing Buttons", "Simple Hemming", "Costume Making",
    "Holiday Decorating", "Gift Wrapping", "Card Writing", "Care Package Packing",
    "Chalk Art", "Sign Holding", "Fundraiser Volunteering", "Community Cleanups", "Pet Adoption Events",
    "Farmers Market Setup", "Booth Sitting", "Flyer Distribution", "Door Hanger Placement",
    "Yard Sale Setup", "Yard Sale Pricing", "Yard Sale Advertising",
    "Children's Book Reading", "Art Lessons", "Origami Teaching", "Lego Building Supervision",
    "Board Game Playing", "Chess Tutoring", "Scrabble Competitions", "Cooking with Kids",
    "Bike Safety Lessons", "Fire Safety Drills", "Neighborhood Watch Help", "Pet Rescue Networking"
  ];
  

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