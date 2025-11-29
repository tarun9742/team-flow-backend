"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTasks = exports.deleteTask = exports.updateTask = exports.createTask = exports.getAllTasks = exports.getTasksByProject = void 0;
const Task_1 = __importDefault(require("../models/Task"));
const Team_1 = __importDefault(require("../models/Team"));
const Project_1 = __importDefault(require("../models/Project"));
const getTasksByProject = async (req, res) => {
    try {
        const projectId = req.query.projectId;
        if (!projectId) {
            return res.status(400).json({ message: "projectId required" });
        }
        const tasks = await Task_1.default.find({ projectId })
            .populate("assignedTo", "name email role")
            .sort({ createdAt: -1 });
        return res.json(tasks);
    }
    catch (error) {
        console.error("Error fetching tasks by project:", error);
        return res.status(500).json({ message: error.message ?? "Server error" });
    }
};
exports.getTasksByProject = getTasksByProject;
const getAllTasks = async (req, res) => {
    try {
        const tasks = await Task_1.default.find()
            .populate("assignedTo", "name email role")
            .sort({ createdAt: -1 });
        res.json(tasks);
    }
    catch (err) {
        res.status(500).json({ message: err.message });
    }
};
exports.getAllTasks = getAllTasks;
const createTask = async (req, res) => {
    const { title, description, projectId, assignedTo, status } = req.body;
    try {
        const task = await Task_1.default.create({
            title,
            description,
            projectId,
            assignedTo: assignedTo || null,
            status: status || "todo",
        });
        res.status(201).json(task);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.createTask = createTask;
const updateTask = async (req, res) => {
    try {
        const task = await Task_1.default.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
        });
        if (!task)
            return res.status(404).json({ message: "Task not found" });
        res.json(task);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.updateTask = updateTask;
const deleteTask = async (req, res) => {
    try {
        const task = await Task_1.default.findByIdAndDelete(req.params.id);
        if (!task)
            return res.status(404).json({ message: "Task not found" });
        res.json({ message: "Task deleted" });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.deleteTask = deleteTask;
const getTasks = async (req, res) => {
    const authReq = req;
    const { projectId } = req.query;
    if (authReq.user.role === "ADMIN") {
        const tasks = await Task_1.default.find(projectId ? { projectId } : {}).populate("assignedTo", "name");
        return res.json(tasks);
    }
    const team = await Team_1.default.findOne({
        $or: [{ adminId: authReq.user.userId }, { memberIds: authReq.user.userId }],
    });
    if (!team)
        return res.json([]);
    const projects = await Project_1.default.find({ teamId: team._id });
    const projectIds = projects.map((p) => p._id);
    const tasks = await Task_1.default.find({
        projectId: { $in: projectIds },
        ...(projectId && { projectId }),
    }).populate("assignedTo", "name");
    res.json(tasks);
};
exports.getTasks = getTasks;
