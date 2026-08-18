import { Request, Response } from "express";
import prisma from "../config/db.js";
import { getIO } from "../services/socket.service.js";

// Send a chat message (Public: Guests & Users can send to Admin, Admin can reply)
export const sendMessage = async (req: any, res: Response): Promise<void> => {
  try {
    const { conversationId, guestName, message } = req.body;
    const user = req.user; // Present if authenticated

    if (!message || message.trim() === "") {
      res.status(400).json({ message: "Message content is required" });
      return;
    }

    let finalConversationId = conversationId;
    let senderName = guestName || "Guest";
    let senderRole = "GUEST";
    let senderId: number | undefined = undefined;

    if (user) {
      senderId = user.userId || user.id;
      senderName = user.name || "Member";
      senderRole = user.role || "USER";

      // If user is regular USER (not Admin), conversation ID is user_{id}
      if (senderRole === "USER") {
        finalConversationId = `user_${senderId}`;
      }
    }

    if (!finalConversationId) {
      res.status(400).json({ message: "Conversation ID is required" });
      return;
    }

    const newMessage = await (prisma as any).chatMessage.create({
      data: {
        conversationId: finalConversationId,
        senderId,
        senderName,
        senderRole,
        message: message.trim(),
        isRead: false,
      },
    });

    // Emit real-time WebSockets events to room and admin channel
    const io = getIO();
    if (io) {
      io.to(`conversation_${finalConversationId}`).emit("new_message", newMessage);
      io.to("admin_room").emit("conversation_updated", {
        conversationId: finalConversationId,
        lastMessage: newMessage.message,
        lastSenderName: newMessage.senderName,
        lastSenderRole: newMessage.senderRole,
        updatedAt: newMessage.createdAt,
        newMessage
      });

      const unreadCount = await (prisma as any).chatMessage.count({
        where: {
          isRead: false,
          senderRole: { notIn: ["ADMIN", "SUPER_ADMIN"] }
        }
      });
      io.to("admin_room").emit("unread_count_updated", { unreadCount });
    }

    res.status(201).json({
      message: "Message sent successfully",
      data: newMessage,
    });
  } catch (error) {
    console.error("Error sending chat message:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get messages for a specific conversation
export const getMessages = async (req: any, res: Response): Promise<void> => {
  try {
    const { conversationId } = req.params;

    if (!conversationId) {
      res.status(400).json({ message: "Conversation ID required" });
      return;
    }

    const messages = await (prisma as any).chatMessage.findMany({
      where: { conversationId },
      orderBy: { createdAt: "asc" },
    });

    res.status(200).json({ data: messages });
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get list of all active conversations (Admin / Super Admin)
export const getConversations = async (req: any, res: Response): Promise<void> => {
  try {
    const allMessages = await (prisma as any).chatMessage.findMany({
      orderBy: { createdAt: "desc" },
    });

    const conversationMap: Record<string, any> = {};

    for (const msg of allMessages) {
      if (!conversationMap[msg.conversationId]) {
        conversationMap[msg.conversationId] = {
          conversationId: msg.conversationId,
          lastMessage: msg.message,
          lastSenderName: msg.senderName,
          lastSenderRole: msg.senderRole,
          updatedAt: msg.createdAt,
          unreadCount: 0,
        };
      }
      if (!msg.isRead && msg.senderRole !== "ADMIN" && msg.senderRole !== "SUPER_ADMIN") {
        conversationMap[msg.conversationId].unreadCount += 1;
      }
    }

    const conversations = Object.values(conversationMap).sort(
      (a: any, b: any) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );

    res.status(200).json({ data: conversations });
  } catch (error) {
    console.error("Error fetching conversations:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get total unread chat count across all conversations (Admin / Super Admin)
export const getUnreadCount = async (req: any, res: Response): Promise<void> => {
  try {
    const count = await (prisma as any).chatMessage.count({
      where: {
        isRead: false,
        senderRole: {
          notIn: ["ADMIN", "SUPER_ADMIN"],
        },
      },
    });

    res.status(200).json({ unreadCount: count });
  } catch (error) {
    console.error("Error fetching unread chat count:", error);
    res.status(500).json({ unreadCount: 0 });
  }
};

// Mark conversation messages as read (Admin / Super Admin)
export const markAsRead = async (req: any, res: Response): Promise<void> => {
  try {
    const { conversationId } = req.params;

    await (prisma as any).chatMessage.updateMany({
      where: {
        conversationId,
        isRead: false,
      },
      data: { isRead: true },
    });

    res.status(200).json({ message: "Marked as read" });
  } catch (error) {
    console.error("Error marking messages as read:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
