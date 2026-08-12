import { Router } from "express";
import { 
  getDanas, 
  createDana, 
  getAdminDanas, 
  getMyDanas, 
  approveDana, 
  rejectDana, 
  deleteDana,
  updateDana
} from "../controllers/dana.controller.js";
import { verifyToken, requireRole } from "../middleware/auth.middleware.js";

const router = Router();

// Public route: only returns APPROVED danas
router.get("/", getDanas);

// Protected routes
router.post("/", verifyToken, createDana);
router.get("/me", verifyToken, getMyDanas);
router.put("/:id", verifyToken, updateDana);

// Admin / Super Admin routes
router.get("/admin/all", verifyToken, requireRole(["ADMIN", "SUPER_ADMIN"]), getAdminDanas);
router.patch("/:id/approve", verifyToken, requireRole(["ADMIN", "SUPER_ADMIN"]), approveDana);
router.patch("/:id/reject", verifyToken, requireRole(["ADMIN", "SUPER_ADMIN"]), rejectDana);

// Super Admin only routes
router.delete("/:id", verifyToken, requireRole(["SUPER_ADMIN"]), deleteDana);

export default router;
