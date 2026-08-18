import { Router } from "express";
import {
  getGalleryItems,
  createGalleryItem,
  updateGalleryItem,
  deleteGalleryItem,
  shareGalleryItemToFeed,
  uploadGalleryMedia
} from "../controllers/gallery.controller.js";
import { verifyToken, requireRole } from "../middleware/auth.middleware.js";

const router = Router();

router.get("/", getGalleryItems);
router.post("/", verifyToken, requireRole(["SUPER_ADMIN", "ADMIN"]), uploadGalleryMedia, createGalleryItem);
router.put("/:id", verifyToken, requireRole(["SUPER_ADMIN", "ADMIN"]), uploadGalleryMedia, updateGalleryItem);
router.delete("/:id", verifyToken, requireRole(["SUPER_ADMIN", "ADMIN"]), deleteGalleryItem);
router.post("/:id/share", verifyToken, shareGalleryItemToFeed);

export default router;
