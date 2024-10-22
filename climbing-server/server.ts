import express, { Request, Response } from 'express';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';
import mongoose, { Schema, Document } from 'mongoose';

dotenv.config();

const app = express();
const PORT: number = 5000;

app.use(cors());
app.use(express.json());

// Define interfaces
interface Attempts {
  success: number;
  fail: number;
}

interface Route {
  difficulty: number;
  attempts: Attempts;
}

interface Session extends Document {
  id: string;
  date: string;
  routes: Route[];
}

// Define Mongoose Schemas
const AttemptsSchema = new Schema({
  success: { type: Number, required: true, default: 0 },
  fail: { type: Number, required: true, default: 0 }
});

const RouteSchema = new Schema({
  difficulty: { type: Number, required: true },
  attempts: { type: AttemptsSchema, required: true }
});

const SessionSchema = new Schema({
  id: { type: String, required: true, unique: true },
  date: { type: String, required: true },
  routes: [RouteSchema]
});

// Create Mongoose Model
const SessionModel = mongoose.model<Session>('Session', SessionSchema);

const username = encodeURIComponent(process.env.MONGODB_USERNAME as string);
const password = encodeURIComponent(process.env.MONGODB_PASSWORD as string);
const uri = `mongodb+srv://${username}:${password}@cluster0.vehjw.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
console.log(uri);

mongoose.connect(uri)
  .then(() => console.log('Connected to MongoDB'))
  .catch((error) => console.error('MongoDB connection error:', error));

// Update GET route to retrieve all sessions
app.get('/api/sessions', async (req: Request, res: Response) => {
  try {
    const sessions: Session[] = await SessionModel.find();
    console.log(sessions);
    console.log(sessions.length);
    res.json(sessions);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving sessions', error });
  }
});

// Update POST route to create a new session
app.post('/api/sessions', async (req: Request, res: Response) => {
  try {
    const newSession = new SessionModel({
      id: uuidv4(),
      date: new Date().toISOString().split('T')[0],
      routes: req.body.routes
    });

    const savedSession = await newSession.save();
    res.status(201).json(savedSession);
  } catch (error) {
    res.status(400).json({ message: 'Error creating session', error });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  // This message will be logged when the server successfully starts
});
