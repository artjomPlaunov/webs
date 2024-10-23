import express from 'express';
import { getAllSessions, createSession } from '../controllers/sessionController';

const router = express.Router();

router.get('/sessions', getAllSessions);
router.post('/sessions', createSession);

export default router;
