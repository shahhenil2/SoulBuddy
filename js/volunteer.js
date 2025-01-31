// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCw0cSkM54jEMoLNQC2Tt579eUSNoAtqfc",
    authDomain: "voluteerform.firebaseapp.com",
    databaseURL: "https://voluteerform-default-rtdb.firebaseio.com",
    projectId: "voluteerform",
    storageBucket: "voluteerform.firebasestorage.app",
    messagingSenderId: "866980903324",
    appId: "1:866980903324:web:80297ec8151192672db059",
    measurementId: "G-F9NXC35THX",
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const database = firebase.database();

// Handle form submission
document.getElementById("volunteerForm").addEventListener("submit", function (event) {
    event.preventDefault(); // Prevent default form submission behavior

    const name = document.getElementById("volunteer-name").value.trim();
    const email = document.getElementById("volunteer-email").value.trim();
    const number = document.getElementById("volunteer-number").value.trim();
    const age = document.getElementById("volunteer-age").value.trim();
    const message = document.getElementById("volunteer-message").value.trim();

    // Validation
    if (!name || !email || !number || !age) {
        alert("Please fill all the required fields.");
        return;
    }

    if (!/^\S+@\S+\.\S+$/.test(email)) {
        alert("Please enter a valid email address.");
        return;
    }

    if (!/^\d{10}$/.test(number)) {
        alert("Phone Number must be exactly 10 digits.");
        return;
    }

    if (isNaN(age) || age < 1 || age > 120) {
        alert("Please enter a valid age between 1 and 120.");
        return;
    }

    // Save data to Firebase
    database
        .ref("volunteers")
        .push({
            name,
            email,
            number,
            age,
            message,
            timestamp: new Date().toISOString(),
        })
        .then(() => {
            window.location.href = "regivolunteer.html";
        })
        .catch((error) => {
            console.error("Error while registering:", error);
            alert("Something went wrong. Please try again.");
        });
});
