// server.ts
import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';

const app: Express = express();
const PORT: number = 5000;

app.use(cors());
app.use(express.json());

interface Route {
  id: string;
  [key: string]: any; // Allow for additional properties
}

interface Session {
  id: string;
  date: string; // Add date property
  routes: Route[];
}

let sessions: Session[] = [];

// Get all sessions
app.get('/api/sessions', (req: Request, res: Response) => {
  res.json(sessions);
});

// Create a new session
app.post('/api/sessions', (req: Request, res: Response) => {
  const newSession: Session = {
    id: uuidv4(),
    date: new Date().toISOString().split('T')[0], // Store date as ISO string (YYYY-MM-DD)
    routes: req.body.routes.map((route: Omit<Route, 'id'>) => ({
      ...route,
      id: uuidv4(), // Unique ID for each route
    })),
  };
  sessions.push(newSession);
  res.status(201).json(newSession);
});

// Get a specific session
app.get('/api/sessions/:id', (req: Request, res: Response) => {
  const session = sessions.find((s) => s.id === req.params.id);
  if (!session) {
    res.status(404).send('Session not found');
  } else {
    res.json(session);
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
