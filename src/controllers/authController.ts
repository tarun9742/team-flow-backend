import { Response } from "express";
import User from "../models/User";
import { protect } from "../middleware/auth";
import admin, { verifyFirebaseToken } from "../config/firebase";

// Login – called after Firebase login
export const login = async (req: any, res: Response) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "No token" });

  try {
    const decoded = await verifyFirebaseToken(token);
    let user = await User.findOne({ firebaseUid: decoded.uid });

    if (!user) { 
      const isFirstUser = (await User.countDocuments()) === 0;
      user = await User.create({
        firebaseUid: decoded.uid,
        email: decoded.email,
        name: decoded.name || decoded.email!.split("@")[0],
        role: isFirstUser ? "ADMIN" : "MEMBER", // First user becomes Admin
      });
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      teamId: user.teamId,
    });
  } catch (err: any) {
    res.status(401).json({ message: "Invalid token" });
  }
};

// Admin creates Manager/Member with email + password
export const createUserByAdmin = async (req: any, res: Response) => {
  if (req.user?.role !== "ADMIN")
    return res.status(403).json({ message: "Only Admin can create users" });

  const { email, password, name, role } = req.body;
  if (!email || !password || !name || !role)
    return res.status(400).json({ message: "All fields required" });

  if (!["MANAGER", "MEMBER"].includes(role))
    return res.status(400).json({ message: "Role must be MANAGER or MEMBER" });

  try { 
    const userRecord = await admin.auth().createUser({
      email,
      password,
      displayName: name,
    });

    // Save to MongoDB
    const user = await User.create({
      firebaseUid: userRecord.uid,
      email,
      name,
      role,
    });

    res.status(201).json({
      message: "User created",
      user: { email: user.email, name: user.name, role: user.role },
    });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const getMe = async (
  req: Request & { user?: { userId: string } },
  res: Response
) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const user = await User.findById(userId).select("-firebaseUid -__v");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};
