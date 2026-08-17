import { Router } from "express";
import {
  getFinanceSummary,
  getAllTransactions,
  recordTransaction,
  deleteTransaction,
  getGroupedReport,
  exportFinanceCSV
} from "../controllers/finance.controller.js";
import { verifyToken, requireRole } from "../middleware/auth.middleware.js";

const router = Router();

router.get("/summary", verifyToken, requireRole(["ADMIN", "SUPER_ADMIN"]), getFinanceSummary);
router.get("/transactions", verifyToken, requireRole(["ADMIN", "SUPER_ADMIN"]), getAllTransactions);
router.get("/export/csv", verifyToken, requireRole(["ADMIN", "SUPER_ADMIN"]), exportFinanceCSV);
router.post("/transactions", verifyToken, requireRole(["ADMIN", "SUPER_ADMIN"]), recordTransaction);
router.delete("/transactions/:id", verifyToken, requireRole(["ADMIN", "SUPER_ADMIN"]), deleteTransaction);
router.get("/reports", verifyToken, requireRole(["ADMIN", "SUPER_ADMIN"]), getGroupedReport);

export default router;

