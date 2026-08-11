import express from "express";
import cors from "cors";
import userRoutes from "./routes/user.routes";

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

// API Routes
server.use("/api/users", userRoutes);

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});