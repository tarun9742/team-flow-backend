import mongoose from "mongoose";
 
const teamSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  adminId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  managerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null }, // ← NOT required
  memberIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "User", default: [] }],
}, { timestamps: true });

export default mongoose.model("Team", teamSchema);