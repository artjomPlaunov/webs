// controllers/sessionController.ts
import { Request, Response } from 'express';
import { SessionModel } from '../models/Session';
import { UserModel } from '../models/User';
import { v4 as uuidv4 } from 'uuid';
import jwt, {JwtPayload, JsonWebTokenError} from 'jsonwebtoken';

const JWT_SECRET = 'your_jwt_secret';


const getUserFromToken = (authHeader: string | undefined): JwtPayload | null => {
  if (!authHeader) {
    console.error('No authorization header provided');
    return null;
  }

  const token = authHeader.split(' ')[1]; // Extract token from "Bearer <token>"
  if (!token) {
    console.error('No token found in authorization header');
    return null;
  }

  try {
    return jwt.verify(token, JWT_SECRET) as JwtPayload;
  } catch (err) {
    if (err instanceof JsonWebTokenError) {
      console.error('JWT verification failed:', err.message);
    } else {
      console.error('Unexpected error during token verification:', err);
    }
    return null;
  }
};

export const getAllSessions = async (req: Request, res: Response) => {
  // Extract user ID from the token
  const userPayload = getUserFromToken(req.headers.authorization as string);
  // Check if userPayload is a valid JwtPayload
  if (!userPayload || typeof userPayload === 'string' || !userPayload.id) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  const userId = userPayload!.id; // Safely access id after the type check

  try {
    // Find the user by ID
    const user = await UserModel.findById(userId);
    
    // If user not found, return a 404 error
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    // Fetch sessions based on user's session IDs
    const sessions = await SessionModel.find({ id: { $in: user!.sessionIds } });

    // Return the found sessions
    res.json(sessions);
  } catch (error) {
    console.error('Error retrieving sessions:', error); // Log the error for debugging
    res.status(500).json({ message: 'Error retrieving sessions', error });
  }
};

export const createSession = async (req: Request, res: Response) => {
  const userPayload = getUserFromToken(req.headers.authorization as string);
  // Check if userPayload is a valid JwtPayload
  if (!userPayload || typeof userPayload === 'string' || !userPayload.id) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }
  
  const userId = userPayload!.id; // Safely access id after the type check

  try {
    const newSession = new SessionModel({
      id: uuidv4(),
      date: new Date().toISOString().split('T')[0],
      routes: req.body.routes
    });

    const savedSession = await newSession.save();

    // Update the user with the new session ID
    await UserModel.findByIdAndUpdate(userId, { $push: { sessionIds: savedSession.id } });

    res.status(201).json(savedSession);
  } catch (error) {
    console.error('Error creating session:', error); // Log the error for debugging
    res.status(400).json({ message: 'Error creating session', error });
  }
};

