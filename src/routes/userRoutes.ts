  
import { Router } from "express";
import { protect, adminOnly } from "../middleware/auth";
import { getAllUsers, deleteUser, updateUserRole } from "../controllers/userController";

const router = Router();
 
router.use(protect);

 
router.get("/", adminOnly, getAllUsers as any);
router.delete("/:id", adminOnly, deleteUser as any);
router.patch("/:id/role", adminOnly, updateUserRole as any);  

export default router;