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
exports.UserModel = void 0;
exports.dropIdIndex = dropIdIndex;
exports.updateExistingUsers = updateExistingUsers;
// models/User.ts
const mongoose_1 = __importStar(require("mongoose"));
const uuid_1 = require("uuid");
const UserSchema = new mongoose_1.Schema({
    id: { type: String, default: uuid_1.v4, unique: true },
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    sessionIds: [{ type: String }]
}, { _id: true }); // Explicitly enable the default _id field
exports.UserModel = mongoose_1.default.model('User', UserSchema);
// Function to drop the problematic index
function dropIdIndex() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield exports.UserModel.collection.dropIndex('id_1');
            console.log('Successfully dropped id_1 index');
        }
        catch (error) {
            console.log('Error dropping index (it may not exist):', error);
        }
    });
}
// Function to update existing users with an id if they don't have one
function updateExistingUsers() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const usersWithoutId = yield exports.UserModel.find({ id: { $exists: false } });
            for (const user of usersWithoutId) {
                user.id = (0, uuid_1.v4)();
                yield user.save();
            }
            console.log(`Updated ${usersWithoutId.length} users with new ids`);
        }
        catch (error) {
            console.error('Error updating existing users:', error);
        }
    });
}
