import { Request, Response } from "express";
import prisma from "../config/db.js";
import multer from "multer";
import path from "path";
import fs from "fs";

// Ensure uploads directory exists
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
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

export const uploadMedia = multer({ storage: storage }).array("photos", 4);
export const uploadSingle = multer({ storage: storage }).single("photo");

const parseParamId = (param: any): number => {
  const str = Array.isArray(param) ? param[0] : param;
  return parseInt(str || "0", 10);
};

const extractUserId = (userObj: any): number | null => {
  if (!userObj) return null;
  const id = userObj.userId || userObj.id;
  const num = parseInt(id, 10);
  return isNaN(num) ? null : num;
};

// GET /api/posts - Fetch all posts with likes & comments
export const getPosts = async (req: Request, res: Response): Promise<void> => {
  try {
    const currentUserId = extractUserId((req as any).user);

    const posts = await prisma.post.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        likes: true,
        comments: {
          orderBy: { createdAt: "asc" }
        },
        savedBy: currentUserId ? { where: { userId: currentUserId } } : false
      }
    });

    const formattedPosts = posts.map(post => {
      const userReaction = currentUserId
        ? post.likes.find(l => l.userId === currentUserId)?.reactionType || null
        : null;

      const mediaUrlsList = post.mediaUrls ? JSON.parse(post.mediaUrls) : [];

      return {
        id: post.id,
        content: post.content,
        mediaUrls: mediaUrlsList,
        authorName: post.authorName,
        authorAvatar: post.authorAvatar,
        userId: post.userId,
        createdAt: post.createdAt,
        updatedAt: post.updatedAt,
        likesCount: post.likes.length,
        likeBreakdown: {
          like: post.likes.filter(l => l.reactionType === "LIKE").length,
          sadhu: post.likes.filter(l => l.reactionType === "SADHU").length,
          love: post.likes.filter(l => l.reactionType === "LOVE").length
        },
        userReaction,
        commentsCount: post.comments.length,
        comments: post.comments.map(c => ({
          id: c.id,
          postId: c.postId,
          userId: c.userId,
          userName: c.userName,
          content: c.content,
          createdAt: c.createdAt
        })),
        isSaved: currentUserId && post.savedBy ? post.savedBy.length > 0 : false
      };
    });

    res.status(200).json({ status: "success", data: formattedPosts });
  } catch (error) {
    console.error("Error fetching posts:", error);
    res.status(500).json({ status: "error", message: "Failed to fetch posts" });
  }
};

// POST /api/posts - Create post with text & images
export const createPost = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = (req as any).user;
    const userId = extractUserId(user);

    if (!userId) {
      res.status(401).json({ status: "error", message: "Unauthorized - Please login again" });
      return;
    }

    const { content } = req.body;
    const files = req.files as Express.Multer.File[];
    const mediaUrls = files && files.length > 0
      ? files.map(f => `/uploads/${f.filename}`)
      : [];

    if (!content && mediaUrls.length === 0) {
      res.status(400).json({ status: "error", message: "Post content or photo is required" });
      return;
    }

    // Get author name from DB if missing in token
    let authorName = user.name;
    if (!authorName) {
      const dbUser = await prisma.user.findUnique({ where: { id: userId } });
      authorName = dbUser?.name || "Member";
    }

    const newPost = await prisma.post.create({
      data: {
        content: content || "",
        mediaUrls: JSON.stringify(mediaUrls),
        userId: userId,
        authorName: authorName,
        authorAvatar: user.avatar || ""
      }
    });

    res.status(201).json({ status: "success", data: newPost });
  } catch (error) {
    console.error("Error creating post:", error);
    res.status(500).json({ status: "error", message: "Failed to create post" });
  }
};

// PUT /api/posts/:id - Update post (Owner or Admin)
export const updatePost = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = (req as any).user;
    const userId = extractUserId(user);
    if (!userId) {
      res.status(401).json({ status: "error", message: "Unauthorized" });
      return;
    }

    const postId = parseParamId(req.params.id);
    const { content } = req.body;

    const existingPost = await prisma.post.findUnique({ where: { id: postId } });
    if (!existingPost) {
      res.status(404).json({ status: "error", message: "Post not found" });
      return;
    }

    const isOwner = existingPost.userId === userId;
    const isAdmin = user.role === "ADMIN" || user.role === "SUPER_ADMIN";

    if (!isOwner && !isAdmin) {
      res.status(403).json({ status: "error", message: "You are not authorized to edit this post" });
      return;
    }

    const updatedPost = await prisma.post.update({
      where: { id: postId },
      data: { content }
    });

    res.status(200).json({ status: "success", data: updatedPost });
  } catch (error) {
    console.error("Error updating post:", error);
    res.status(500).json({ status: "error", message: "Failed to update post" });
  }
};

// DELETE /api/posts/:id - Delete post (Owner or Admin)
export const deletePost = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = (req as any).user;
    const userId = extractUserId(user);
    if (!userId) {
      res.status(401).json({ status: "error", message: "Unauthorized" });
      return;
    }

    const postId = parseParamId(req.params.id);

    const existingPost = await prisma.post.findUnique({ where: { id: postId } });
    if (!existingPost) {
      res.status(404).json({ status: "error", message: "Post not found" });
      return;
    }

    const isOwner = existingPost.userId === userId;
    const isAdmin = user.role === "ADMIN" || user.role === "SUPER_ADMIN";

    if (!isOwner && !isAdmin) {
      res.status(403).json({ status: "error", message: "You are not authorized to delete this post" });
      return;
    }

    await prisma.post.delete({ where: { id: postId } });
    res.status(200).json({ status: "success", message: "Post deleted successfully" });
  } catch (error) {
    console.error("Error deleting post:", error);
    res.status(500).json({ status: "error", message: "Failed to delete post" });
  }
};

// POST /api/posts/:id/like - Toggle reaction (LIKE, SADHU, LOVE)
export const toggleLike = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = (req as any).user;
    const userId = extractUserId(user);
    if (!userId) {
      res.status(401).json({ status: "error", message: "Unauthorized" });
      return;
    }

    const postId = parseParamId(req.params.id);
    const { reactionType } = req.body; // "LIKE", "SADHU", "LOVE"
    const targetReaction = reactionType || "LIKE";

    const existingLike = await prisma.postLike.findUnique({
      where: { postId_userId: { postId, userId } }
    });

    if (existingLike) {
      if (existingLike.reactionType === targetReaction) {
        // Toggle OFF (Unlike)
        await prisma.postLike.delete({ where: { id: existingLike.id } });
      } else {
        // Update reaction type
        await prisma.postLike.update({
          where: { id: existingLike.id },
          data: { reactionType: targetReaction }
        });
      }
    } else {
      // Add new reaction
      await prisma.postLike.create({
        data: {
          postId,
          userId,
          reactionType: targetReaction
        }
      });
    }

    res.status(200).json({ status: "success", message: "Reaction updated" });
  } catch (error) {
    console.error("Error toggling reaction:", error);
    res.status(500).json({ status: "error", message: "Failed to react" });
  }
};

// POST /api/posts/:id/comment - Add comment
export const addComment = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = (req as any).user;
    const userId = extractUserId(user);
    if (!userId) {
      res.status(401).json({ status: "error", message: "Unauthorized" });
      return;
    }

    const postId = parseParamId(req.params.id);
    const { content } = req.body;

    if (!content || !content.trim()) {
      res.status(400).json({ status: "error", message: "Comment content is required" });
      return;
    }

    let userName = user.name;
    if (!userName) {
      const dbUser = await prisma.user.findUnique({ where: { id: userId } });
      userName = dbUser?.name || "Member";
    }

    const comment = await prisma.postComment.create({
      data: {
        postId,
        userId: userId,
        userName: userName,
        content: content.trim()
      }
    });

    res.status(201).json({ status: "success", data: comment });
  } catch (error) {
    console.error("Error adding comment:", error);
    res.status(500).json({ status: "error", message: "Failed to add comment" });
  }
};

// DELETE /api/posts/comments/:commentId - Delete comment (Owner or Admin)
export const deleteComment = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = (req as any).user;
    const userId = extractUserId(user);
    if (!userId) {
      res.status(401).json({ status: "error", message: "Unauthorized" });
      return;
    }

    const commentId = parseParamId(req.params.commentId);

    const existing = await prisma.postComment.findUnique({ where: { id: commentId } });
    if (!existing) {
      res.status(404).json({ status: "error", message: "Comment not found" });
      return;
    }

    const isOwner = existing.userId === userId;
    const isAdmin = user.role === "ADMIN" || user.role === "SUPER_ADMIN";

    if (!isOwner && !isAdmin) {
      res.status(403).json({ status: "error", message: "Unauthorized to delete comment" });
      return;
    }

    await prisma.postComment.delete({ where: { id: commentId } });
    res.status(200).json({ status: "success", message: "Comment deleted" });
  } catch (error) {
    console.error("Error deleting comment:", error);
    res.status(500).json({ status: "error", message: "Failed to delete comment" });
  }
};

// POST /api/posts/:id/save - Toggle Save/Bookmark post
export const toggleSavePost = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = (req as any).user;
    const userId = extractUserId(user);
    if (!userId) {
      res.status(401).json({ status: "error", message: "Unauthorized" });
      return;
    }

    const postId = parseParamId(req.params.id);

    const existing = await prisma.savedPost.findUnique({
      where: { userId_postId: { userId, postId } }
    });

    if (existing) {
      await prisma.savedPost.delete({ where: { id: existing.id } });
      res.status(200).json({ status: "success", isSaved: false, message: "Post unsaved" });
    } else {
      await prisma.savedPost.create({ data: { userId, postId } });
      res.status(200).json({ status: "success", isSaved: true, message: "Post saved" });
    }
  } catch (error) {
    console.error("Error saving post:", error);
    res.status(500).json({ status: "error", message: "Failed to save post" });
  }
};

// GET /api/stories - Get active stories
export const getStories = async (req: Request, res: Response): Promise<void> => {
  try {
    const stories = await prisma.story.findMany({
      orderBy: { createdAt: "desc" },
      take: 10
    });
    res.status(200).json({ status: "success", data: stories });
  } catch (error) {
    console.error("Error fetching stories:", error);
    res.status(500).json({ status: "error", message: "Failed to fetch stories" });
  }
};

// POST /api/stories - Create new story
export const createStory = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = (req as any).user;
    const userId = extractUserId(user);
    const file = req.file;
    const { title } = req.body;

    if (!file) {
      res.status(400).json({ status: "error", message: "Story photo is required" });
      return;
    }

    let authorName = user?.name;
    if (!authorName && userId) {
      const dbUser = await prisma.user.findUnique({ where: { id: userId } });
      authorName = dbUser?.name;
    }

    const story = await prisma.story.create({
      data: {
        title: title || "",
        imageUrl: `/uploads/${file.filename}`,
        authorName: authorName || "Member",
        userId: userId
      }
    });

    res.status(201).json({ status: "success", data: story });
  } catch (error) {
    console.error("Error creating story:", error);
    res.status(500).json({ status: "error", message: "Failed to create story" });
  }
};
