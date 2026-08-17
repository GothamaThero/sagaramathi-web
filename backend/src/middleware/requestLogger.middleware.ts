import { Request, Response, NextFunction } from "express";

export const requestLogger = (req: Request, res: Response, next: NextFunction): void => {
  const startTime = Date.now();
  const { method, originalUrl } = req;
  const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress || "unknown";

  res.on("finish", () => {
    const duration = Date.now() - startTime;
    const statusCode = res.statusCode;

    // Visual indicator based on HTTP status code
    let statusFormatted = `${statusCode}`;
    if (statusCode >= 500) {
      statusFormatted = `\x1b[31m${statusCode}\x1b[0m`; // Red
    } else if (statusCode >= 400) {
      statusFormatted = `\x1b[33m${statusCode}\x1b[0m`; // Yellow
    } else if (statusCode >= 300) {
      statusFormatted = `\x1b[36m${statusCode}\x1b[0m`; // Cyan
    } else {
      statusFormatted = `\x1b[32m${statusCode}\x1b[0m`; // Green
    }

    console.log(`[HTTP] ${method} ${originalUrl} ${statusFormatted} - ${duration}ms (IP: ${ip})`);
  });

  next();
};
