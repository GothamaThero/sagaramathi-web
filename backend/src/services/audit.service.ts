import prisma from "../config/db.js";

export interface LogAuditParams {
  userId?: number;
  userName: string;
  userRole?: string;
  action: string;
  target?: string;
  details?: string;
  ipAddress?: string;
}

export const logAuditAction = async (params: LogAuditParams): Promise<void> => {
  try {
    await prisma.auditLog.create({
      data: {
        userId: params.userId || null,
        userName: params.userName || "System",
        userRole: params.userRole || "ADMIN",
        action: params.action,
        target: params.target || null,
        details: params.details || null,
        ipAddress: params.ipAddress || null,
      },
    });
  } catch (error) {
    console.error("Failed to create audit log entry:", error);
  }
};

export const fetchAuditLogs = async (limit: number = 100) => {
  return await prisma.auditLog.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
  });
};
