import mongoose, { Schema, Document } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

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

// Define AttemptsSchema without _id and version key
const AttemptsSchema = new Schema({
  success: { type: Number, required: true, default: 0 },
  fail: { type: Number, required: true, default: 0 }
}, { _id: false, versionKey: false });  // Disable _id and versioning for AttemptsSchema

// Define RouteSchema without _id and version key
const RouteSchema = new Schema({
  difficulty: { type: Number, required: true },
  attempts: { type: AttemptsSchema, required: true }  // Reference AttemptsSchema
}, { _id: false, versionKey: false });  // Disable _id and versioning for RouteSchema

const SessionSchema = new Schema({
  id: { type: String, default: uuidv4, unique: true },
  date: { type: String, required: true },
  routes: [RouteSchema]
});

export const SessionModel = mongoose.model<Session>('Session', SessionSchema);
