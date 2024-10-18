// server.js
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

let sessions = [];
let sessionIdCounter = 1;

// Get all sessions
app.get('/api/sessions', (req, res) => {
  res.json(sessions);
});

// Create a new session
app.post('/api/sessions', (req, res) => {
  const newSession = {
    id: sessionIdCounter++,
    routes: req.body.routes,
  };
  sessions.push(newSession);
  res.status(201).json(newSession);
});

// Get a specific session
app.get('/api/sessions/:id', (req, res) => {
  const session = sessions.find((s) => s.id === parseInt(req.params.id));
  if (!session) return res.status(404).send('Session not found');
  res.json(session);
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
