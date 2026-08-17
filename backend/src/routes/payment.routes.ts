import { Router } from "express";
import { 
  createPayment, 
  upload, 
  togglePunyanumodana, 
  approvePayment, 
  rejectPayment,
  updatePayment,
  deletePayment,
  exportPaymentsCSV,
  getPaymentReceiptData
} from "../controllers/payment.controller.js";
import { verifyToken, requireRole } from "../middleware/auth.middleware.js";

const router = Router();

// Submit payment (Protected: any user can submit)
router.post("/", verifyToken, upload.single("receipt"), createPayment);

// Admin / Super Admin routes
router.get("/admin/export/csv", verifyToken, requireRole(["ADMIN", "SUPER_ADMIN"]), exportPaymentsCSV);
router.get("/:id/receipt", verifyToken, getPaymentReceiptData);
router.patch("/:id/punyanumodana", verifyToken, requireRole(["ADMIN", "SUPER_ADMIN"]), togglePunyanumodana);
router.patch("/:id/approve", verifyToken, requireRole(["ADMIN", "SUPER_ADMIN"]), approvePayment);
router.patch("/:id/reject", verifyToken, requireRole(["ADMIN", "SUPER_ADMIN"]), rejectPayment);

// Full CRUD for Admin / Super Admin
router.put("/:id", verifyToken, requireRole(["ADMIN", "SUPER_ADMIN"]), upload.single("receipt"), updatePayment);
router.delete("/:id", verifyToken, requireRole(["ADMIN", "SUPER_ADMIN"]), deletePayment);

export default router;

