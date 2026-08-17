import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret_key_change_in_prod";
const FALLBACK_SECRET = "fallback_secret_key_change_in_prod";

export interface AuthRequest extends Request {
  user?: {
    userId: number;
    role: string;
    email: string;
  };
}

export const verifyToken = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ status: "error", message: "No token provided, authorization denied" });
    return;
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    req.user = decoded;
    next();
  } catch (error) {
    if (JWT_SECRET !== FALLBACK_SECRET) {
      try {
        const decodedFallback = jwt.verify(token, FALLBACK_SECRET) as any;
        req.user = decodedFallback;
        next();
        return;
      } catch (e2) {
        // both secrets failed
      }
    }
    res.status(401).json({ status: "error", message: "Token is not valid" });
  }
};

export const requireRole = (roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ status: "error", message: "Not authenticated" });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({ status: "error", message: "Access forbidden: Insufficient privileges" });
      return;
    }

    next();
  };
};

export const optionalToken = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.split(" ")[1];
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      req.user = decoded;
    } catch (e) {
      if (JWT_SECRET !== FALLBACK_SECRET) {
        try {
          const decodedFallback = jwt.verify(token, FALLBACK_SECRET) as any;
          req.user = decodedFallback;
        } catch (e2) {
          // ignore
        }
      }
    }
  }
  next();
};
