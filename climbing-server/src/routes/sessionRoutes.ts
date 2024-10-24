// routes/sessionRoutes.ts
import express from 'express';
import { getAllSessions, createSession } from '../controllers/sessionController';
import { registerUser, loginUser } from '../controllers/authController';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/sessions', getAllSessions);
router.post('/sessions', createSession);



export default router;

