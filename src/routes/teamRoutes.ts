import { Router } from "express";
import { protect, adminOnly, managerOnly } from "../middleware/auth";
import {
  createTeam,
  getTeams,
  getTeamById,
  updateTeam,
  deleteTeam,
  addMemberToTeam,
  removeMemberFromTeam,
} from "../controllers/teamController";

const router = Router();

router.use(protect);  
 
router.get("/", getTeams as any);
router.get("/:id", getTeamById as any);
 
router.post("/", managerOnly, createTeam as any);
 
router.put("/:id", updateTeam as any);
router.delete("/:id", deleteTeam as any);
 
router.post("/:id/members", addMemberToTeam as any);
router.delete("/:id/members/:userId", removeMemberFromTeam as any);

export default router;
