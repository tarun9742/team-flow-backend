import { Request, Response } from "express";
import Task from "../models/Task";
import { AuthRequest } from "../middleware/auth";
import Team from "../models/Team";
import Project from "../models/Project";

export const getTasksByProject = async (req: Request, res: Response) => {
  try {
    const projectId = req.query.projectId as string | undefined;

    if (!projectId) {
      return res.status(400).json({ message: "projectId required" });
    }

    const tasks = await Task.find({ projectId })
      .populate("assignedTo", "name email role")
      .sort({ createdAt: -1 });

    return res.json(tasks);
  } catch (error: any) {
    console.error("Error fetching tasks by project:", error);
    return res.status(500).json({ message: error.message ?? "Server error" });
  }
};

export const getAllTasks = async (req: Request, res: Response) => {
  try {
    const tasks = await Task.find()
      .populate("assignedTo", "name email role")
      .sort({ createdAt: -1 });
    res.json(tasks);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const createTask = async (req: Request, res: Response) => {
  const { title, description, projectId, assignedTo, status } = req.body;
  try {
    const task = await Task.create({
      title,
      description,
      projectId,
      assignedTo: assignedTo || null,
      status: status || "todo",
    });
    res.status(201).json(task);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const updateTask = async (req: Request, res: Response) => {
  try {
    const task = await Task.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!task) return res.status(404).json({ message: "Task not found" });
    res.json(task);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteTask = async (req: AuthRequest, res: Response) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) return res.status(404).json({ message: "Task not found" });
    res.json({ message: "Task deleted" });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getTasks = async (req: Request, res: Response) => {
  const authReq = req as AuthRequest;
  const { projectId } = req.query;

  if (authReq.user.role === "ADMIN") {
    const tasks = await Task.find(projectId ? { projectId } : {}).populate(
      "assignedTo",
      "name"
    );
    return res.json(tasks);
  }
 
  const team = await Team.findOne({
    $or: [{ adminId: authReq.user.userId }, { memberIds: authReq.user.userId }],
  });

  if (!team) return res.json([]);
 
  const projects = await Project.find({ teamId: team._id });
  const projectIds = projects.map((p) => p._id);

  const tasks = await Task.find({
    projectId: { $in: projectIds },
    ...(projectId && { projectId }),
  }).populate("assignedTo", "name");

  res.json(tasks);
};
