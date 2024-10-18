/*
  This file sets up a simple Express server for our Climbing App.
  It provides API endpoints to manage climbing sessions and routes.

  We'll start by importing the necessary modules and setting up our Express app.
*/

const express = require('express');
const cors = require('cors');
const app = express();
app.use(express.json());
const port = 5000;

// Enable Cross-Origin Resource Sharing (CORS) and JSON parsing middleware
app.use(cors());
app.use(express.json());

/*
  We'll use an in-memory array to store our sessions.
  In a production app, this would typically be replaced with a database.
*/
let sessions = [];

/*
  API Endpoint: GET /api/sessions
  Purpose: Fetch all climbing sessions
  This endpoint returns a JSON array of all sessions stored in our sessions array.
*/
app.get('/api/sessions', (req, res) => {
  res.json(sessions);
});

/*
  API Endpoint: GET /api/sessions/:id
  Purpose: Fetch a specific session by its ID
  This endpoint looks for a session with the given ID and returns it if found.
  If not found, it returns a 404 error.
*/
app.get('/api/sessions/:id', (req, res) => {
  const session = sessions.find(s => s.id === parseInt(req.params.id));
  session ? res.json(session) : res.status(404).end();
});

/*
  API Endpoint: POST /api/sessions
  Purpose: Create a new climbing session
  This endpoint creates a new session object with a unique ID, current date,
  empty routes array, and sets it as not completed. It then adds this new
  session to our sessions array and returns it to the client.
*/
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

/*
  API Endpoint: PUT /api/sessions/:id
  Purpose: Mark a session as complete
  This endpoint updates the 'completed' status of a specific session.
  If the session is found, it updates the status and returns the updated session.
  If not found, it returns a 404 error.
*/
app.put('/api/sessions/:id', (req, res) => {
  const session = sessions.find(s => s.id === parseInt(req.params.id));
  if (session) {
    session.completed = req.body.completed || session.completed;
    res.json(session);
  } else {
    res.status(404).end();
  }
});

/*
  API Endpoint: POST /api/sessions/:id/routes
  Purpose: Add a new route to a specific session
  This endpoint creates a new route object and adds it to the specified session.
  If the session is found, it adds the route and returns it. If not, it returns a 404 error.
*/
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
    res.status(404).end();
  }
});

/*
  API Endpoint: PUT /api/sessions/:sessionId/routes/:routeId
  Purpose: Update route data in a session
  This endpoint updates the data for a specific route in a specific session.
  It can update the difficulty and the attempt/success/failure counts.
  If the session and route are found, it updates the data and returns the updated route.
  If either the session or route is not found, it returns a 404 error.
*/
app.put('/api/sessions/:sessionId/routes/:routeId', (req, res) => {
  const session = sessions.find(s => s.id === parseInt(req.params.sessionId));
  if (session) {
    const route = session.routes.find(r => r.id === parseInt(req.params.routeId));
    if (route) {
      route.difficulty = req.body.difficulty; 
      route.attempts = req.body.attempts;
      route.successes = req.body.successes;
      route.failures = req.body.failures;
      res.json(route);
    } else {
      res.status(404).end();
    }
  } else {
    res.status(404).end();
  }
});

/*
  Finally, we start our server listening on the specified port.
  When the server starts successfully, it logs a message to the console.
*/
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
