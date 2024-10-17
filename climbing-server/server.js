const express = require('express');
const cors = require('cors');
const app = express();
const port = 5000;

app.use(cors());
app.use(express.json());

let sessions = [];

// Fetch all sessions
app.get('/api/sessions', (req, res) => {
  res.json(sessions);
});

// Fetch session by ID
app.get('/api/sessions/:id', (req, res) => {
  const session = sessions.find(s => s.id === parseInt(req.params.id));
  session ? res.json(session) : res.status(404).send('Session not found');
});

// Create a new session
app.post('/api/sessions', (req, res) => {
  const newSession = {
    id: sessions.length + 1,
    date: new Date().toISOString().split('T')[0],  // Use the current date
    routes: [],
    completed: false,
  };
  sessions.push(newSession);
  res.json(newSession);
});

// Mark session as complete
app.put('/api/sessions/:id', (req, res) => {
  const session = sessions.find(s => s.id === parseInt(req.params.id));
  if (session) {
    session.completed = req.body.completed || session.completed;
    res.json(session);
  } else {
    res.status(404).send('Session not found');
  }
});

// Add a route to a session
app.post('/api/sessions/:id/routes', (req, res) => {
  const session = sessions.find(s => s.id === parseInt(req.params.id));
  if (session) {
    const newRoute = {
      id: session.routes.length + 1,
      difficulty: req.body.difficulty || 0,
      attempts: 0,
      successes: 0,
      failures: 0,
    };
    session.routes.push(newRoute);
    res.json(newRoute);
  } else {
    res.status(404).send('Session not found');
  }
});

// Update route data in a session
app.put('/api/sessions/:sessionId/routes/:routeId', (req, res) => {
  const session = sessions.find(s => s.id === parseInt(req.params.sessionId));
  if (session) {
    const route = session.routes.find(r => r.id === parseInt(req.params.routeId));
    if (route) {
      route.difficulty = req.body.difficulty !== undefined ? req.body.difficulty : route.difficulty;
      route.attempts = req.body.success !== null ? route.attempts + 1 : route.attempts;
      route.successes = req.body.success === true ? route.successes + 1 : route.successes;
      route.failures = req.body.success === false ? route.failures + 1 : route.failures;
      res.json(route);
    } else {
      res.status(404).send('Route not found');
    }
  } else {
    res.status(404).send('Session not found');
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
