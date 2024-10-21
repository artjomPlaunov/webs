// This is the main server file for our climbing app backend

// Import necessary modules
import express, { Request, Response } from 'express';
// Express is a web application framework for Node.js
// We're importing the main express function and two types: Request and Response

import cors from 'cors';
// CORS (Cross-Origin Resource Sharing) is a security feature implemented by web browsers
// This module will help us handle CORS issues

import { v4 as uuidv4 } from 'uuid';
// uuid is a library for generating unique identifiers
// We're importing the v4 function and renaming it to uuidv4

// Create an instance of the express application
const app = express();
// This creates our server application

// Define the port number our server will listen on
const PORT: number = 5000;

// Middleware setup
app.use(cors());
// This enables CORS for all routes, allowing our frontend to make requests to this server

app.use(express.json());
// This middleware parses incoming JSON payloads, making them available in req.body

// Define interfaces for our data structures
interface Route {
  id: string;
  [key: string]: any; // This allows for additional properties on the Route object
}

interface Session {
  id: string;
  date: string;
  routes: Route[];
}

// In-memory storage for our sessions
let sessions: Session[] = [];
// In a production app, this would typically be replaced with a database

// Define our API routes

// GET route to retrieve all sessions
app.get('/api/sessions', (req: Request, res: Response) => {
  res.json(sessions);
  // This sends all sessions as a JSON response
});

// POST route to create a new session
app.post('/api/sessions', (req: Request, res: Response) => {
  // Create a new session object
  const newSession: Session = {
    id: uuidv4(), // Generate a unique ID for the session
    date: new Date().toISOString().split('T')[0], // Store date as ISO string (YYYY-MM-DD)
    routes: req.body.routes.map((route: Omit<Route, 'id'>) => ({
      ...route,
      id: uuidv4(), // Generate a unique ID for each route
    })),
  };
  
  // Add the new session to our sessions array
  sessions.push(newSession);
  
  // Send the newly created session as a response with a 201 (Created) status
  res.status(201).json(newSession);
});

// GET route to retrieve a specific session by ID
app.get('/api/sessions/:id', (req: Request, res: Response) => {
  // Find the session with the matching ID
  const session = sessions.find((s) => s.id === req.params.id);
  
  if (!session) {
    // If no session is found, send a 404 (Not Found) response
    res.status(404).send('Session not found');
  } else {
    // If found, send the session as a JSON response
    res.json(session);
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  // This message will be logged when the server successfully starts
});
