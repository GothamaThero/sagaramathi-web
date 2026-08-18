import { Request, Response } from "express";
import prisma from "../config/db.js";
import multer from "multer";
import path from "path";
import fs from "fs";

const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, "gallery-" + uniqueSuffix + path.extname(file.originalname));
  },
});

const parseParamId = (param: any): number => {
  const str = Array.isArray(param) ? param[0] : param;
  return parseInt(str || "0", 10);
};

export const uploadGalleryMedia = multer({ storage }).single("photo");

// GET /api/gallery - Fetch gallery items
export const getGalleryItems = async (req: Request, res: Response): Promise<void> => {
  try {
    const type = req.query.type as string; // PHOTO or VIDEO
    const album = req.query.album as string;

    const where: any = {};
    if (type && (type === "PHOTO" || type === "VIDEO")) {
      where.type = type;
    }
    if (album) {
      where.album = album;
    }

    const items = await prisma.galleryItem.findMany({
      where,
      orderBy: { createdAt: "desc" }
    });

    res.status(200).json({ status: "success", data: items });
  } catch (error) {
    console.error("Error fetching gallery items:", error);
    res.status(500).json({ status: "error", message: "Failed to fetch gallery items" });
  }
};

// POST /api/gallery - Create gallery item (Super Admin / Admin)
export const createGalleryItem = async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, type, videoUrl, description, album } = req.body;
    const file = req.file;

    const itemType = type === "VIDEO" ? "VIDEO" : "PHOTO";
    let mediaUrl = "";

    if (itemType === "PHOTO") {
      if (file) {
        mediaUrl = `/uploads/${file.filename}`;
      } else if (req.body.url) {
        mediaUrl = req.body.url;
      } else {
        res.status(400).json({ status: "error", message: "Photo file or photo URL is required" });
        return;
      }
    } else {
      // VIDEO
      if (file) {
        mediaUrl = `/uploads/${file.filename}`;
      } else if (videoUrl || req.body.url) {
        mediaUrl = videoUrl || req.body.url;
      } else {
        res.status(400).json({ status: "error", message: "Video file upload or YouTube/video link is required" });
        return;
      }
    }

    const item = await prisma.galleryItem.create({
      data: {
        title: title || "",
        type: itemType,
        url: mediaUrl,
        description: description || "",
        album: album || "GENERAL"
      }
    });

    res.status(201).json({ status: "success", data: item, message: "Gallery item created successfully" });
  } catch (error) {
    console.error("Error creating gallery item:", error);
    res.status(500).json({ status: "error", message: "Failed to create gallery item" });
  }
};

// PUT /api/gallery/:id - Update gallery item (Super Admin / Admin)
export const updateGalleryItem = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseParamId(req.params.id);
    if (isNaN(id) || id === 0) {
      res.status(400).json({ status: "error", message: "Invalid ID" });
      return;
    }

    const existing = await prisma.galleryItem.findUnique({ where: { id } });
    if (!existing) {
      res.status(404).json({ status: "error", message: "Gallery item not found" });
      return;
    }

    const { title, type, url, videoUrl, description, album } = req.body;
    const file = req.file;

    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (type !== undefined) updateData.type = type;
    if (description !== undefined) updateData.description = description;
    if (album !== undefined) updateData.album = album;

    if (file) {
      updateData.url = `/uploads/${file.filename}`;
    } else if (videoUrl || url) {
      updateData.url = videoUrl || url;
    }

    const updated = await prisma.galleryItem.update({
      where: { id },
      data: updateData
    });

    res.status(200).json({ status: "success", data: updated, message: "Gallery item updated" });
  } catch (error) {
    console.error("Error updating gallery item:", error);
    res.status(500).json({ status: "error", message: "Failed to update gallery item" });
  }
};

// DELETE /api/gallery/:id - Delete gallery item (Super Admin / Admin)
export const deleteGalleryItem = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseParamId(req.params.id);
    if (isNaN(id) || id === 0) {
      res.status(400).json({ status: "error", message: "Invalid ID" });
      return;
    }

    const existing = await prisma.galleryItem.findUnique({ where: { id } });
    if (!existing) {
      res.status(404).json({ status: "error", message: "Gallery item not found" });
      return;
    }

    await prisma.galleryItem.delete({ where: { id } });
    res.status(200).json({ status: "success", message: "Gallery item deleted" });
  } catch (error) {
    console.error("Error deleting gallery item:", error);
    res.status(500).json({ status: "error", message: "Failed to delete gallery item" });
  }
};

// POST /api/gallery/:id/share - Share gallery item to main newsfeed (Logged in Users / Admin)
export const shareGalleryItemToFeed = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = (req as any).user;
    if (!user) {
      res.status(401).json({ status: "error", message: "Unauthorized - Please login first" });
      return;
    }

    const id = parseParamId(req.params.id);
    if (isNaN(id) || id === 0) {
      res.status(400).json({ status: "error", message: "Invalid ID" });
      return;
    }

    const galleryItem = await prisma.galleryItem.findUnique({ where: { id } });
    if (!galleryItem) {
      res.status(404).json({ status: "error", message: "Gallery item not found" });
      return;
    }

    const postContent = `${galleryItem.title ? galleryItem.title + "\n\n" : ""}${galleryItem.description || ""}\n${galleryItem.type === "VIDEO" ? galleryItem.url : ""}`.trim();

    const mediaUrls = galleryItem.type === "PHOTO" ? [galleryItem.url] : [];

    const newPost = await prisma.post.create({
      data: {
        content: postContent || "Shared from Gallery",
        mediaUrls: JSON.stringify(mediaUrls),
        userId: user.userId || user.id,
        authorName: user.name || "Member",
        authorAvatar: user.avatar || ""
      }
    });

    res.status(201).json({ status: "success", data: newPost, message: "Gallery item shared to newsfeed!" });
  } catch (error) {
    console.error("Error sharing gallery item to feed:", error);
    res.status(500).json({ status: "error", message: "Failed to share item to feed" });
  }
};
