import { Request, Response, NextFunction } from "express";

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

const rateLimitStore = new Map<string, RateLimitRecord>();

// Cleanup stale entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [ip, record] of rateLimitStore.entries()) {
    if (now > record.resetTime) {
      rateLimitStore.delete(ip);
    }
  }
}, 5 * 60 * 1000);

export const createRateLimiter = (options?: {
  windowMs?: number; // Time window in milliseconds (default: 15 mins)
  maxRequests?: number; // Max requests per window (default: 100)
  message?: string;
}) => {
  const windowMs = options?.windowMs || 15 * 60 * 1000;
  const maxRequests = options?.maxRequests || 100;
  const message = options?.message || "Too many requests from this IP, please try again later.";

  return (req: Request, res: Response, next: NextFunction): void => {
    // Skip rate limiting during development to prevent local testing blocks
    if (process.env.NODE_ENV !== "production") {
      next();
      return;
    }

    const ip = (req.headers["x-forwarded-for"] as string) || req.socket.remoteAddress || "global";

    const key = `${req.baseUrl || req.path}:${ip}`;
    const now = Date.now();

    const record = rateLimitStore.get(key);

    if (!record || now > record.resetTime) {
      rateLimitStore.set(key, {
        count: 1,
        resetTime: now + windowMs,
      });
      next();
      return;
    }

    if (record.count >= maxRequests) {
      res.status(429).json({
        status: "error",
        message,
        retryAfterSeconds: Math.ceil((record.resetTime - now) / 1000),
      });
      return;
    }

    record.count += 1;
    next();
  };
};

// Default rate limiters for specific use cases
export const apiRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 300, // 300 requests per 15 mins
});

export const authRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 20, // 20 login/auth attempts per 15 mins per IP
  message: "Too many authentication attempts, please try again after 15 minutes.",
});
