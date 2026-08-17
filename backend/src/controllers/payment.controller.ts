import { Request, Response } from "express";
import prisma from "../config/db.js";
import multer from "multer";
import path from "path";
import fs from "fs";
import { logAuditAction } from "../services/audit.service.js";

// Ensure uploads directory exists
const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

export const upload = multer({ storage: storage });

export const createPayment = async (req: any, res: Response): Promise<void> => {
  try {
    const { danaBookingId, year, payerName, payerPhone, amount, status, punyanumodanaSent } = req.body;
    const receiptUrl = req.file ? `/uploads/${req.file.filename}` : (req.body.receiptUrl || "");
    const adminId = req.user?.userId;

    if (!danaBookingId || !year || !payerName || !amount) {
      res.status(400).json({ message: "Missing required fields (danaBookingId, year, payerName, amount)" });
      return;
    }

    const initialStatus = status && ["APPROVED", "PENDING", "REJECTED"].includes(status) ? status : "PENDING";

    const newPayment = await prisma.danaPayment.create({
      data: {
        danaBookingId: parseInt(danaBookingId, 10),
        year: String(year),
        payerName: String(payerName),
        payerPhone: payerPhone ? String(payerPhone) : "N/A",
        amount: String(amount),
        receiptUrl: receiptUrl,
        status: initialStatus,
        punyanumodanaSent: punyanumodanaSent === true || punyanumodanaSent === "true",
        approvedById: initialStatus === "APPROVED" ? adminId : undefined
      },
    });

    await logAuditAction({
      userId: req.user?.userId,
      userName: req.user?.name || payerName || "User",
      userRole: req.user?.role || "USER",
      action: "CREATE_PAYMENT",
      target: `DanaPayment #${newPayment.id}`,
      details: `Created Payment of LKR ${amount} for Dana #${danaBookingId} by ${payerName}`,
      ipAddress: req.ip,
    });

    res.status(201).json({
      message: "Payment created successfully",
      data: newPayment,
    });
  } catch (error) {
    console.error("Error creating payment:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const togglePunyanumodana = async (req: Request, res: Response): Promise<void> => {
  try {
    const paymentId = parseInt(req.params.id as string);
    
    // Get current payment
    const payment = await prisma.danaPayment.findUnique({
      where: { id: paymentId },
    });

    if (!payment) {
      res.status(404).json({ message: "Payment not found" });
      return;
    }

    // Toggle the status
    const updatedPayment = await prisma.danaPayment.update({
      where: { id: paymentId },
      data: {
        punyanumodanaSent: !payment.punyanumodanaSent,
      },
    });

    res.status(200).json({
      message: "Punyanumodana status updated",
      data: updatedPayment,
    });
  } catch (error) {
    console.error("Error updating punyanumodana status:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Approve Payment
export const approvePayment = async (req: any, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const adminId = req.user?.userId;

    const payment = await prisma.danaPayment.update({
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
      action: "APPROVE_PAYMENT",
      target: `DanaPayment #${payment.id}`,
      details: `Approved Payment of LKR ${payment.amount} by ${payment.payerName}`,
      ipAddress: req.ip,
    });

    res.status(200).json({ message: "Payment approved successfully", data: payment });
  } catch (error) {
    console.error("Error approving payment:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Reject Payment
export const rejectPayment = async (req: any, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const adminId = req.user?.userId;

    const payment = await prisma.danaPayment.update({
      where: { id: Number(id) },
      data: {
        status: "REJECTED",
        approvedById: adminId
      }
    });

    await logAuditAction({
      userId: req.user?.userId,
      userName: req.user?.name || "Admin",
      userRole: req.user?.role || "ADMIN",
      action: "REJECT_PAYMENT",
      target: `DanaPayment #${payment.id}`,
      details: `Rejected Payment of LKR ${payment.amount} by ${payment.payerName}`,
      ipAddress: req.ip,
    });

    res.status(200).json({ message: "Payment rejected successfully", data: payment });
  } catch (error) {
    console.error("Error rejecting payment:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Update Payment (Admin / Super Admin)
export const updatePayment = async (req: any, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { year, payerName, payerPhone, amount, status, punyanumodanaSent } = req.body;
    const paymentId = parseInt(id, 10);

    const existingPayment = await prisma.danaPayment.findUnique({
      where: { id: paymentId }
    });

    if (!existingPayment) {
      res.status(404).json({ message: "Payment not found" });
      return;
    }

    const updateData: any = {};
    if (year !== undefined) updateData.year = String(year);
    if (payerName !== undefined) updateData.payerName = String(payerName);
    if (payerPhone !== undefined) updateData.payerPhone = String(payerPhone);
    if (amount !== undefined) updateData.amount = String(amount);
    if (status !== undefined) {
      updateData.status = status;
      if (status === "APPROVED") {
        updateData.approvedById = req.user?.userId;
      }
    }
    if (punyanumodanaSent !== undefined) {
      updateData.punyanumodanaSent = punyanumodanaSent === true || punyanumodanaSent === "true";
    }

    if (req.file) {
      updateData.receiptUrl = `/uploads/${req.file.filename}`;
    }

    const updated = await prisma.danaPayment.update({
      where: { id: paymentId },
      data: updateData
    });

    await logAuditAction({
      userId: req.user?.userId,
      userName: req.user?.name || "Admin",
      userRole: req.user?.role || "ADMIN",
      action: "UPDATE_PAYMENT",
      target: `DanaPayment #${paymentId}`,
      details: `Updated Payment details for ${payerName || existingPayment.payerName}`,
      ipAddress: req.ip,
    });

    res.status(200).json({ message: "Payment updated successfully", data: updated });
  } catch (error) {
    console.error("Error updating payment:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Delete Payment (Admin / Super Admin)
export const deletePayment = async (req: any, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const paymentId = parseInt(id, 10);

    const existingPayment = await prisma.danaPayment.findUnique({
      where: { id: paymentId }
    });

    if (!existingPayment) {
      res.status(404).json({ message: "Payment not found" });
      return;
    }

    await prisma.danaPayment.delete({
      where: { id: paymentId }
    });

    await logAuditAction({
      userId: req.user?.userId,
      userName: req.user?.name || "Super Admin",
      userRole: req.user?.role || "SUPER_ADMIN",
      action: "DELETE_PAYMENT",
      target: `DanaPayment #${paymentId}`,
      details: `Deleted Payment #${paymentId} of ${existingPayment.payerName}`,
      ipAddress: req.ip,
    });

    res.status(200).json({ message: "Payment deleted successfully" });
  } catch (error) {
    console.error("Error deleting payment:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Export Payments as CSV
export const exportPaymentsCSV = async (req: Request, res: Response): Promise<void> => {
  try {
    const payments = await prisma.danaPayment.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        danaBooking: { select: { name: true, month: true, day: true } },
        approvedBy: { select: { name: true } }
      }
    });

    let csv = "ID,DanaBookingID,DonorName,DanaDate,PayerName,PayerPhone,Year,Amount,Status,ReceiptUrl,ApprovedBy,CreatedAt\n";

    payments.forEach((p) => {
      const danaDate = p.danaBooking ? `${p.danaBooking.month} ${p.danaBooking.day}` : "N/A";
      const cleanDonor = `"${(p.danaBooking?.name || "").replace(/"/g, '""')}"`;
      const cleanPayer = `"${(p.payerName || "").replace(/"/g, '""')}"`;
      const cleanApprover = `"${(p.approvedBy?.name || "System").replace(/"/g, '""')}"`;

      csv += `${p.id},${p.danaBookingId},${cleanDonor},"${danaDate}",${cleanPayer},${p.payerPhone},${p.year},${p.amount},${p.status},"${p.receiptUrl}",${cleanApprover},"${new Date(p.createdAt).toISOString()}"\n`;
    });

    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename=sagaramathi_payments_${Date.now()}.csv`);
    res.status(200).send(csv);
  } catch (error) {
    console.error("Error exporting payments CSV:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get Payment Receipt Data for Instant PDF Donation Slip
export const getPaymentReceiptData = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const payment = await prisma.danaPayment.findUnique({
      where: { id: Number(id) },
      include: {
        danaBooking: true,
        approvedBy: { select: { name: true } }
      }
    });

    if (!payment) {
      res.status(404).json({ message: "Payment receipt not found" });
      return;
    }

    res.status(200).json({
      success: true,
      receiptNumber: `SP-REC-${String(payment.id).padStart(5, "0")}`,
      paymentId: payment.id,
      payerName: payment.payerName,
      payerPhone: payment.payerPhone,
      amount: payment.amount,
      amountFormatted: `රු. ${parseFloat(payment.amount).toLocaleString("en-US")}.00`,
      year: payment.year,
      status: payment.status,
      danaDetails: {
        id: payment.danaBooking.id,
        name: payment.danaBooking.name,
        month: payment.danaBooking.month,
        day: payment.danaBooking.day,
        mealType: payment.danaBooking.mealType === "MORNING" ? "හීල් දානය" : payment.danaBooking.mealType === "NOON" ? "දවල් දානය" : "ගිලන්පස",
        purpose: payment.danaBooking.purpose
      },
      issuedDate: new Date(payment.createdAt).toLocaleDateString("si-LK"),
      approvedBy: payment.approvedBy?.name || "සාගරමති පිරිවෙන් සංවර්ධන සභාව"
    });
  } catch (error) {
    console.error("Error fetching payment receipt data:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

