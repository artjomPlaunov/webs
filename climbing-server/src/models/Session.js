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
Object.defineProperty(exports, "__esModule", { value: true });
exports.SessionModel = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const uuid_1 = require("uuid");
// Define AttemptsSchema without _id and version key
const AttemptsSchema = new mongoose_1.Schema({
    success: { type: Number, required: true, default: 0 },
    fail: { type: Number, required: true, default: 0 }
}, { _id: false, versionKey: false }); // Disable _id and versioning for AttemptsSchema
// Define RouteSchema without _id and version key
const RouteSchema = new mongoose_1.Schema({
    difficulty: { type: Number, required: true },
    attempts: { type: AttemptsSchema, required: true } // Reference AttemptsSchema
}, { _id: false, versionKey: false }); // Disable _id and versioning for RouteSchema
const SessionSchema = new mongoose_1.Schema({
    id: { type: String, default: uuid_1.v4, unique: true },
    date: { type: String, required: true },
    routes: [RouteSchema]
});
exports.SessionModel = mongoose_1.default.model('Session', SessionSchema);
