// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyCw...",
    authDomain: "voluteerform.firebaseapp.com",
    databaseURL: "https://voluteerform-default-rtdb.firebaseio.com",
    projectId: "voluteerform",
    storageBucket: "voluteerform.appspot.com",
    messagingSenderId: "866980903324",
    appId: "1:866980903324:web:80297ec8151192672db059",
    measurementId: "G-F9NXC35THX",
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const database = firebase.database();

// Define goals for each cause
const goals = {
    cause1: 32000, // Goal for Suicide Prevention and Support
    cause2: 60000, // Goal for Mental Health Awareness Campaigns
    cause3: 100000, // Goal for Children's Mental Health and Education
};

// Function to update progress bars and raised amounts
function updateProgressBars() {
    Object.keys(goals).forEach((cause, index) => {
        const causeIndex = index + 1; // Cause ID (1, 2, 3)
        const goal = goals[cause]; // Get goal for the cause

        // Listen for real-time updates from Firebase
        database.ref(`progress/${cause}`).on("value", (snapshot) => {
            const raised = snapshot.val() || 0; // Fetch raised amount from Firebase
            const percentage = Math.min((raised / goal) * 100, 100); // Calculate percentage

            // Update progress bar and raised amount in the UI
            const progressBar = document.getElementById(`progress-bar-${causeIndex}`);
            const raisedElement = document.getElementById(`raised-${causeIndex}`);

            if (progressBar && raisedElement) {
                progressBar.style.width = `${percentage}%`; // Update progress bar width
                progressBar.setAttribute("aria-valuenow", percentage); // Set aria value
                raisedElement.textContent = `₹${raised.toLocaleString("en-IN")}`; // Update raised text
            }
        });
    });
}

// Function to select a cause and store it in localStorage
function selectCause(cause) {
    localStorage.setItem("selectedCause", cause);
}

// Update progress bars when the page loads
document.addEventListener("DOMContentLoaded", updateProgressBars);

// Handle Donation Form Submission
document.addEventListener("DOMContentLoaded", () => {
    const donationForm = document.getElementById("donationForm");

    if (donationForm) {
        donationForm.addEventListener("submit", (e) => {
            e.preventDefault();

            const donorName = document.getElementById("donorName").value.trim();
            const donorEmail = document.getElementById("donorEmail").value.trim();
            const donationFrequency = document.querySelector('input[name="DonationFrequency"]:checked').value;
            const donationAmount = parseFloat(
                document.querySelector('input[name="DonationAmount"]:checked')?.value ||
                document.getElementById("customAmount").value.trim()
            );
            const selectedCause = localStorage.getItem("selectedCause");

            if (!donorName || !donorEmail || !donationFrequency || isNaN(donationAmount) || donationAmount <= 0) {
                alert("Please fill out all required fields correctly!");
                return;
            }

            // Push donation details to Firebase
            database.ref(`donations/${selectedCause}`).push({
                donorName,
                donorEmail,
                donationFrequency,
                donationAmount,
                timestamp: new Date().toISOString(),
            }).then(() => {
                // Update the total raised amount for the selected cause
                database.ref(`progress/${selectedCause}`).transaction((currentProgress) => {
                    return (currentProgress || 0) + donationAmount; // Increment the raised amount
                }).then(() => {
                    window.location.href = "donateconfirm.html"; // Redirect to confirmation page
                });
            }).catch((error) => {
                console.error("Error saving donation:", error);
                alert("Something went wrong. Please try again later.");
            });
        });
    }
});
