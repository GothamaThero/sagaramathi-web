import { Request, Response } from "express";
import prisma from "../config/db.js";

// Helper to get/set site settings JSON
const getSettingJson = async (key: string, defaultValue: any = []) => {
  try {
    const setting = await prisma.siteSetting.findUnique({ where: { key } });
    if (!setting) return defaultValue;
    return JSON.parse(setting.value);
  } catch (e) {
    return defaultValue;
  }
};

const setSettingJson = async (key: string, value: any) => {
  await prisma.siteSetting.upsert({
    where: { key },
    update: { value: JSON.stringify(value) },
    create: { key, value: JSON.stringify(value) }
  });
};

// 1. PUBLIC: Get Dana Booking Details by ID for Donor Mobile Confirmation Screen
export const getPublicDanaConfirmation = async (req: Request, res: Response): Promise<void> => {
  try {
    const idParam = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const bookingId = parseInt(String(idParam), 10);
    if (isNaN(bookingId)) {
      res.status(400).json({ message: "Invalid booking ID" });
      return;
    }

    const dana = await prisma.danaBooking.findUnique({
      where: { id: bookingId },
      include: { user: true }
    });

    if (!dana) {
      res.status(404).json({ message: "Dana booking not found" });
      return;
    }

    const logs = await getSettingJson("dana_confirmations_log", []);
    const existingLog = logs.find((l: any) => l.danaBookingId === bookingId);

    res.json({
      success: true,
      data: {
        id: dana.id,
        name: dana.name,
        phone: dana.phone !== "N/A" ? dana.phone : dana.user?.phone || "N/A",
        whatsapp: dana.whatsapp !== "N/A" ? dana.whatsapp : dana.user?.whatsapp || "N/A",
        address: dana.address !== "N/A" ? dana.address : dana.user?.address || "N/A",
        month: dana.month,
        day: dana.day,
        mealType: dana.mealType,
        purpose: dana.purpose,
        status: dana.status,
        confirmation: existingLog || {
          responseStatus: "PENDING",
          respondedAt: null,
          notes: ""
        }
      }
    });
  } catch (error) {
    console.error("Error fetching public dana confirmation:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// 2. PUBLIC: Donor Responds to Dana Confirmation Link (ATTENDING | BANK_TRANSFER | DECLINED)
export const respondPublicDanaConfirmation = async (req: Request, res: Response): Promise<void> => {
  try {
    const idParam = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const { responseStatus, notes } = req.body;
    const bookingId = parseInt(String(idParam), 10);

    if (isNaN(bookingId) || !["ATTENDING", "BANK_TRANSFER", "DECLINED"].includes(responseStatus)) {
      res.status(400).json({ message: "Invalid payload or response status" });
      return;
    }

    const dana = await prisma.danaBooking.findUnique({ where: { id: bookingId } });
    if (!dana) {
      res.status(404).json({ message: "Dana booking not found" });
      return;
    }

    const logs = await getSettingJson("dana_confirmations_log", []);
    const existingIndex = logs.findIndex((l: any) => l.danaBookingId === bookingId);

    const updatedLog = {
      danaBookingId: bookingId,
      donorName: dana.name,
      month: dana.month,
      day: dana.day,
      mealType: dana.mealType,
      responseStatus, // ATTENDING | BANK_TRANSFER | DECLINED
      respondedAt: new Date().toISOString(),
      notes: notes || "",
      isReadByAdmin: false
    };

    if (existingIndex >= 0) {
      logs[existingIndex] = updatedLog;
    } else {
      logs.unshift(updatedLog);
    }

    await setSettingJson("dana_confirmations_log", logs);

    // Increment unread notifications count for Admin
    const unreadObj = await getSettingJson("dana_confirm_unread", { unreadCount: 0, lastEvent: null });
    unreadObj.unreadCount += 1;
    unreadObj.lastEvent = updatedLog;
    await setSettingJson("dana_confirm_unread", unreadObj);

    res.json({
      success: true,
      message: "ස්තූතියි! ඔබේ තහවුරු කිරීම පිරිවෙන් පාලක සභාව වෙත සාර්ථකව යොමු කරන ලදී.",
      data: updatedLog
    });
  } catch (error) {
    console.error("Error updating public dana confirmation:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// 3. ADMIN: Get All Donor Confirmations & Live Unread Badge Count
export const getAdminDanaConfirmations = async (req: Request, res: Response): Promise<void> => {
  try {
    const danas = await prisma.danaBooking.findMany({
      where: { status: "APPROVED" },
      orderBy: [{ month: "asc" }, { day: "asc" }],
      include: { user: true }
    });

    const logs = await getSettingJson("dana_confirmations_log", []);
    const unreadObj = await getSettingJson("dana_confirm_unread", { unreadCount: 0, lastEvent: null });

    const combinedList = danas.map((dana) => {
      const confirmLog = logs.find((l: any) => l.danaBookingId === dana.id);
      return {
        id: dana.id,
        name: dana.name,
        phone: dana.phone !== "N/A" ? dana.phone : dana.user?.phone || "N/A",
        whatsapp: dana.whatsapp !== "N/A" ? dana.whatsapp : dana.user?.whatsapp || "N/A",
        address: dana.address !== "N/A" ? dana.address : dana.user?.address || "N/A",
        month: dana.month,
        day: dana.day,
        mealType: dana.mealType,
        purpose: dana.purpose,
        responseStatus: confirmLog ? confirmLog.responseStatus : "PENDING",
        respondedAt: confirmLog ? confirmLog.respondedAt : null,
        notes: confirmLog ? confirmLog.notes : ""
      };
    });

    res.json({
      success: true,
      unreadCount: unreadObj.unreadCount,
      lastEvent: unreadObj.lastEvent,
      data: combinedList
    });
  } catch (error) {
    console.error("Error fetching admin dana confirmations:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// 4. ADMIN: Mark Confirmations as Read by Admin
import { getAutomatedCronLogs, runAutomatedDanaRemindersCron } from "../services/cron.service.js";

// 5. ADMIN: Get Automated Dana Reminder Logs
export const getAdminAutomatedReminders = async (req: Request, res: Response): Promise<void> => {
  try {
    const logs = await getAutomatedCronLogs();
    res.json({ success: true, data: logs });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

// 6. ADMIN: Manually Trigger Automated Dana Reminders Check
export const triggerAdminAutomatedReminders = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await runAutomatedDanaRemindersCron();
    res.json({ success: true, message: "Automated reminders check executed.", result });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

