import { Router } from "express";
import { getCurrentMonthlyReport, recordDispatchLog, getReportLogs } from "../controllers/whatsappReport.controller.js";
import { verifyToken, requireRole } from "../middleware/auth.middleware.js";

const router = Router();

router.get("/current", verifyToken, requireRole(["ADMIN", "SUPER_ADMIN"]), getCurrentMonthlyReport);
router.post("/dispatch", verifyToken, requireRole(["ADMIN", "SUPER_ADMIN"]), recordDispatchLog);
router.get("/logs", verifyToken, requireRole(["ADMIN", "SUPER_ADMIN"]), getReportLogs);

export default router;
