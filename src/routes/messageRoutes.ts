
import express from "express";
import { getTeamMessages, sendMessage } from "../controllers/messageController";
import { protect, sameTeamOnly } from "../middleware/auth"; // your existing middleware

const router = express.Router();

router.get("/team/:teamId", protect, sameTeamOnly, getTeamMessages as any);
router.post("/team/:teamId/message", protect, sameTeamOnly, sendMessage as any);

export default router;
 