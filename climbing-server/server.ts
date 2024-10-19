<<<<<<< HEAD
 
=======
// server.ts
import express, { Request, Response } from 'express';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';

const app = express();
const PORT: number = 5000;

app.use(cors());
app.use(express.json());

interface Route {
  id: string;
  [key: string]: any; // Allow for additional properties
}

interface Session {
  id: string;
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
  if (!session) return res.status(404).send('Session not found');
  res.json(session);
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
>>>>>>> 05dde39392e7fccc26c5494fc13bd5b55b9847da
