import { Router } from "express";
import {
  getPublicDanaConfirmation,
  respondPublicDanaConfirmation,
  getAdminDanaConfirmations,
  getAdminAutomatedReminders,
  triggerAdminAutomatedReminders
} from "../controllers/danaConfirmation.controller.js";
import { verifyToken, requireRole } from "../middleware/auth.middleware.js";

const router = Router();

// Public Donor Confirmation Routes (Mobile Direct Link)
router.get("/public/:id", getPublicDanaConfirmation);
router.post("/public/:id/respond", respondPublicDanaConfirmation);

// Admin Routes (Requires Admin Auth Token)
router.get("/admin/all", verifyToken, requireRole(["ADMIN", "SUPER_ADMIN"]), getAdminDanaConfirmations);
router.get("/admin/reminders", verifyToken, requireRole(["ADMIN", "SUPER_ADMIN"]), getAdminAutomatedReminders);
router.post("/admin/trigger-reminders", verifyToken, requireRole(["ADMIN", "SUPER_ADMIN"]), triggerAdminAutomatedReminders);

export default router;

