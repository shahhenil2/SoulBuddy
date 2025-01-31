// Fetch and display starred journal entries
function loadStarredEntries() {
    fetch('/starred_journal')
        .then(response => response.json())
        .then(data => {
            const starredContainer = document.getElementById('starred-entries');
            starredContainer.innerHTML = ''; // Clear existing entries
            data.entries.forEach(entry => {
                const entryCard = document.createElement('div');
                entryCard.classList.add('entry-card');
                entryCard.innerHTML = `
                    <h5>${entry.title}</h5>
                    <p>${entry.content}</p>
                    <small>${new Date(entry.date).toLocaleString()}</small>
                `;
                starredContainer.appendChild(entryCard);
            });
        });
}

// Load starred entries on page load
document.addEventListener('DOMContentLoaded', loadStarredEntries);
