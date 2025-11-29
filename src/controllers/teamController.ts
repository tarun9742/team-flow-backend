import { Response } from "express";
import Team from "../models/Team";
import User from "../models/User";
import { AuthRequest } from "../middleware/auth";

export const createTeam = async (req: AuthRequest, res: Response) => {
  const { name, description, managerId, memberIds = [] } = req.body;
  const adminId = req.user!.userId;
 
  if (!name?.trim()) {
    return res.status(400).json({ message: "Team name is required" });
  }

  try {
    const team = await Team.create({
      name: name.trim(),
      description: description?.trim(),
      adminId,
      managerId: managerId || null, 
      memberIds: memberIds || [], 
    });

    // Populate response
    const populated = await Team.findById(team._id)
      .populate("adminId", "name email")
      .populate("managerId", "name email")
      .populate("memberIds", "name email");

    res.status(201).json(populated);
  } catch (error: any) {
    console.error("Create team error:", error);
    res.status(500).json({ message: error.message });
  }
};


export const getTeams = async (req: AuthRequest, res: Response) => {
  const userId = req.user!.userId;
  const teams = await Team.find({
    $or: [{ adminId: userId }, { memberIds: userId }],
  })
    .populate("adminId memberIds", "name email role")
    .sort({ createdAt: -1 });

  res.json(teams);
};

export const updateTeam = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const updates = req.body;
  const user = req.user!;

  const team = await Team.findById(id);
  if (!team) return res.status(404).json({ message: "Team not found" });

  if (
    team.adminId.toString() !== user.userId.toString() &&
    user.role !== "ADMIN"
  ) {
    return res.status(403).json({ message: "Not authorized" });
  }

  const updated = await Team.findByIdAndUpdate(id, updates, {
    new: true,
  }).populate("adminId memberIds", "name email role");

  res.json(updated);
};

export const deleteTeam = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const user = req.user!;

  const team = await Team.findById(id);
  if (!team) return res.status(404).json({ message: "Team not found" });

  if (
    team.adminId.toString() !== user.userId.toString() &&
    user.role !== "ADMIN"
  ) {
    return res.status(403).json({ message: "Not authorized" });
  }

  await Team.findByIdAndDelete(id);
  await User.updateMany({ teamId: id }, { teamId: null });

  res.json({ message: "Team deleted" });
};

export const getTeamById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const team = await Team.findById(id)
      .select("name description memberIds")
      .lean();

    if (!team) {
      return res.status(404).json({ message: "Team not found" });
    }
 
    const userId = req.user!.userId;
    const isInTeam = team.memberIds.some((memberId: any) => memberId.toString() === userId);
    const isAdmin = req.user!.role === "ADMIN";

    if (!isAdmin && !isInTeam) {
      return res.status(403).json({ message: "Access denied" });
    }

    res.json(team);
  } catch (err: any) {
    console.error("getTeamById error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const addMemberToTeam = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ message: "userId is required" });
  }

  try {
    const team = await Team.findById(id);
    if (!team) return res.status(404).json({ message: "Team not found" });

    if (team.adminId.toString() !== req.user!.userId.toString() && req.user!.role !== "ADMIN") {
      return res.status(403).json({ message: "Not authorized" });
    }

    if (team.memberIds.includes(userId)) {
      return res.status(400).json({ message: "User already in team" });
    }

    team.memberIds.push(userId);
    await team.save();

    const updated = await Team.findById(id)
      .populate("adminId memberIds", "name email role");

    res.json(updated);
  } catch (err: any) {
    console.error("addMemberToTeam error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const removeMemberFromTeam = async (req: AuthRequest, res: Response) => {
  const { id, userId } = req.params;

  try {
    const team = await Team.findById(id);
    if (!team) return res.status(404).json({ message: "Team not found" });

    if (team.adminId.toString() !== req.user!.userId.toString() && req.user!.role !== "ADMIN") {
      return res.status(403).json({ message: "Not authorized" });
    }

    team.memberIds = team.memberIds.filter((memberId: any) => memberId.toString() !== userId);
    await team.save();

    const updated = await Team.findById(id)
      .populate("adminId memberIds", "name email role");

    res.json(updated);
  } catch (err: any) {
    console.error("removeMemberFromTeam error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
