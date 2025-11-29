"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeSocket = void 0;
const firebase_1 = require("../config/firebase");
const Message_1 = __importDefault(require("../models/Message"));
const User_1 = __importDefault(require("../models/User"));
const Team_1 = __importDefault(require("../models/Team"));
const initializeSocket = (io) => {
    io.use(async (socket, next) => {
        const token = socket.handshake.auth.token || socket.handshake.headers["authorization"]?.split(" ")?.[1];
        if (!token) {
            return next(new Error("Authentication required"));
        }
        try {
            const decoded = await (0, firebase_1.verifyFirebaseToken)(token);
            const userRecord = await User_1.default.findOne({ email: decoded.email });
            if (!userRecord) {
                return next(new Error("User not found in database"));
            }
            socket.user = {
                uid: decoded.uid,
                email: decoded.email,
                name: userRecord.name,
                teamId: userRecord.teamId?.toString() || null,
            };
            next();
        }
        catch (err) {
            return next(new Error("Invalid token"));
        }
    });
    io.on("connection", async (socket) => {
        const user = socket.user;
        console.log(`User connected: ${user.name} (${user.email})`);
        if (user.teamId) {
            socket.join(user.teamId);
            console.log(`${user.name} joined team room: ${user.teamId}`);
        }
        socket.on("sendMessage", async (data) => {
            if (!data.teamId) {
                return socket.emit("error", "Team ID is required");
            }
            //  admin and manager can send to any team
            const userRecord = await User_1.default.findOne({ email: user.email });
            if (!userRecord) {
                return socket.emit("error", "User not found");
            }
            if (userRecord.role !== "ADMIN" && userRecord.role !== "MANAGER") {
                const team = await Team_1.default.findOne({
                    _id: data.teamId,
                    $or: [{ adminId: userRecord._id }, { memberIds: userRecord._id }],
                });
                if (!team) {
                    return socket.emit("error", "You do not have permission to send messages to this team");
                }
            }
            const message = await Message_1.default.create({
                content: data.content,
                senderId: userRecord._id,
                teamId: data.teamId,
                timestamp: new Date(),
            });
            await message.populate("senderId", "name email");
            socket.join(data.teamId);
            io.to(data.teamId).emit("newMessage", {
                _id: message._id,
                content: message.content,
                senderId: message.senderId._id,
                senderName: message.senderId.name,
                senderEmail: message.senderId.email,
                teamId: message.teamId,
                timestamp: message.timestamp,
            });
        });
        socket.on("disconnect", () => {
            console.log(`${user.name} disconnected`);
        });
    });
};
exports.initializeSocket = initializeSocket;
