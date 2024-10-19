"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// server.ts
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const uuid_1 = require("uuid");
const app = (0, express_1.default)();
const PORT = 5000;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
let sessions = [];
// Get all sessions
app.get('/api/sessions', (req, res) => {
    res.json(sessions);
});
// Create a new session
app.post('/api/sessions', (req, res) => {
    const newSession = {
        id: (0, uuid_1.v4)(),
        routes: req.body.routes.map((route) => ({
            ...route,
            id: (0, uuid_1.v4)(), // Unique ID for each route
        })),
    };
    sessions.push(newSession);
    res.status(201).json(newSession);
});
// Get a specific session
app.get('/api/sessions/:id', (req, res) => {
    const session = sessions.find((s) => s.id === req.params.id);
    if (!session) {
        res.status(404).send('Session not found');
    }
    else {
        res.json(session);
    }
});
// Start the server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
