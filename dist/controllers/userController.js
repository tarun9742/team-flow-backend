"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateUserRole = exports.deleteUser = exports.getAllUsers = void 0;
const User_1 = __importDefault(require("../models/User"));
const Team_1 = __importDefault(require("../models/Team"));
const getAllUsers = async (req, res) => {
    try {
        const users = await User_1.default.find().select("-firebaseUid -__v");
        res.json(users);
    }
    catch (err) {
        res.status(500).json({ message: err.message });
    }
};
exports.getAllUsers = getAllUsers;
const deleteUser = async (req, res) => {
    try {
        const userId = req.params.id;
        // Prevent deleting yourself
        if (req.user?.userId.toString() === userId) {
            return res.status(400).json({ message: "You cannot delete yourself" });
        }
        // Prevent deleting other admins
        const userToDelete = await User_1.default.findById(userId);
        if (userToDelete?.role === "ADMIN") {
            return res.status(400).json({ message: "Cannot delete admin users" });
        }
        await User_1.default.findByIdAndDelete(userId);
        await Team_1.default.updateMany({ $or: [{ managerId: userId }, { memberIds: userId }] }, {
            $pull: { memberIds: userId },
            $unset: { managerId: "" },
        });
        res.json({ message: "User deleted successfully" });
    }
    catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};
exports.deleteUser = deleteUser;
const updateUserRole = async (req, res) => {
    try {
        const { role } = req.body;
        const userId = req.params.id;
        if (!["MANAGER", "MEMBER"].includes(role)) {
            return res.status(400).json({ message: "Invalid role" });
        }
        const updated = await User_1.default.findByIdAndUpdate(userId, { role }, { new: true });
        res.json(updated);
    }
    catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};
exports.updateUserRole = updateUserRole;
