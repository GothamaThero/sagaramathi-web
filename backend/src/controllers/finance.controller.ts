import { Request, Response } from "express";
import prisma from "../config/db.js";
import { logAuditAction } from "../services/audit.service.js";

// Helper to fetch all financial items (Transactions + Approved Dana Payments)
const getAllFinancialItems = async () => {
  const manualTx = await prisma.financialTransaction.findMany({
    orderBy: { date: "desc" }
  });

  const approvedPayments = await prisma.danaPayment.findMany({
    where: { status: "APPROVED" },
    orderBy: { createdAt: "desc" }
  });

  const paymentTx = approvedPayments.map(p => {
    const rawAmount = String(p.amount || "");
    const amountNum = parseFloat(rawAmount.replace(/[^0-9.-]+/g, "")) || 0;
    return {

      id: `PAY-${p.id}`,
      date: p.createdAt,
      description: `දායකත්ව තැන්පතුව - ${p.payerName} (${p.year})`,
      type: "INCOME" as const,
      amount: amountNum,
      recordedBy: "System (Payment Approved)",
      createdAt: p.createdAt
    };
  });

  return [...manualTx, ...paymentTx].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

// GET /api/finance/summary
export const getFinanceSummary = async (req: Request, res: Response): Promise<void> => {
  try {
    const now = new Date();
    
    // Start/End of Today
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

    // Start/End of This Month
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    // Start/End of This Year
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const endOfYear = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);

    const allTx = await getAllFinancialItems();

    const calcStats = (txList: typeof allTx) => {
      let income = 0;
      let expense = 0;

      txList.forEach(t => {
        if (t.type === "INCOME") income += t.amount;
        else if (t.type === "EXPENSE") expense += t.amount;
      });

      return { income, expense };
    };

    const todayTx = allTx.filter(t => new Date(t.date) >= startOfToday && new Date(t.date) <= endOfToday);
    const monthTx = allTx.filter(t => new Date(t.date) >= startOfMonth && new Date(t.date) <= endOfMonth);
    const yearTx = allTx.filter(t => new Date(t.date) >= startOfYear && new Date(t.date) <= endOfYear);

    res.status(200).json({
      status: "success",
      data: {
        today: calcStats(todayTx),
        month: calcStats(monthTx),
        year: calcStats(yearTx)
      }
    });
  } catch (error) {
    console.error("Error fetching finance summary:", error);
    res.status(500).json({ status: "error", message: "Failed to fetch summary" });
  }
};

// GET /api/finance/transactions
export const getAllTransactions = async (req: Request, res: Response): Promise<void> => {
  try {
    const transactions = await getAllFinancialItems();

    res.status(200).json({
      status: "success",
      data: transactions
    });
  } catch (error) {
    console.error("Error fetching transactions:", error);
    res.status(500).json({ status: "error", message: "Failed to fetch transactions" });
  }
};

// POST /api/finance/transactions
export const recordTransaction = async (req: Request, res: Response): Promise<void> => {
  try {
    const { description, type, amount, date } = req.body;

    if (!description || !type || !amount) {
      res.status(400).json({ status: "error", message: "Missing required fields (description, type, amount)" });
      return;
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      res.status(400).json({ status: "error", message: "Invalid transaction amount" });
      return;
    }

    const recordedUser = (req as any).user;
    const recordedByName = recordedUser?.name || "Super Admin";
    const rawUserId = recordedUser?.userId || recordedUser?.id;
    const userId = rawUserId ? parseInt(rawUserId, 10) : null;

    const newTx = await prisma.financialTransaction.create({
      data: {
        description,
        type, // INCOME, EXPENSE, INVESTMENT
        amount: numAmount,
        date: date ? new Date(date) : new Date(),
        recordedBy: recordedByName,
        userId: userId && !isNaN(userId) ? userId : undefined
      }
    });

    await logAuditAction({
      userId: userId || undefined,
      userName: recordedByName,
      userRole: recordedUser?.role || "ADMIN",
      action: "RECORD_FINANCIAL_TRANSACTION",
      target: `Transaction #${newTx.id}`,
      details: `Recorded ${type} of LKR ${numAmount} - ${description}`,
      ipAddress: req.ip,
    });

    res.status(201).json({
      status: "success",
      data: newTx
    });
  } catch (error) {
    console.error("Error recording transaction:", error);
    res.status(500).json({ status: "error", message: "Failed to record transaction" });
  }
};

// DELETE /api/finance/transactions/:id
export const deleteTransaction = async (req: Request, res: Response): Promise<void> => {
  try {
    const idParam = req.params.id;
    const idStr = Array.isArray(idParam) ? idParam[0] : idParam;
    const txId = parseInt(idStr, 10);

    if (isNaN(txId)) {
      res.status(400).json({ status: "error", message: "Invalid transaction ID" });
      return;
    }

    const txToDel = await prisma.financialTransaction.findUnique({ where: { id: txId } });

    await prisma.financialTransaction.delete({
      where: { id: txId }
    });

    const recordedUser = (req as any).user;

    await logAuditAction({
      userId: recordedUser?.userId,
      userName: recordedUser?.name || "Super Admin",
      userRole: recordedUser?.role || "SUPER_ADMIN",
      action: "DELETE_FINANCIAL_TRANSACTION",
      target: `Transaction #${txId}`,
      details: `Deleted Transaction #${txId} (${txToDel?.description})`,
      ipAddress: req.ip,
    });

    res.status(200).json({
      status: "success",
      message: "Transaction deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting transaction:", error);
    res.status(500).json({ status: "error", message: "Failed to delete transaction" });
  }
};

// GET /api/finance/reports?period=DAILY|WEEKLY|MONTHLY|YEARLY
export const getGroupedReport = async (req: Request, res: Response): Promise<void> => {
  try {
    const periodStr = typeof req.query.period === "string" ? req.query.period : "DAILY";
    const period = periodStr;
    const transactions = await getAllFinancialItems();

    const groups: { [key: string]: { period: string; totalIncome: number; totalExpense: number; netBalance: number } } = {};

    transactions.forEach(t => {
      const d = new Date(t.date);
      let key = "";

      if (period === "DAILY") {
        key = d.toISOString().split("T")[0]; // YYYY-MM-DD
      } else if (period === "WEEKLY") {
        // Calculate week string
        const firstDayOfYear = new Date(d.getFullYear(), 0, 1);
        const pastDaysOfYear = (d.getTime() - firstDayOfYear.getTime()) / 86400000;
        const weekNum = Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
        key = `${d.getFullYear()}-W${weekNum < 10 ? '0' + weekNum : weekNum}`;
      } else if (period === "MONTHLY") {
        key = `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}`;
      } else if (period === "YEARLY") {
        key = `${d.getFullYear()}`;
      }

      if (!groups[key]) {
        groups[key] = {
          period: key,
          totalIncome: 0,
          totalExpense: 0,
          netBalance: 0
        };
      }

      if (t.type === "INCOME") groups[key].totalIncome += t.amount;
      else if (t.type === "EXPENSE") groups[key].totalExpense += t.amount;

      groups[key].netBalance = groups[key].totalIncome - groups[key].totalExpense;
    });

    const reportList = Object.values(groups).sort((a, b) => b.period.localeCompare(a.period));

    res.status(200).json({
      status: "success",
      data: reportList
    });
  } catch (error) {
    console.error("Error generating grouped report:", error);
    res.status(500).json({ status: "error", message: "Failed to generate report" });
  }
};

// GET /api/finance/export/csv
export const exportFinanceCSV = async (req: Request, res: Response): Promise<void> => {
  try {
    const transactions = await getAllFinancialItems();

    let csv = "ID,Date,Description,Type,Amount,RecordedBy\n";

    transactions.forEach((t) => {
      const cleanDesc = `"${(t.description || "").replace(/"/g, '""')}"`;
      const cleanRec = `"${(t.recordedBy || "").replace(/"/g, '""')}"`;
      const formattedDate = `"${new Date(t.date).toISOString()}"`;

      csv += `${t.id},${formattedDate},${cleanDesc},${t.type},${t.amount},${cleanRec}\n`;
    });

    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename=sagaramathi_finance_${Date.now()}.csv`);
    res.status(200).send(csv);
  } catch (error) {
    console.error("Error exporting finance CSV:", error);
    res.status(500).json({ status: "error", message: "Failed to export finance CSV" });
  }
};

