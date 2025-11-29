"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/models/User.ts
const mongoose_1 = __importDefault(require("mongoose"));
const userSchema = new mongoose_1.default.Schema({
    firebaseUid: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    role: { type: String, enum: ["ADMIN", "MANAGER", "MEMBER"], default: "MEMBER" },
    teamId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: "Team" },
});
exports.default = mongoose_1.default.model("User", userSchema);
