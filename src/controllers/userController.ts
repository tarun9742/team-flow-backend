
import { Response } from "express";
import User from "../models/User";
import { AuthRequest } from "../middleware/auth";
import Team from "../models/Team";

export const getAllUsers = async (req: AuthRequest, res: Response) => {
  try {
    const users = await User.find().select("-firebaseUid -__v");
    res.json(users);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};




export const deleteUser = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.params.id;

    // Prevent deleting yourself
    if (req.user?.userId.toString() === userId) {
      return res.status(400).json({ message: "You cannot delete yourself" });
    }

    // Prevent deleting other admins
    const userToDelete = await User.findById(userId);
    if (userToDelete?.role === "ADMIN") {
      return res.status(400).json({ message: "Cannot delete admin users" });
    }

    await User.findByIdAndDelete(userId);
 
    await Team.updateMany(
      { $or: [{ managerId: userId }, { memberIds: userId }] },
      {
        $pull: { memberIds: userId },
        $unset: { managerId: "" },
      }
    );

    res.json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const updateUserRole = async (req: AuthRequest, res: Response) => {
  try {
    const { role } = req.body;
    const userId = req.params.id;

    if (!["MANAGER", "MEMBER"].includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    const updated = await User.findByIdAndUpdate(
      userId,
      { role },
      { new: true }
    );

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};