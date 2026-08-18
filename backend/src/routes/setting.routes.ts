import { Router } from "express";
import { getSettings, updateSetting, getAuditLogs } from "../controllers/setting.controller.js";
import { verifyToken, requireRole } from "../middleware/auth.middleware.js";

const router = Router();

router.get("/", getSettings);
router.get("/audit-logs", verifyToken, requireRole(["ADMIN", "SUPER_ADMIN"]), getAuditLogs);
router.put("/", verifyToken, requireRole(["SUPER_ADMIN"]), updateSetting);

export default router;

