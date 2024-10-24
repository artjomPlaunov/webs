// models/User.ts
import mongoose, { Schema, Document } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export interface User extends Document {
  id: string;
  username: string;
  password: string;
  sessionIds: string[];
}

const UserSchema = new Schema({
  id: { type: String, default: uuidv4, unique: true },
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  sessionIds: [{ type: String }]
}, { _id: true }); // Explicitly enable the default _id field

export const UserModel = mongoose.model<User>('User', UserSchema);

// Function to drop the problematic index
export async function dropIdIndex() {
  try {
    await UserModel.collection.dropIndex('id_1');
    console.log('Successfully dropped id_1 index');
  } catch (error) {
    console.log('Error dropping index (it may not exist):', error);
  }
}

// Function to update existing users with an id if they don't have one
export async function updateExistingUsers() {
  try {
    const usersWithoutId = await UserModel.find({ id: { $exists: false } });
    for (const user of usersWithoutId) {
      user.id = uuidv4();
      await user.save();
    }
    console.log(`Updated ${usersWithoutId.length} users with new ids`);
  } catch (error) {
    console.error('Error updating existing users:', error);
  }
}
