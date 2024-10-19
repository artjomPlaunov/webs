// server.js
const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

let sessions = [];

// Get all sessions
app.get('/api/sessions', (req, res) => {
  res.json(sessions);
});

// Create a new session
app.post('/api/sessions', (req, res) => {
  const newSession = {
    id: uuidv4(),
    routes: req.body.routes.map(route => ({
      ...route,
      id: uuidv4(), // Unique ID for each route
    })),
  };
  sessions.push(newSession);
  res.status(201).json(newSession);
});

// Get a specific session
app.get('/api/sessions/:id', (req, res) => {
  const session = sessions.find((s) => s.id === req.params.id);
  if (!session) return res.status(404).send('Session not found');
  res.json(session);
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
