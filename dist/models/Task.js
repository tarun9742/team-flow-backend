"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const taskSchema = new mongoose_1.default.Schema({
    title: { type: String, required: true },
    description: String,
    status: { type: String, enum: ["todo", "in-progress", "done"], default: "todo" },
    projectId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: "Project", required: true },
    assignedTo: { type: mongoose_1.default.Schema.Types.ObjectId, ref: "User", default: null },
}, { timestamps: true });
exports.default = mongoose_1.default.model("Task", taskSchema);
