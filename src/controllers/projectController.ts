import { Response, Request } from "express";
import Project from "../models/Project";
import { AuthRequest } from "../middleware/auth";
import Task from "../models/Task";
import Team from "../models/Team";

export const getTeamProjects = async (req: Request, res: Response) => {
  const { teamId } = req.query;
  if (!teamId) return res.status(400).json({ message: "teamId required" });

  try {
    const projects = await Project.find({ teamId }).sort({ createdAt: -1 });
    res.json(projects);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const createProject = async (req: Request, res: Response) => {
  const { name, description, teamId } = req.body;

  if (!name || !teamId) {
    return res.status(400).json({ message: "Name and teamId required" });
  }

  try {
    const project = await Project.create({
      name,
      description,
      teamId,
    });

    res.status(201).json(project);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const updateProject = async (req: Request, res: Response) => {
  const { id } = req.params;
  const updates = req.body;

  try {
    const project = await Project.findByIdAndUpdate(id, updates, { new: true });
    if (!project) return res.status(404).json({ message: "Project not found" });
    res.json(project);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const deleteProject = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const project = await Project.findByIdAndDelete(id);
    if (!project) return res.status(404).json({ message: "Project not found" });
    await Task.deleteMany({ projectId: id });
    res.json({ message: "Project and tasks deleted" });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};
 

export const getAllProjects = async (req: Request, res: Response) => {
  try {
    const authReq = req as AuthRequest;
    if (authReq.user.role === "ADMIN") {
      const projects = await Project.find().populate("teamId", "name");
      return res.json(projects);
    }
 
    const team = await Team.findOne({
      $or: [{ adminId: authReq.user.userId }, { memberIds: authReq.user.userId }],
    });

    if (!team) return res.json([]);

    const projects = await Project.find({ teamId: team._id });
    res.json(projects);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

export const getProjectById = async (req: Request, res: Response) => {
  try {
    const authReq = req as AuthRequest;
    const project = await Project.findById(req.params.id)
      .populate("teamId", "name memberIds")
      .lean();

    if (!project) return res.status(404).json({ message: "Not found" });

    const user = authReq.user!;
    const teamMemberIds = (project.teamId as any)?.memberIds || [];
    const isInTeam = teamMemberIds.some((id: string) => id === user.userId);

    if (user.role !== "ADMIN" && !isInTeam) {
      return res.status(403).json({ message: "Access denied" });
    }

    res.json({
      ...project,
      teamId: (project.teamId as any)?._id?.toString(),
      teamName: (project.teamId as any)?.name,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};
