// server.js
const express = require('express');
const cors = require('cors');
const app = express();
const port = 5000; // You can change the port if needed

app.use(cors());
app.use(express.json()); // Middleware to parse JSON bodies

// Sample in-memory database (you can later replace this with a real DB)
let routes = [
  { id: 1, difficulty: 0, attempts: 0, successes: 0, failures: 0 },
  { id: 2, difficulty: 0, attempts: 0, successes: 0, failures: 0 },
  { id: 3, difficulty: 0, attempts: 0, successes: 0, failures: 0 },
];

// Route to get all routes data
app.get('/api/routes', (req, res) => {
  res.json(routes);
});

// Route to update a specific route
app.put('/api/routes/:id', (req, res) => {
  const routeId = parseInt(req.params.id, 10);
  const { difficulty, attempts, successes, failures } = req.body;

  const routeIndex = routes.findIndex((route) => route.id === routeId);

  if (routeIndex !== -1) {
    routes[routeIndex] = { id: routeId, difficulty, attempts, successes, failures };
    res.status(200).json(routes[routeIndex]);
  } else {
    res.status(404).json({ message: 'Route not found' });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
