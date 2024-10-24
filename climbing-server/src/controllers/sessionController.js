"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSession = exports.getAllSessions = void 0;
const Session_1 = require("../models/Session");
const User_1 = require("../models/User");
const uuid_1 = require("uuid");
const jsonwebtoken_1 = __importStar(require("jsonwebtoken"));
const JWT_SECRET = 'your_jwt_secret';
const getUserFromToken = (authHeader) => {
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
        return jsonwebtoken_1.default.verify(token, JWT_SECRET);
    }
    catch (err) {
        if (err instanceof jsonwebtoken_1.JsonWebTokenError) {
            console.error('JWT verification failed:', err.message);
        }
        else {
            console.error('Unexpected error during token verification:', err);
        }
        return null;
    }
};
const getAllSessions = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // Extract user ID from the token
    const userPayload = getUserFromToken(req.headers.authorization);
    // Check if userPayload is a valid JwtPayload
    if (!userPayload || typeof userPayload === 'string' || !userPayload.id) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
    }
    const userId = userPayload.id; // Safely access id after the type check
    try {
        // Find the user by ID
        const user = yield User_1.UserModel.findById(userId);
        // If user not found, return a 404 error
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }
        // Fetch sessions based on user's session IDs
        const sessions = yield Session_1.SessionModel.find({ id: { $in: user.sessionIds } });
        // Return the found sessions
        res.json(sessions);
    }
    catch (error) {
        console.error('Error retrieving sessions:', error); // Log the error for debugging
        res.status(500).json({ message: 'Error retrieving sessions', error });
    }
});
exports.getAllSessions = getAllSessions;
const createSession = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userPayload = getUserFromToken(req.headers.authorization);
    // Check if userPayload is a valid JwtPayload
    if (!userPayload || typeof userPayload === 'string' || !userPayload.id) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
    }
    const userId = userPayload.id; // Safely access id after the type check
    try {
        const newSession = new Session_1.SessionModel({
            id: (0, uuid_1.v4)(),
            date: new Date().toISOString().split('T')[0],
            routes: req.body.routes
        });
        const savedSession = yield newSession.save();
        // Update the user with the new session ID
        yield User_1.UserModel.findByIdAndUpdate(userId, { $push: { sessionIds: savedSession.id } });
        res.status(201).json(savedSession);
    }
    catch (error) {
        console.error('Error creating session:', error); // Log the error for debugging
        res.status(400).json({ message: 'Error creating session', error });
    }
});
exports.createSession = createSession;
