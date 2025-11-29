import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import User from "../models/User";
import Team from "../models/Team";
import admin from "../config/firebase";

export interface AuthRequest extends Request {
  user: {
    userId: string;
    role: "ADMIN" | "MANAGER" | "MEMBER";
    teamId?: string;
  };
}

declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        role: "ADMIN" | "MANAGER" | "MEMBER";
        teamId?: string;
        firebaseUid?: string;
      };
    }
  }
}

// Protect all routes — verify JWT token
export const protect = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Not authorized, no token" });
    }

    const token = authHeader.split(" ")[1];
 
    const decodedToken = await admin.auth().verifyIdToken(token);
 
    const firebaseUid = decodedToken.uid;
 
    const user = await User.findOne({ firebaseUid }).select("-password");

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }
 
    req.user = {
      userId: user._id.toString(),
      role: user.role,
      teamId: user.teamId?.toString(),
      firebaseUid,
    };

    next();
  } catch (err: any) {
    console.error("Firebase token verification failed:", err.message);
    return res
      .status(401)
      .json({ message: "Invalid or expired Firebase token" });
  }
};

// Only ADMIN & MANAGER allowed
export const restrictTo = (...roles: ("ADMIN" | "MANAGER")[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    if (!roles.includes(req.user.role as "ADMIN" | "MANAGER")) {
      return res
        .status(403)
        .json({ message: "Access denied: insufficient permissions" });
    }

    next();
  };
};

// Convenient aliases
export const adminOnly = restrictTo("ADMIN");
export const managerOnly = restrictTo("ADMIN", "MANAGER");

// Ensure user belongs to the team (for team-specific routes)
export const sameTeamOnly = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    if (req.user.role === "ADMIN" || req.user.role === "MANAGER") return next(); // Admin and Manager can access any team

    const teamIdFromParams = req.params.teamId || req.body.teamId;

    if (!teamIdFromParams) {
      return res.status(400).json({ message: "Team ID is required" });
    }
 
    const team = await Team.findOne({
      _id: teamIdFromParams,
      $or: [{ adminId: req.user.userId }, { memberIds: req.user.userId }],
    });

    if (!team) {
      return res
        .status(403)
        .json({ message: "You do not belong to this team" });
    }
 
    (req as any).team = team;

    next();
  } catch (err) {
    console.error("sameTeamOnly error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
