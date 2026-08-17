import { Router } from "express";
import { 
  sendMessage, 
  getMessages, 
  getConversations, 
  getUnreadCount,
  markAsRead 
} from "../controllers/chat.controller.js";
import { verifyToken, requireRole, optionalToken } from "../middleware/auth.middleware.js";

const router = Router();

// Send message (Open to Guest & Users via optionalToken)
router.post("/send", optionalToken, sendMessage);

// Get messages for a thread (Open to Guest & Users via optionalToken)
router.get("/messages/:conversationId", optionalToken, getMessages);

// Admin / Super Admin routes
router.get("/conversations", verifyToken, requireRole(["ADMIN", "SUPER_ADMIN"]), getConversations);
router.get("/unread-count", verifyToken, requireRole(["ADMIN", "SUPER_ADMIN"]), getUnreadCount);
router.patch("/read/:conversationId", verifyToken, requireRole(["ADMIN", "SUPER_ADMIN"]), markAsRead);

export default router;
