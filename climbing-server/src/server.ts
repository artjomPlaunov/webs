import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import sessionRoutes from './routes/sessionRoutes';

dotenv.config();

const app = express();
const PORT: number = 5000;

app.use(cors());
app.use(express.json());

// Connect to MongoDB
const username = encodeURIComponent(process.env.MONGODB_USERNAME as string);
const password = encodeURIComponent(process.env.MONGODB_PASSWORD as string);
const uri = (process.env.MONGODB_URI as string)
  .replace('<db_username>', username)
  .replace('<db_password>', password);

mongoose.connect(uri)
  .then(() => console.log('Connected to MongoDB'))
  .catch((error) => console.error('Error connecting to MongoDB:', error));

// Use session routes
app.use('/api', sessionRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});