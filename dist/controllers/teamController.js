"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeMemberFromTeam = exports.addMemberToTeam = exports.getTeamById = exports.deleteTeam = exports.updateTeam = exports.getTeams = exports.createTeam = void 0;
const Team_1 = __importDefault(require("../models/Team"));
const User_1 = __importDefault(require("../models/User"));
const createTeam = async (req, res) => {
    const { name, description, managerId, memberIds = [] } = req.body;
    const adminId = req.user.userId;
    if (!name?.trim()) {
        return res.status(400).json({ message: "Team name is required" });
    }
    try {
        const team = await Team_1.default.create({
            name: name.trim(),
            description: description?.trim(),
            adminId,
            managerId: managerId || null,
            memberIds: memberIds || [],
        });
        // Populate response
        const populated = await Team_1.default.findById(team._id)
            .populate("adminId", "name email")
            .populate("managerId", "name email")
            .populate("memberIds", "name email");
        res.status(201).json(populated);
    }
    catch (error) {
        console.error("Create team error:", error);
        res.status(500).json({ message: error.message });
    }
};
exports.createTeam = createTeam;
const getTeams = async (req, res) => {
    const userId = req.user.userId;
    const teams = await Team_1.default.find({
        $or: [{ adminId: userId }, { memberIds: userId }],
    })
        .populate("adminId memberIds", "name email role")
        .sort({ createdAt: -1 });
    res.json(teams);
};
exports.getTeams = getTeams;
const updateTeam = async (req, res) => {
    const { id } = req.params;
    const updates = req.body;
    const user = req.user;
    const team = await Team_1.default.findById(id);
    if (!team)
        return res.status(404).json({ message: "Team not found" });
    if (team.adminId.toString() !== user.userId.toString() &&
        user.role !== "ADMIN") {
        return res.status(403).json({ message: "Not authorized" });
    }
    const updated = await Team_1.default.findByIdAndUpdate(id, updates, {
        new: true,
    }).populate("adminId memberIds", "name email role");
    res.json(updated);
};
exports.updateTeam = updateTeam;
const deleteTeam = async (req, res) => {
    const { id } = req.params;
    const user = req.user;
    const team = await Team_1.default.findById(id);
    if (!team)
        return res.status(404).json({ message: "Team not found" });
    if (team.adminId.toString() !== user.userId.toString() &&
        user.role !== "ADMIN") {
        return res.status(403).json({ message: "Not authorized" });
    }
    await Team_1.default.findByIdAndDelete(id);
    await User_1.default.updateMany({ teamId: id }, { teamId: null });
    res.json({ message: "Team deleted" });
};
exports.deleteTeam = deleteTeam;
const getTeamById = async (req, res) => {
    try {
        const { id } = req.params;
        const team = await Team_1.default.findById(id)
            .select("name description memberIds")
            .lean();
        if (!team) {
            return res.status(404).json({ message: "Team not found" });
        }
        const userId = req.user.userId;
        const isInTeam = team.memberIds.some((memberId) => memberId.toString() === userId);
        const isAdmin = req.user.role === "ADMIN";
        if (!isAdmin && !isInTeam) {
            return res.status(403).json({ message: "Access denied" });
        }
        res.json(team);
    }
    catch (err) {
        console.error("getTeamById error:", err);
        res.status(500).json({ message: "Server error" });
    }
};
exports.getTeamById = getTeamById;
const addMemberToTeam = async (req, res) => {
    const { id } = req.params;
    const { userId } = req.body;
    if (!userId) {
        return res.status(400).json({ message: "userId is required" });
    }
    try {
        const team = await Team_1.default.findById(id);
        if (!team)
            return res.status(404).json({ message: "Team not found" });
        if (team.adminId.toString() !== req.user.userId.toString() && req.user.role !== "ADMIN") {
            return res.status(403).json({ message: "Not authorized" });
        }
        if (team.memberIds.includes(userId)) {
            return res.status(400).json({ message: "User already in team" });
        }
        team.memberIds.push(userId);
        await team.save();
        const updated = await Team_1.default.findById(id)
            .populate("adminId memberIds", "name email role");
        res.json(updated);
    }
    catch (err) {
        console.error("addMemberToTeam error:", err);
        res.status(500).json({ message: "Server error" });
    }
};
exports.addMemberToTeam = addMemberToTeam;
const removeMemberFromTeam = async (req, res) => {
    const { id, userId } = req.params;
    try {
        const team = await Team_1.default.findById(id);
        if (!team)
            return res.status(404).json({ message: "Team not found" });
        if (team.adminId.toString() !== req.user.userId.toString() && req.user.role !== "ADMIN") {
            return res.status(403).json({ message: "Not authorized" });
        }
        team.memberIds = team.memberIds.filter((memberId) => memberId.toString() !== userId);
        await team.save();
        const updated = await Team_1.default.findById(id)
            .populate("adminId memberIds", "name email role");
        res.json(updated);
    }
    catch (err) {
        console.error("removeMemberFromTeam error:", err);
        res.status(500).json({ message: "Server error" });
    }
};
exports.removeMemberFromTeam = removeMemberFromTeam;
