// src/models/User.ts
import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  firebaseUid: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  role: { type: String, enum: ["ADMIN", "MANAGER", "MEMBER"], default: "MEMBER" },
  teamId: { type: mongoose.Schema.Types.ObjectId, ref: "Team" },
});

export default mongoose.model("User", userSchema);