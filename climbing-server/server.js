// server.js

// Include the necessary modules: Express for the server, and CORS for allowing cross-origin requests.
const express = require('express');
const cors = require('cors');
const app = express(); // Create an instance of the Express app
const port = 5000;     // Set the port for the server

// Use CORS to allow the frontend to talk to this backend.
app.use(cors());
app.use(express.json()); // Use middleware to parse JSON bodies

// Define an in-memory "database" to store the climbing routes.
// Each route has an ID, difficulty level, attempts, successes, and failures.
let routes = [
  { id: 1, difficulty: 0, attempts: 0, successes: 0, failures: 0 },
  { id: 2, difficulty: 0, attempts: 0, successes: 0, failures: 0 },
  { id: 3, difficulty: 0, attempts: 0, successes: 0, failures: 0 },
];

// Define a route to get all routes data.
app.get('/api/routes', (req, res) => {
  res.json(routes); // Send the routes data as a JSON response
});

// Define a route to update a specific route by ID.
// It updates attempts, successes, or failures for the route.
app.put('/api/routes/:id', (req, res) => {
  const routeId = parseInt(req.params.id, 10); // Parse route ID from URL parameters
  const { difficulty, attempts, successes, failures } = req.body; // Destructure request body

  const routeIndex = routes.findIndex((route) => route.id === routeId); // Find the route by ID

  // If the route is found, update its data
  if (routeIndex !== -1) {
    routes[routeIndex] = { id: routeId, difficulty, attempts, successes, failures };
    res.status(200).json(routes[routeIndex]); // Return the updated route
  } else {
    res.status(404).json({ message: 'Route not found' }); // Handle route not found
  }
});

// Define a route to add a new route dynamically.
app.post('/api/routes', (req, res) => {
  const newRoute = req.body;  // The new route data is sent in the request body
  routes.push(newRoute);      // Add the new route to the routes array
  res.status(201).json(newRoute); // Respond with the newly added route
});

// Start the server, listening on the specified port.
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
