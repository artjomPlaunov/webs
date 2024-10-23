import { Request, Response } from 'express';
import { Session, SessionModel } from '../models/Session';
import { v4 as uuidv4 } from 'uuid';

export const getAllSessions = async (req: Request, res: Response) => {
  try {
    const sessions: Session[] = await SessionModel.find();
    res.json(sessions);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving sessions', error });
  }
};

export const createSession = async (req: Request, res: Response) => {
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
};
