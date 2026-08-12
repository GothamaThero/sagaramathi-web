import express from "express";
import cors from "cors";
import path from "path";
import { ensureDatabaseExists } from "./config/dbInit.js";
import userRoutes from "./routes/user.routes.js";
import danaRoutes from "./routes/dana.routes.js";
import paymentRoutes from "./routes/payment.routes.js";
import authRoutes from "./routes/auth.routes.js";
import analyticsRoutes from "./routes/analytics.routes.js";

const server = express();

// Middleware
server.use(cors());
server.use(express.json());

// Root test route
server.get("/", (req, res) => {
  res.send({
    message: "Sagaramathi API is running",
    version: "1.0.0",
    status: "success",
  });
});

// Serve static uploads
server.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// API Routes
server.use("/api/auth", authRoutes);
server.use("/api/users", userRoutes);
server.use("/api/dana", danaRoutes);
server.use("/api/payments", paymentRoutes);
server.use("/api/analytics", analyticsRoutes);

const PORT = process.env.PORT || 3000;

server.listen(PORT, async () => {
  console.log(`Server is running on port ${PORT}`);
  // Runtime database auto-creation and schema sync
  await ensureDatabaseExists();
});