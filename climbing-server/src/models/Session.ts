import mongoose, { Schema, Document } from 'mongoose';

interface Attempts {
  success: number;
  fail: number;
}

interface Route {
  difficulty: number;
  attempts: Attempts;
}

export interface Session extends Document {
  id: string;
  date: string;
  routes: Route[];
}

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

export const SessionModel = mongoose.model<Session>('Session', SessionSchema);
