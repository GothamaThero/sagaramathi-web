import { Router } from "express";
import {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
} from "../controllers/user.controller.js";
import { verifyToken, requireRole } from "../middleware/auth.middleware.js";

const router = Router();

router.get("/", verifyToken, requireRole(["ADMIN", "SUPER_ADMIN"]), getUsers);
router.get("/:id", verifyToken, requireRole(["ADMIN", "SUPER_ADMIN"]), getUserById);
router.post("/", verifyToken, requireRole(["ADMIN", "SUPER_ADMIN"]), createUser);
router.put("/:id", verifyToken, requireRole(["ADMIN", "SUPER_ADMIN"]), updateUser);
router.delete("/:id", verifyToken, requireRole(["ADMIN", "SUPER_ADMIN"]), deleteUser);

export default router;
