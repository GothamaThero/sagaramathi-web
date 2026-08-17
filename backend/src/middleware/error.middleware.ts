import { Request, Response, NextFunction } from "express";

export interface CustomError extends Error {
  statusCode?: number;
  code?: string;
}

// 404 Not Found Middleware for unhandled routes
export const notFoundHandler = (req: Request, res: Response, next: NextFunction): void => {
  res.status(404).json({
    status: "error",
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
};

// Global Error Handler Middleware
export const errorHandler = (
  err: CustomError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  // Log error for internal monitoring
  console.error(`[ERROR] ${req.method} ${req.originalUrl}:`, err);

  // Prisma unique constraint violation error handling
  if (err.code === "P2002") {
    res.status(409).json({
      status: "error",
      message: "A record with this unique key already exists.",
    });
    return;
  }

  // Prisma record not found error handling
  if (err.code === "P2025") {
    res.status(404).json({
      status: "error",
      message: "Requested record was not found.",
    });
    return;
  }

  // JWT invalid/expired error handling
  if (err.name === "JsonWebTokenError") {
    res.status(401).json({
      status: "error",
      message: "Invalid token provided.",
    });
    return;
  }

  if (err.name === "TokenExpiredError") {
    res.status(401).json({
      status: "error",
      message: "Token has expired.",
    });
    return;
  }

  res.status(statusCode).json({
    status: "error",
    message: process.env.NODE_ENV === "production" && statusCode === 500
      ? "Internal Server Error"
      : message,
  });
};
