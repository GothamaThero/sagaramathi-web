import { Response } from "express";
import prisma from "../config/db.js";

function getPreviousMonthRange() {
  const now = new Date();
  const prevMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const startOfPrevMonth = new Date(prevMonthDate.getFullYear(), prevMonthDate.getMonth(), 1);
  const endOfPrevMonth = new Date(prevMonthDate.getFullYear(), prevMonthDate.getMonth() + 1, 0, 23, 59, 59, 999);
  
  const monthNamesEn = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  const monthNamesSi = [
    "ජනවාරි", "පෙබරවාරි", "මාර්තු", "අප්‍රේල්", "මැයි", "ජූනි",
    "ජූලි", "අගෝස්තු", "සැප්තැම්බර්", "ඔක්තෝබර්", "නොවැම්බර්", "දෙසැම්බර්"
  ];

  const prevMonthIndex = prevMonthDate.getMonth();
  return {
    start: startOfPrevMonth,
    end: endOfPrevMonth,
    monthEn: monthNamesEn[prevMonthIndex],
    monthSi: monthNamesSi[prevMonthIndex],
    year: prevMonthDate.getFullYear(),
  };
}

export const getCurrentMonthlyReport = async (req: any, res: Response): Promise<void> => {
  try {
    const prev = getPreviousMonthRange();

    // 1. Total Payments Received in Previous Month
    const approvedPayments = await prisma.danaPayment.findMany({
      where: {
        status: "APPROVED",
        createdAt: {
          gte: prev.start,
          lte: prev.end,
        },
      },
      include: {
        danaBooking: true,
      },
    });

    const totalReceivedAmount = approvedPayments.reduce((sum: number, p: any) => {
      const val = parseFloat(p.amount) || 0;
      return sum + val;
    }, 0);

    // 2. Newly Booked Danas in Previous Month
    const newDanas = await prisma.danaBooking.findMany({
      where: {
        createdAt: {
          gte: prev.start,
          lte: prev.end,
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // 3. Unpaid / Pending Danas for Previous Month
    const allPrevMonthDanas = await prisma.danaBooking.findMany({
      where: {
        status: { not: "REJECTED" },
        OR: [
          { month: prev.monthEn },
          { month: prev.monthSi },
        ],
      },
      include: {
        payments: {
          where: { status: "APPROVED" },
        },
      },
    });

    const unpaidDanas = allPrevMonthDanas.filter((d: any) => {
      const paidSum = d.payments.reduce((acc: number, p: any) => acc + (parseFloat(p.amount) || 0), 0);
      return paidSum < 5000;
    });

    // Construct WhatsApp Formatted Message Text
    let msg = `📜 *සාගරමති පිරිවෙන - මාසික වාර්තාව (${prev.monthSi} / ${prev.monthEn} ${prev.year})*\n`;
    msg += `------------------------------------\n\n`;
    
    msg += `💰 *පසුගිය මාසයේ ලැබුණු මුළු ආධාර/මුදල්:* \nරු. ${totalReceivedAmount.toLocaleString("en-US")}.00\n\n`;

    msg += `🍱 *අලුතින් බාරගත් දානයන් (${newDanas.length}):*\n`;
    if (newDanas.length === 0) {
      msg += `• පසුගිය මාසයේ අලුතින් දානයන් ලියාපදිංචි වී නොමැත.\n`;
    } else {
      newDanas.forEach((d: any, idx: number) => {
        const meal = d.mealType === "MORNING" ? "හීල් දානය" : d.mealType === "NOON" ? "දවල් දානය" : "ගිලන්පස";
        msg += `${idx + 1}. ${d.name} - ${d.month} Day ${d.day} (${meal})\n`;
      });
    }
    msg += `\n`;

    msg += `⚠️ *මුදල් ගෙවා නොමැති / හිඟ දානයන් (${unpaidDanas.length}):*\n`;
    if (unpaidDanas.length === 0) {
      msg += `• මෙම මාසයේ හිඟ මුදල් සහිත දානයන් නොමැත.\n`;
    } else {
      unpaidDanas.forEach((d: any, idx: number) => {
        const paid = d.payments.reduce((acc: number, p: any) => acc + (parseFloat(p.amount) || 0), 0);
        const due = 5000 - paid;
        msg += `${idx + 1}. ${d.name} - ${d.month} Day ${d.day} (ගෙවා ඇති: රු.${paid} / හිඟ: රු.${due})\n`;
      });
    }

    msg += `\n------------------------------------\n`;
    msg += `📞 සාගරමති පිරිවෙන් සංවර්ධන සභාව\n`;
    msg += `WhatsApp: 0718008225 / 0705216408`;

    res.status(200).json({
      period: `${prev.monthSi} (${prev.monthEn}) ${prev.year}`,
      totalReceivedAmount,
      newDanasCount: newDanas.length,
      unpaidDanasCount: unpaidDanas.length,
      newDanas,
      unpaidDanas,
      messageText: msg,
      phoneNumbers: ["0718008225", "0705216408"],
    });
  } catch (error) {
    console.error("Error generating monthly report:", error);
    res.status(500).json({ message: "Failed to generate monthly report" });
  }
};

export const recordDispatchLog = async (req: any, res: Response): Promise<void> => {
  try {
    const { phoneNumber, period, messageText } = req.body;
    const logKey = `report_log_${Date.now()}`;
    const logValue = JSON.stringify({
      phoneNumber,
      period,
      sentAt: new Date().toISOString(),
      sentBy: req.user?.name || "Admin",
      messageText: messageText ? messageText.substring(0, 150) + "..." : "",
    });

    await prisma.siteSetting.create({
      data: {
        key: logKey,
        value: logValue,
      },
    });

    res.status(200).json({ message: "Dispatch log recorded successfully" });
  } catch (error) {
    console.error("Error recording dispatch log:", error);
    res.status(500).json({ message: "Failed to record dispatch log" });
  }
};

export const getReportLogs = async (req: any, res: Response): Promise<void> => {
  try {
    const logs = await prisma.siteSetting.findMany({
      where: {
        key: { startsWith: "report_log_" },
      },
      orderBy: { id: "desc" },
      take: 20,
    });

    const parsedLogs = logs.map((l: any) => {
      try {
        return { id: l.id, ...JSON.parse(l.value) };
      } catch {
        return { id: l.id, value: l.value };
      }
    });

    res.status(200).json(parsedLogs);
  } catch (error) {
    console.error("Error fetching report logs:", error);
    res.status(500).json({ message: "Failed to fetch report logs" });
  }
};
