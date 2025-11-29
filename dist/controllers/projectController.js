"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProjectById = exports.getAllProjects = exports.deleteProject = exports.updateProject = exports.createProject = exports.getTeamProjects = void 0;
const Project_1 = __importDefault(require("../models/Project"));
const Task_1 = __importDefault(require("../models/Task"));
const Team_1 = __importDefault(require("../models/Team"));
const getTeamProjects = async (req, res) => {
    const { teamId } = req.query;
    if (!teamId)
        return res.status(400).json({ message: "teamId required" });
    try {
        const projects = await Project_1.default.find({ teamId }).sort({ createdAt: -1 });
        res.json(projects);
    }
    catch (err) {
        res.status(500).json({ message: err.message });
    }
};
exports.getTeamProjects = getTeamProjects;
const createProject = async (req, res) => {
    const { name, description, teamId } = req.body;
    if (!name || !teamId) {
        return res.status(400).json({ message: "Name and teamId required" });
    }
    try {
        const project = await Project_1.default.create({
            name,
            description,
            teamId,
        });
        res.status(201).json(project);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.createProject = createProject;
const updateProject = async (req, res) => {
    const { id } = req.params;
    const updates = req.body;
    try {
        const project = await Project_1.default.findByIdAndUpdate(id, updates, { new: true });
        if (!project)
            return res.status(404).json({ message: "Project not found" });
        res.json(project);
    }
    catch (err) {
        res.status(500).json({ message: err.message });
    }
};
exports.updateProject = updateProject;
const deleteProject = async (req, res) => {
    const { id } = req.params;
    try {
        const project = await Project_1.default.findByIdAndDelete(id);
        if (!project)
            return res.status(404).json({ message: "Project not found" });
        await Task_1.default.deleteMany({ projectId: id });
        res.json({ message: "Project and tasks deleted" });
    }
    catch (err) {
        res.status(500).json({ message: err.message });
    }
};
exports.deleteProject = deleteProject;
const getAllProjects = async (req, res) => {
    try {
        const authReq = req;
        if (authReq.user.role === "ADMIN") {
            const projects = await Project_1.default.find().populate("teamId", "name");
            return res.json(projects);
        }
        const team = await Team_1.default.findOne({
            $or: [{ adminId: authReq.user.userId }, { memberIds: authReq.user.userId }],
        });
        if (!team)
            return res.json([]);
        const projects = await Project_1.default.find({ teamId: team._id });
        res.json(projects);
    }
    catch (err) {
        res.status(500).json({ message: "Server error" });
    }
};
exports.getAllProjects = getAllProjects;
const getProjectById = async (req, res) => {
    try {
        const authReq = req;
        const project = await Project_1.default.findById(req.params.id)
            .populate("teamId", "name memberIds")
            .lean();
        if (!project)
            return res.status(404).json({ message: "Not found" });
        const user = authReq.user;
        const teamMemberIds = project.teamId?.memberIds || [];
        const isInTeam = teamMemberIds.some((id) => id === user.userId);
        if (user.role !== "ADMIN" && !isInTeam) {
            return res.status(403).json({ message: "Access denied" });
        }
        res.json({
            ...project,
            teamId: project.teamId?._id?.toString(),
            teamName: project.teamId?.name,
        });
    }
    catch (err) {
        res.status(500).json({ message: "Server error" });
    }
};
exports.getProjectById = getProjectById;
