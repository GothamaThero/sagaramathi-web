import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Create Dana (Protected: Any User)
export const createDana = async (req: any, res: Response): Promise<void> => {
  try {
    const { name, phone, whatsapp, address, month, day, mealType, purpose } = req.body;
    const userId = req.user?.userId;

    const newDana = await prisma.danaBooking.create({
      data: {
        name,
        phone,
        whatsapp,
        address,
        month,
        day,
        mealType,
        purpose,
        userId,
        status: "PENDING",
      },
    });

    res.status(201).json({
      message: "Dana booking created successfully. Awaiting approval.",
      data: newDana,
    });
  } catch (error) {
    console.error("Error creating dana booking:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Public Get: Only APPROVED
export const getDanas = async (req: Request, res: Response): Promise<void> => {
  try {
    const danas = await prisma.danaBooking.findMany({
      where: { status: "APPROVED" },
      orderBy: { createdAt: "desc" },
      include: {
        payments: {
          where: { status: "APPROVED" }
        }
      }
    });
    res.status(200).json(danas);
  } catch (error) {
    console.error("Error fetching public danas:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Admin Get: ALL Danas
export const getAdminDanas = async (req: Request, res: Response): Promise<void> => {
  try {
    const danas = await prisma.danaBooking.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        payments: true,
        user: { select: { name: true, email: true } },
        approvedBy: { select: { name: true } }
      }
    });
    res.status(200).json(danas);
  } catch (error) {
    console.error("Error fetching admin danas:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// User Get: Own Danas
export const getMyDanas = async (req: any, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const danas = await prisma.danaBooking.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: { payments: true }
    });
    res.status(200).json(danas);
  } catch (error) {
    console.error("Error fetching user danas:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Approve Dana
export const approveDana = async (req: any, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const adminId = req.user?.userId;

    const dana = await prisma.danaBooking.update({
      where: { id: Number(id) },
      data: {
        status: "APPROVED",
        approvedById: adminId
      }
    });

    res.status(200).json({ message: "Dana approved successfully", data: dana });
  } catch (error) {
    console.error("Error approving dana:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Reject Dana
export const rejectDana = async (req: any, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const adminId = req.user?.userId;

    const dana = await prisma.danaBooking.update({
      where: { id: Number(id) },
      data: {
        status: "REJECTED",
        approvedById: adminId // Store who rejected it too
      }
    });

    res.status(200).json({ message: "Dana rejected successfully", data: dana });
  } catch (error) {
    console.error("Error rejecting dana:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Delete Dana
export const deleteDana = async (req: any, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    // Check if super admin
    if (req.user?.role !== "SUPER_ADMIN") {
      res.status(403).json({ message: "Only Super Admin can delete." });
      return;
    }

    // First delete any associated payments
    await prisma.danaPayment.deleteMany({
      where: { danaBookingId: Number(id) }
    });

    // Then delete the dana booking
    await prisma.danaBooking.delete({
      where: { id: Number(id) }
    });

    res.status(200).json({ message: "Dana deleted successfully" });
  } catch (error) {
    console.error("Error deleting dana:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Update Dana
export const updateDana = async (req: any, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, phone, whatsapp, address, month, day, mealType, purpose } = req.body;
    
    const existingDana = await prisma.danaBooking.findUnique({
      where: { id: Number(id) }
    });

    if (!existingDana) {
      res.status(404).json({ message: "Dana not found" });
      return;
    }

    // Check permissions
    // Super Admin & Admin can edit anything. User can only edit their own.
    if (req.user?.role === "USER" && existingDana.userId !== req.user?.userId) {
      res.status(403).json({ message: "You can only edit your own dana bookings" });
      return;
    }

    const updatedDana = await prisma.danaBooking.update({
      where: { id: Number(id) },
      data: { name, phone, whatsapp, address, month, day, mealType, purpose },
    });

    res.status(200).json({ message: "Dana updated successfully", data: updatedDana });
  } catch (error) {
    console.error("Error updating dana:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
