import { Router } from "express";
import { protect, adminOnly } from "../middleware/auth";
import {
  getAllProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
} from "../controllers/projectController";

const router = Router();

router.use(protect); // Login required for all

 
router.get("/", getAllProjects); 
router.get("/:id", getProjectById); 
router.post("/", adminOnly, createProject); 
router.put("/:id", adminOnly, updateProject); 
router.delete("/:id", adminOnly, deleteProject);

export default router;