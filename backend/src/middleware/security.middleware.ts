import { Request, Response, NextFunction } from "express";

export const securityHeaders = (req: Request, res: Response, next: NextFunction): void => {
  // Hide X-Powered-By header
  res.removeHeader("X-Powered-By");

  // Prevent MIME sniffing
  res.setHeader("X-Content-Type-Options", "nosniff");

  // Prevent Clickjacking framing
  res.setHeader("X-Frame-Options", "DENY");

  // Enable XSS Filtering in legacy browsers
  res.setHeader("X-XSS-Protection", "1; mode=block");

  // Control referrer information sent in headers
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");

  // Prevent caching sensitive API responses
  if (req.method !== "GET") {
    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  }

  next();
};
