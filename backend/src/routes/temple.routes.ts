import { Router } from "express";
import {
  getTempleData,
  updateTempleInfo,
  createMonk,
  updateMonk,
  deleteMonk,
  uploadMonkPhoto,
  getBranches,
  createBranch,
  updateBranch,
  deleteBranch,
  uploadBranchPhoto
} from "../controllers/temple.controller.js";
import { verifyToken, requireRole } from "../middleware/auth.middleware.js";

const router = Router();

router.get("/", getTempleData);
router.put("/info", verifyToken, requireRole(["SUPER_ADMIN", "ADMIN"]), updateTempleInfo);

// Temple Branches
router.get("/branches", getBranches);
router.post("/branches", verifyToken, requireRole(["SUPER_ADMIN", "ADMIN"]), uploadBranchPhoto, createBranch);
router.put("/branches/:id", verifyToken, requireRole(["SUPER_ADMIN", "ADMIN"]), uploadBranchPhoto, updateBranch);
router.delete("/branches/:id", verifyToken, requireRole(["SUPER_ADMIN", "ADMIN"]), deleteBranch);

// Resident Monks
router.post("/monks", verifyToken, requireRole(["SUPER_ADMIN", "ADMIN"]), uploadMonkPhoto, createMonk);
router.put("/monks/:id", verifyToken, requireRole(["SUPER_ADMIN", "ADMIN"]), uploadMonkPhoto, updateMonk);
router.delete("/monks/:id", verifyToken, requireRole(["SUPER_ADMIN", "ADMIN"]), deleteMonk);

export default router;
