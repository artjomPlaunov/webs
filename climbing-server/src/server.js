"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const mongoose_1 = __importDefault(require("mongoose"));
const sessionRoutes_1 = __importDefault(require("./routes/sessionRoutes"));
const User_1 = require("./models/User");
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = 5001;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Connect to MongoDB
const username = encodeURIComponent(process.env.MONGODB_USERNAME);
const password = encodeURIComponent(process.env.MONGODB_PASSWORD);
const uri = process.env.MONGODB_URI
    .replace('<db_username>', username)
    .replace('<db_password>', password);
mongoose_1.default.connect(uri)
    .then(() => __awaiter(void 0, void 0, void 0, function* () {
    console.log('Connected to MongoDB');
    yield (0, User_1.updateExistingUsers)(); // Update existing users with new ids
}))
    .catch((error) => console.error('Error connecting to MongoDB:', error));
// Use session routes
app.use('/api', sessionRoutes_1.default);
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
