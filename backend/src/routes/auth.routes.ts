import { Router } from "express";
import { register, login, getMe, updateProfile, adminResetPassword, getUserPublicProfile } from "../controllers/auth.controller.js";
import { verifyToken, requireRole } from "../middleware/auth.middleware.js";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", verifyToken, getMe);
router.get("/user/:id", getUserPublicProfile);
router.put("/profile", verifyToken, updateProfile);
router.put("/admin/reset-password", verifyToken, requireRole(["ADMIN", "SUPER_ADMIN"]), adminResetPassword);

export default router;
