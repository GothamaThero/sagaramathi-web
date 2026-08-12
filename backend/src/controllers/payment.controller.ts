import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import multer from "multer";
import path from "path";
import fs from "fs";

const prisma = new PrismaClient();

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

export const createPayment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { danaBookingId, year, payerName, payerPhone, amount } = req.body;
    const receiptUrl = req.file ? `/uploads/${req.file.filename}` : "";

    if (!danaBookingId || !year || !payerName || !amount || !receiptUrl) {
      res.status(400).json({ message: "Missing required fields" });
      return;
    }

    const newPayment = await prisma.danaPayment.create({
      data: {
        danaBookingId: parseInt(danaBookingId),
        year,
        payerName,
        payerPhone,
        amount,
        receiptUrl,
        status: "PENDING",
      },
    });

    res.status(201).json({
      message: "Payment submitted successfully. Awaiting approval.",
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

    res.status(200).json({ message: "Payment rejected successfully", data: payment });
  } catch (error) {
    console.error("Error rejecting payment:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
