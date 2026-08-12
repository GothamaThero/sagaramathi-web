import { Router } from "express";
import { getDashboardStats } from "../controllers/analytics.controller.js";
import { verifyToken, requireRole } from "../middleware/auth.middleware.js";

const router = Router();

router.get("/stats", verifyToken, requireRole(["ADMIN", "SUPER_ADMIN"]), getDashboardStats);

export default router;
