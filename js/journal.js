// Fetch and display the latest journal entry
function loadLatestEntry() {
    fetch('/journal')
        .then(response => response.json())
        .then(data => {
            const latestEntry = data.entries[0]; // Assuming the latest entry is the first
            if (latestEntry) {
                document.querySelector('.entry-title').textContent = latestEntry.title;
                document.querySelector('.entry-content').textContent = latestEntry.content;
                document.querySelector('.text-muted').textContent = new Date(latestEntry.date).toLocaleString();
            }
        });
}

// Save a new journal entry
function saveJournalEntry(event) {
    event.preventDefault();

    const title = document.getElementById('title').value;
    const content = document.getElementById('content').value;
    const date = new Date().toISOString();

    fetch('/journal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content, date })
    })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                alert('Entry saved successfully!');
                document.getElementById('journalForm').reset();
                loadLatestEntry();
                updateLevel(); // Refresh level information
            }
        })
        .catch(err => console.error('Error saving entry:', err));
}


// Attach event listeners when the page is ready
document.addEventListener('DOMContentLoaded', function () {
    loadLatestEntry();
    document.getElementById('journalForm').addEventListener('submit', saveJournalEntry);
});
