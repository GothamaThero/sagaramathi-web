import { Request, Response } from "express";
import prisma from "../config/db.js";
import { logAuditAction } from "../services/audit.service.js";

// Create Dana (Protected: Any User)
export const createDana = async (req: any, res: Response): Promise<void> => {
  try {
    const { name, phone, whatsapp, address, month, day, mealType, purpose } = req.body;
    const userId = req.user?.userId;

    let finalAddress = address;
    let finalPhone = phone;
    let finalWhatsapp = whatsapp;

    if (userId && (!finalAddress || finalAddress.includes("N/A"))) {
      const dbUser = await prisma.user.findUnique({ where: { id: userId } });
      if (dbUser) {
        if (dbUser.address) finalAddress = dbUser.address;
        if (dbUser.phone) finalPhone = dbUser.phone;
        if (dbUser.whatsapp) finalWhatsapp = dbUser.whatsapp;
      }
    }

    const newDana = await prisma.danaBooking.create({
      data: {
        name,
        phone: finalPhone || "N/A",
        whatsapp: finalWhatsapp || "N/A",
        address: finalAddress || "N/A",
        month,
        day,
        mealType,
        purpose,
        userId,
        status: "PENDING",
      },
    });

    await logAuditAction({
      userId: req.user?.userId,
      userName: req.user?.name || name || "User",
      userRole: req.user?.role || "USER",
      action: "CREATE_DANA_BOOKING",
      target: `DanaBooking #${newDana.id}`,
      details: `Created Dana for ${name} (${month} ${day})`,
      ipAddress: req.ip,
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
        user: { select: { name: true, email: true, phone: true, whatsapp: true, address: true } },
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

    await logAuditAction({
      userId: req.user?.userId,
      userName: req.user?.name || "Admin",
      userRole: req.user?.role || "ADMIN",
      action: "APPROVE_DANA_BOOKING",
      target: `DanaBooking #${dana.id}`,
      details: `Approved Dana for ${dana.name} (${dana.month} ${dana.day})`,
      ipAddress: req.ip,
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

    await logAuditAction({
      userId: req.user?.userId,
      userName: req.user?.name || "Admin",
      userRole: req.user?.role || "ADMIN",
      action: "REJECT_DANA_BOOKING",
      target: `DanaBooking #${dana.id}`,
      details: `Rejected Dana for ${dana.name} (${dana.month} ${dana.day})`,
      ipAddress: req.ip,
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

    const danaToDel = await prisma.danaBooking.findUnique({ where: { id: Number(id) } });

    // First delete any associated payments
    await prisma.danaPayment.deleteMany({
      where: { danaBookingId: Number(id) }
    });

    // Then delete the dana booking
    await prisma.danaBooking.delete({
      where: { id: Number(id) }
    });

    await logAuditAction({
      userId: req.user?.userId,
      userName: req.user?.name || "Super Admin",
      userRole: req.user?.role || "SUPER_ADMIN",
      action: "DELETE_DANA_BOOKING",
      target: `DanaBooking #${id}`,
      details: `Deleted Dana for ${danaToDel?.name || 'Unknown'} (${danaToDel?.month} ${danaToDel?.day})`,
      ipAddress: req.ip,
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
    if (req.user?.role === "USER" && existingDana.userId !== req.user?.userId) {
      res.status(403).json({ message: "You can only edit your own dana bookings" });
      return;
    }

    const updatedDana = await prisma.danaBooking.update({
      where: { id: Number(id) },
      data: { name, phone, whatsapp, address, month, day, mealType, purpose },
    });

    await logAuditAction({
      userId: req.user?.userId,
      userName: req.user?.name || "Admin",
      userRole: req.user?.role || "ADMIN",
      action: "UPDATE_DANA_BOOKING",
      target: `DanaBooking #${id}`,
      details: `Updated Dana details for ${name}`,
      ipAddress: req.ip,
    });

    res.status(200).json({ message: "Dana updated successfully", data: updatedDana });
  } catch (error) {
    console.error("Error updating dana:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get Single Dana by ID
export const getDanaById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const dana = await prisma.danaBooking.findUnique({
      where: { id: Number(id) },
      include: {
        payments: true,
        user: {
          select: {
            id: true,
            name: true,
            designation: true,
            role: true
          }
        }
      }
    });
    if (!dana) {
      res.status(404).json({ message: "Dana not found" });
      return;
    }
    res.status(200).json(dana);
  } catch (error) {
    console.error("Error fetching single dana:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Export Danas as CSV
export const exportDanasCSV = async (req: Request, res: Response): Promise<void> => {
  try {
    const danas = await prisma.danaBooking.findMany({
      orderBy: [{ month: "asc" }, { day: "asc" }],
      include: { payments: true }
    });

    let csvContent = "ID,Name,Phone,WhatsApp,Address,Month,Day,MealType,Purpose,Status,TotalPaid,CreatedAt\n";

    danas.forEach((d) => {
      const paidSum = d.payments
        .filter((p) => p.status === "APPROVED")
        .reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);

      const cleanName = `"${(d.name || "").replace(/"/g, '""')}"`;
      const cleanAddr = `"${(d.address || "").replace(/"/g, '""')}"`;
      const cleanPurp = `"${(d.purpose || "").replace(/"/g, '""')}"`;

      csvContent += `${d.id},${cleanName},${d.phone},${d.whatsapp},${cleanAddr},${d.month},${d.day},${d.mealType},${cleanPurp},${d.status},${paidSum},"${new Date(d.createdAt).toISOString()}"\n`;
    });

    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename=sagaramathi_danas_${Date.now()}.csv`);
    res.status(200).send(csvContent);
  } catch (error) {
    console.error("Error exporting danas CSV:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get Notice Board Printable Sheet Data
export const getNoticeBoardSheet = async (req: Request, res: Response): Promise<void> => {
  try {
    const { month } = req.query;
    const monthFilter = month ? String(month) : "";

    const whereObj: any = { status: "APPROVED" };
    if (monthFilter) {
      whereObj.month = monthFilter;
    }

    const danas = await prisma.danaBooking.findMany({
      where: whereObj,
      orderBy: [{ day: "asc" }],
      include: {
        payments: {
          where: { status: "APPROVED" }
        }
      }
    });

    res.status(200).json({
      month: monthFilter || "All Months",
      totalCount: danas.length,
      data: danas.map((d) => ({
        id: d.id,
        day: d.day,
        month: d.month,
        name: d.name,
        phone: d.phone,
        whatsapp: d.whatsapp,
        address: d.address,
        mealType: d.mealType === "MORNING" ? "හීල් දානය" : d.mealType === "NOON" ? "දවල් දානය" : "ගිලන්පස",
        purpose: d.purpose,
        isPaid: d.payments.length > 0
      }))
    });
  } catch (error) {
    console.error("Error generating notice board sheet:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

