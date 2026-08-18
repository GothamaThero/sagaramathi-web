import express from "express";
import { createServer } from "http";
import cors from "cors";
import compression from "compression";
import path from "path";
import { ensureDatabaseExists } from "./config/dbInit.js";
import userRoutes from "./routes/user.routes.js";
import danaRoutes from "./routes/dana.routes.js";
import paymentRoutes from "./routes/payment.routes.js";
import authRoutes from "./routes/auth.routes.js";
import analyticsRoutes from "./routes/analytics.routes.js";
import financeRoutes from "./routes/finance.routes.js";
import postRoutes from "./routes/post.routes.js";
import settingRoutes from "./routes/setting.routes.js";
import chatRoutes from "./routes/chat.routes.js";
import whatsappReportRoutes from "./routes/whatsappReport.routes.js";
import danaConfirmationRoutes from "./routes/danaConfirmation.routes.js";
import templeRoutes from "./routes/temple.routes.js";
import galleryRoutes from "./routes/gallery.routes.js";
import { runAutomatedDanaRemindersCron } from "./services/cron.service.js";
import { initSocketServer } from "./services/socket.service.js";

// Import Custom Middlewares
import { securityHeaders } from "./middleware/security.middleware.js";
import { requestLogger } from "./middleware/requestLogger.middleware.js";
import { apiRateLimiter, authRateLimiter } from "./middleware/rateLimiter.middleware.js";
import { notFoundHandler, errorHandler } from "./middleware/error.middleware.js";

const server = express();
const httpServer = createServer(server);

// Initialize Socket.io WebSockets Server
initSocketServer(httpServer);

// HTTP Response Compression (Gzip / Brotli)
server.use(compression());

// Security and Logging Middlewares
server.use(securityHeaders);
server.use(requestLogger);

// CORS & Body Parser Middlewares
const allowedOrigins = process.env.FRONTEND_URL 
  ? process.env.FRONTEND_URL.split(",") 
  : ["http://localhost:5173", "http://localhost:5174", "http://localhost:3000", "http://127.0.0.1:5173", "http://127.0.0.1:5174"];

server.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl, postman) or if allowed origin matches
    if (!origin || allowedOrigins.includes(origin) || process.env.NODE_ENV !== "production") {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true
}));

server.use(express.json());

// Root test route
server.get("/", (req, res) => {
  res.send({
    message: "Sagaramati API is running",
    version: "1.0.0",
    status: "success",
  });
});

// Serve static uploads with browser caching headers (7 days)
server.use("/uploads", express.static(path.join(process.cwd(), "uploads"), {
  maxAge: "7d",
  etag: true,
  lastModified: true
}));

// Global API Rate Limiter
server.use("/api", apiRateLimiter);

// Specific Auth Rate Limiter
server.use("/api/auth", authRateLimiter);

// API Routes
server.use("/api/auth", authRoutes);
server.use("/api/users", userRoutes);
server.use("/api/dana", danaRoutes);
server.use("/api/payments", paymentRoutes);
server.use("/api/analytics", analyticsRoutes);
server.use("/api/finance", financeRoutes);
server.use("/api/posts", postRoutes);
server.use("/api/settings", settingRoutes);
server.use("/api/chat", chatRoutes);
server.use("/api/whatsapp-reports", whatsappReportRoutes);
server.use("/api/dana-confirm", danaConfirmationRoutes);
server.use("/api/temple", templeRoutes);
server.use("/api/gallery", galleryRoutes);

// 404 Not Found & Global Error Handling Middlewares
server.use(notFoundHandler);
server.use(errorHandler);

const PORT = process.env.PORT || 3000;

httpServer.listen(PORT, async () => {
  console.log(`Server is running on port ${PORT} with WebSockets enabled`);
  // Runtime database auto-creation and schema sync
  await ensureDatabaseExists();
  // Trigger initial automated Dana reminders cron check
  runAutomatedDanaRemindersCron();
});