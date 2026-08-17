import { Router } from "express";
import { 
  getDanas, 
  createDana, 
  getAdminDanas, 
  getMyDanas, 
  approveDana, 
  rejectDana, 
  deleteDana,
  updateDana,
  getDanaById,
  exportDanasCSV,
  getNoticeBoardSheet
} from "../controllers/dana.controller.js";
import { verifyToken, requireRole } from "../middleware/auth.middleware.js";

const router = Router();

// Public routes
router.get("/", getDanas);

// Protected user routes
router.post("/", verifyToken, createDana);
router.get("/me", verifyToken, getMyDanas);

// Admin / Super Admin routes
router.get("/admin/all", verifyToken, requireRole(["ADMIN", "SUPER_ADMIN"]), getAdminDanas);
router.get("/admin/export/csv", verifyToken, requireRole(["ADMIN", "SUPER_ADMIN"]), exportDanasCSV);
router.get("/admin/notice-board", verifyToken, requireRole(["ADMIN", "SUPER_ADMIN"]), getNoticeBoardSheet);
router.patch("/:id/approve", verifyToken, requireRole(["ADMIN", "SUPER_ADMIN"]), approveDana);
router.patch("/:id/reject", verifyToken, requireRole(["ADMIN", "SUPER_ADMIN"]), rejectDana);

// Single Dana route (accessible with ID)
router.get("/:id", getDanaById);
router.put("/:id", verifyToken, updateDana);

// Super Admin only routes
router.delete("/:id", verifyToken, requireRole(["SUPER_ADMIN"]), deleteDana);

export default router;

