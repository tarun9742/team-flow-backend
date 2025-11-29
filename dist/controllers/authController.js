"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMe = exports.createUserByAdmin = exports.login = void 0;
const User_1 = __importDefault(require("../models/User"));
const firebase_1 = __importStar(require("../config/firebase"));
// Login – called after Firebase login
const login = async (req, res) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token)
        return res.status(401).json({ message: "No token" });
    try {
        const decoded = await (0, firebase_1.verifyFirebaseToken)(token);
        let user = await User_1.default.findOne({ firebaseUid: decoded.uid });
        if (!user) {
            const isFirstUser = (await User_1.default.countDocuments()) === 0;
            user = await User_1.default.create({
                firebaseUid: decoded.uid,
                email: decoded.email,
                name: decoded.name || decoded.email.split("@")[0],
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
    }
    catch (err) {
        res.status(401).json({ message: "Invalid token" });
    }
};
exports.login = login;
// Admin creates Manager/Member with email + password
const createUserByAdmin = async (req, res) => {
    if (req.user?.role !== "ADMIN")
        return res.status(403).json({ message: "Only Admin can create users" });
    const { email, password, name, role } = req.body;
    if (!email || !password || !name || !role)
        return res.status(400).json({ message: "All fields required" });
    if (!["MANAGER", "MEMBER"].includes(role))
        return res.status(400).json({ message: "Role must be MANAGER or MEMBER" });
    try {
        const userRecord = await firebase_1.default.auth().createUser({
            email,
            password,
            displayName: name,
        });
        // Save to MongoDB
        const user = await User_1.default.create({
            firebaseUid: userRecord.uid,
            email,
            name,
            role,
        });
        res.status(201).json({
            message: "User created",
            user: { email: user.email, name: user.name, role: user.role },
        });
    }
    catch (err) {
        res.status(500).json({ message: err.message });
    }
};
exports.createUserByAdmin = createUserByAdmin;
const getMe = async (req, res) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json({ message: "Not authenticated" });
        }
        const user = await User_1.default.findById(userId).select("-firebaseUid -__v");
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.json(user);
    }
    catch (err) {
        res.status(500).json({ message: err.message });
    }
};
exports.getMe = getMe;
