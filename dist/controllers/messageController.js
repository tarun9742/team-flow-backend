"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendMessage = exports.getTeamMessages = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const Message_1 = __importDefault(require("../models/Message"));
const Team_1 = __importDefault(require("../models/Team"));
const getTeamMessages = async (req, res) => {
    try {
        const teamId = req.params.teamId;
        if (!teamId) {
            return res.status(400).json({ message: "Team ID is required" });
        }
        const page = Number(req.query.page) || 1;
        const limit = 50;
        const skip = (page - 1) * limit;
        const messages = await Message_1.default.find({ teamId })
            .populate("senderId", "name email")
            .sort({ timestamp: 1 })
            .skip(skip)
            .limit(limit);
        res.json(messages);
    }
    catch (err) {
        console.error("getTeamMessages error:", err);
        res.status(500).json({ message: "Failed to load messages" });
    }
};
exports.getTeamMessages = getTeamMessages;
const sendMessage = async (req, res) => {
    try {
        const { content } = req.body;
        const teamId = req.params.teamId;
        if (!teamId) {
            return res.status(400).json({ message: "Team ID is required" });
        }
        if (!content || typeof content !== "string" || content.trim() === "") {
            return res.status(400).json({ message: "Message content is required" });
        }
        // admin and manager can send to any team
        if (req.user.role !== "ADMIN" && req.user.role !== "MANAGER") {
            const team = await Team_1.default.findOne({
                _id: teamId,
                $or: [{ adminId: req.user.userId }, { memberIds: req.user.userId }],
            });
            if (!team) {
                return res.status(403).json({ message: "You do not have permission to send messages to this team" });
            }
        }
        const message = await Message_1.default.create({
            content: content.trim(),
            senderId: new mongoose_1.default.Types.ObjectId(req.user.userId),
            teamId: new mongoose_1.default.Types.ObjectId(teamId),
            timestamp: new Date(),
        });
        await message.populate("senderId", "name email");
        res.status(201).json({
            _id: message._id,
            content: message.content,
            senderId: message.senderId._id,
            senderName: message.senderId.name,
            senderEmail: message.senderId.email,
            teamId: message.teamId,
            timestamp: message.timestamp,
        });
    }
    catch (err) {
        console.error("sendMessage error:", err);
        res.status(500).json({ message: "Failed to send message" });
    }
};
exports.sendMessage = sendMessage;
