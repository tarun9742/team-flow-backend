"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sameTeamOnly = exports.managerOnly = exports.adminOnly = exports.restrictTo = exports.protect = void 0;
const User_1 = __importDefault(require("../models/User"));
const Team_1 = __importDefault(require("../models/Team"));
const firebase_1 = __importDefault(require("../config/firebase"));
// Protect all routes — verify JWT token
const protect = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ message: "Not authorized, no token" });
        }
        const token = authHeader.split(" ")[1];
        const decodedToken = await firebase_1.default.auth().verifyIdToken(token);
        const firebaseUid = decodedToken.uid;
        const user = await User_1.default.findOne({ firebaseUid }).select("-password");
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
    }
    catch (err) {
        console.error("Firebase token verification failed:", err.message);
        return res
            .status(401)
            .json({ message: "Invalid or expired Firebase token" });
    }
};
exports.protect = protect;
// Only ADMIN & MANAGER allowed
const restrictTo = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ message: "Authentication required" });
        }
        if (!roles.includes(req.user.role)) {
            return res
                .status(403)
                .json({ message: "Access denied: insufficient permissions" });
        }
        next();
    };
};
exports.restrictTo = restrictTo;
// Convenient aliases
exports.adminOnly = (0, exports.restrictTo)("ADMIN");
exports.managerOnly = (0, exports.restrictTo)("ADMIN", "MANAGER");
// Ensure user belongs to the team (for team-specific routes)
const sameTeamOnly = async (req, res, next) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: "Authentication required" });
        }
        if (req.user.role === "ADMIN" || req.user.role === "MANAGER")
            return next(); // Admin and Manager can access any team
        const teamIdFromParams = req.params.teamId || req.body.teamId;
        if (!teamIdFromParams) {
            return res.status(400).json({ message: "Team ID is required" });
        }
        const team = await Team_1.default.findOne({
            _id: teamIdFromParams,
            $or: [{ adminId: req.user.userId }, { memberIds: req.user.userId }],
        });
        if (!team) {
            return res
                .status(403)
                .json({ message: "You do not belong to this team" });
        }
        req.team = team;
        next();
    }
    catch (err) {
        console.error("sameTeamOnly error:", err);
        res.status(500).json({ message: "Server error" });
    }
};
exports.sameTeamOnly = sameTeamOnly;
