// src/routes/taskRoutes.ts
import { Router } from "express";
import { protect, adminOnly } from "../middleware/auth";
import {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
} from "../controllers/taskController";

const router = Router();

router.use(protect);

router.get("/", getTasks as any);  
router.post("/", createTask as any);  

router.put("/:id", protect, updateTask as any); 
 
router.delete("/:id", adminOnly, deleteTask as any);

export default router;