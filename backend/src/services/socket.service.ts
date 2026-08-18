import { Server as HttpServer } from "http";
import { Server, Socket } from "socket.io";
import prisma from "../config/db.js";

let io: Server | null = null;

export const initSocketServer = (httpServer: HttpServer): Server => {
  io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  io.on("connection", (socket: Socket) => {
    console.log(`[Socket.io] Client connected: ${socket.id}`);

    // Join specific conversation room
    socket.on("join_conversation", (conversationId: string) => {
      if (conversationId) {
        socket.join(`conversation_${conversationId}`);
        console.log(`[Socket.io] Socket ${socket.id} joined conversation_${conversationId}`);
      }
    });

    // Join admin broadcast room
    socket.on("join_admin", () => {
      socket.join("admin_room");
      console.log(`[Socket.io] Socket ${socket.id} joined admin_room`);
    });

    // Handle typing status
    socket.on("typing", (data: { conversationId: string; isTyping: boolean; senderName: string }) => {
      const { conversationId, isTyping, senderName } = data;
      socket.to(`conversation_${conversationId}`).emit("typing_status", {
        conversationId,
        isTyping,
        senderName
      });
      socket.to("admin_room").emit("typing_status", {
        conversationId,
        isTyping,
        senderName
      });
    });

    // Handle instant real-time message sending via WebSockets
    socket.on("send_message", async (data: { conversationId: string; guestName?: string; message: string; senderId?: number; senderRole?: string; senderName?: string }) => {
      try {
        const { conversationId, guestName, message, senderId, senderRole, senderName } = data;
        if (!conversationId || !message || message.trim() === "") return;

        const finalSenderRole = senderRole || "GUEST";
        const finalSenderName = senderName || guestName || "Guest";

        const newMessage = await (prisma as any).chatMessage.create({
          data: {
            conversationId,
            senderId: senderId || null,
            senderName: finalSenderName,
            senderRole: finalSenderRole,
            message: message.trim(),
            isRead: false,
          },
        });

        // Broadcast to conversation room (user/guest & admin viewing this room)
        io?.to(`conversation_${conversationId}`).emit("new_message", newMessage);

        // Broadcast to admin room (for live thread list & unread count updates)
        io?.to("admin_room").emit("conversation_updated", {
          conversationId,
          lastMessage: newMessage.message,
          lastSenderName: newMessage.senderName,
          lastSenderRole: newMessage.senderRole,
          updatedAt: newMessage.createdAt,
          newMessage
        });

        // Calculate and broadcast updated unread count to admins
        const unreadCount = await (prisma as any).chatMessage.count({
          where: {
            isRead: false,
            senderRole: { notIn: ["ADMIN", "SUPER_ADMIN"] }
          }
        });
        io?.to("admin_room").emit("unread_count_updated", { unreadCount });
      } catch (err) {
        console.error("[Socket.io] Error processing send_message event:", err);
      }
    });

    socket.on("disconnect", () => {
      console.log(`[Socket.io] Client disconnected: ${socket.id}`);
    });
  });

  return io;
};

export const getIO = (): Server | null => {
  return io;
};
