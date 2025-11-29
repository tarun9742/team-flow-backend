import { Router } from "express";
import { login, createUserByAdmin, getMe } from "../controllers/authController";
import { protect, adminOnly } from "../middleware/auth";

const router = Router();

router.post("/login", login);
router.post("/create-user", protect, adminOnly, createUserByAdmin);
router.get("/me", protect, getMe as any);

export default router;
