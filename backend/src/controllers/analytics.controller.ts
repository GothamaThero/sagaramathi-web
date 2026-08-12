import { Request, Response } from "express";
import prisma from "../config/db.js";

export const getDashboardStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const totalBookings = await prisma.danaBooking.count();
    const pendingBookings = await prisma.danaBooking.count({ where: { status: "PENDING" } });
    const approvedBookings = await prisma.danaBooking.count({ where: { status: "APPROVED" } });

    // Calculate total payments
    const payments = await prisma.danaPayment.findMany({
      where: { status: "APPROVED" },
      select: { amount: true }
    });
    
    let totalIncome = 0;
    payments.forEach(p => {
      const amount = parseFloat(p.amount.replace(/[^0-9.-]+/g,""));
      if (!isNaN(amount)) totalIncome += amount;
    });

    res.status(200).json({
      status: "success",
      data: {
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
