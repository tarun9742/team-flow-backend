import { Response } from "express";
import mongoose from "mongoose";
import Message from "../models/Message";
import Team from "../models/Team";
import { AuthRequest } from "../middleware/auth";  

export const getTeamMessages = async (req: AuthRequest, res: Response) => {
  try {
    const teamId = req.params.teamId;

    if (!teamId) {
      return res.status(400).json({ message: "Team ID is required" });
    }

    const page = Number(req.query.page) || 1;
    const limit = 50; 
    const skip = (page - 1) * limit;

    const messages = await Message.find({ teamId })
      .populate("senderId", "name email")
      .sort({ timestamp: 1 }) 
      .skip(skip)
      .limit(limit);

    res.json(messages);
  } catch (err: any) {
    console.error("getTeamMessages error:", err);
    res.status(500).json({ message: "Failed to load messages" });
  }
};

export const sendMessage = async (req: AuthRequest, res: Response) => {
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
      const team = await Team.findOne({
        _id: teamId,
        $or: [{ adminId: req.user.userId }, { memberIds: req.user.userId }],
      });
      if (!team) {
        return res.status(403).json({ message: "You do not have permission to send messages to this team" });
      }
    }

    const message = await Message.create({
      content: content.trim(),
      senderId: new mongoose.Types.ObjectId(req.user.userId),
      teamId: new mongoose.Types.ObjectId(teamId),
      timestamp: new Date(),
    });

    await message.populate("senderId", "name email");

    res.status(201).json({
      _id: message._id,
      content: message.content,
      senderId: message.senderId._id,
      senderName: (message.senderId as any).name,
      senderEmail: (message.senderId as any).email,
      teamId: message.teamId,
      timestamp: message.timestamp,
    });
  } catch (err: any) {
    console.error("sendMessage error:", err);
    res.status(500).json({ message: "Failed to send message" });
  }
};
