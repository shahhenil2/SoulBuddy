const express = require('express');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');

const app = express();
const PORT = 8080;

// Middleware
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());

// Journal storage file
const JOURNAL_FILE = path.join(__dirname, 'journal.json');

// Load or initialize journal data
let journalData = [];
if (fs.existsSync(JOURNAL_FILE)) {
    journalData = JSON.parse(fs.readFileSync(JOURNAL_FILE));
}

// Serve journal.html at the root
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'journal.html'));
});

// API to get all journal entries
app.get('/journal', (req, res) => {
    res.json({ entries: journalData });
});

// API to save a new journal entry
app.post('/journal', (req, res) => {
    const { title, content, date } = req.body;
    if (!title || !content || !date) {
        return res.status(400).json({ status: 'error', message: 'All fields are required' });
    }
    const newEntry = { title, content, date, id: Date.now() };
    journalData.unshift(newEntry);
    fs.writeFileSync(JOURNAL_FILE, JSON.stringify(journalData, null, 2));
    res.json({ status: 'success' });
});

// API to delete a journal entry by ID
app.delete('/journal/:id', (req, res) => {
    const entryId = parseInt(req.params.id, 10);
    const entryIndex = journalData.findIndex(entry => entry.id === entryId);

    if (entryIndex !== -1) {
        // Remove the entry from the array
        journalData.splice(entryIndex, 1);

        // Save the updated data back to the file
        fs.writeFileSync(JOURNAL_FILE, JSON.stringify(journalData, null, 2));
        res.json({ status: 'success', message: 'Entry deleted successfully' });
    } else {
        res.status(404).json({ status: 'error', message: 'Entry not found' });
    }
});

app.get('/level', (req, res) => {
    const totalEntries = journalData.length;
    const level = Math.floor(totalEntries / 3) + 1;
    const entriesToNextLevel = 3 - (totalEntries % 3);
    res.json({ level, entriesToNextLevel });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});
