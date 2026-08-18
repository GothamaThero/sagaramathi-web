import { Request, Response } from "express";
import prisma from "../config/db.js";

export const getDashboardStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const [totalUsers, totalBookings, pendingBookings, approvedBookings, payments] = await Promise.all([
      prisma.user.count(),
      prisma.danaBooking.count(),
      prisma.danaBooking.count({ where: { status: "PENDING" } }),
      prisma.danaBooking.count({ where: { status: "APPROVED" } }),
      prisma.danaPayment.findMany({
        where: { status: "APPROVED" },
        select: { amount: true }
      })
    ]);

    let totalIncome = 0;
    for (let i = 0; i < payments.length; i++) {
      const rawAmount = String(payments[i].amount || "");
      const amount = parseFloat(rawAmount.replace(/[^0-9.-]+/g, ""));
      if (!isNaN(amount)) totalIncome += amount;
    }

    res.status(200).json({
      status: "success",
      data: {
        totalUsers,
        totalBookings,
        pendingBookings,
        approvedBookings,
        totalIncome
      }
    });
  } catch (error) {
    console.error("Error fetching analytics:", error);
    res.status(500).json({ status: "error", message: "Failed to fetch analytics" });
  }
};
