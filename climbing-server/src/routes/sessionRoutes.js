"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// routes/sessionRoutes.ts
const express_1 = __importDefault(require("express"));
const sessionController_1 = require("../controllers/sessionController");
const authController_1 = require("../controllers/authController");
const router = express_1.default.Router();
router.post('/register', authController_1.registerUser);
router.post('/login', authController_1.loginUser);
router.get('/sessions', sessionController_1.getAllSessions);
router.post('/sessions', sessionController_1.createSession);
exports.default = router;
