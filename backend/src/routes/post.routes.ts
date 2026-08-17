import { Router } from "express";
import {
  getPosts,
  createPost,
  updatePost,
  deletePost,
  toggleLike,
  addComment,
  deleteComment,
  toggleSavePost,
  getStories,
  createStory,
  uploadMedia,
  uploadSingle
} from "../controllers/post.controller.js";
import { verifyToken, optionalToken } from "../middleware/auth.middleware.js";

const router = Router();

// Post Routes
router.get("/", optionalToken, getPosts);
router.post("/", verifyToken, uploadMedia, createPost);
router.put("/:id", verifyToken, updatePost);
router.delete("/:id", verifyToken, deletePost);

// Reactions & Comments
router.post("/:id/like", verifyToken, toggleLike);
router.post("/:id/comment", verifyToken, addComment);
router.delete("/comments/:commentId", verifyToken, deleteComment);

// Save / Bookmark
router.post("/:id/save", verifyToken, toggleSavePost);

// Stories Routes
router.get("/stories/all", getStories);
router.post("/stories", verifyToken, uploadSingle, createStory);

export default router;
