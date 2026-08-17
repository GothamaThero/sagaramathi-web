import React, { useEffect, useState } from "react";
import { Link } from "react-router";
import { useAuth } from "../../context/AuthContext";
import { RecordTransactionModal } from "../../component/RecordTransactionModal";
import { API_BASE_URL } from "../../libs/api";

const BuddhistFlagSVG = () => (
  <svg className="w-16 h-11 sm:w-24 sm:h-16 shadow-md rounded border border-gray-300 inline-block shrink-0" viewBox="0 0 60 40">
    <rect x="0" y="0" width="10" height="40" fill="#003594" />
    <rect x="10" y="0" width="10" height="40" fill="#FFD100" />
    <rect x="20" y="0" width="10" height="40" fill="#D21034" />
    <rect x="30" y="0" width="10" height="40" fill="#FFFFFF" stroke="#E5E7EB" strokeWidth="0.5" />
    <rect x="40" y="0" width="10" height="40" fill="#FF6700" />
    <g transform="translate(50, 0)">
      <rect x="0" y="0" width="10" height="8" fill="#003594" />
      <rect x="0" y="8" width="10" height="8" fill="#FFD100" />
      <rect x="0" y="16" width="10" height="8" fill="#D21034" />
      <rect x="0" y="24" width="10" height="8" fill="#FFFFFF" stroke="#E5E7EB" strokeWidth="0.5" />
      <rect x="0" y="32" width="10" height="8" fill="#FF6700" />
    </g>
  </svg>
);

export const AdminFinanceScreen: React.FC = () => {
  const { token } = useAuth();
  const [activeTab, setActiveTab] = useState<"history" | "grouped">("grouped");
  const [summary, setSummary] = useState<{
    today: { income: number; expense: number };
    month: { income: number; expense: number };
    year: { income: number; expense: number };
  }>({
    today: { income: 0, expense: 0 },
    month: { income: 0, expense: 0 },
    year: { income: 0, expense: 0 }
  });

  const [transactions, setTransactions] = useState<any[]>([]);
  const [reportPeriod, setReportPeriod] = useState<"DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY">("MONTHLY");
  const [groupedReports, setGroupedReports] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  useEffect(() => {
    fetchData();
  }, [token]);

  useEffect(() => {
    if (activeTab === "grouped") {
      fetchGroupedReport(reportPeriod);
    }
  }, [activeTab, reportPeriod, token]);

  const fetchData = async () => {
    try {
      setLoading(true);
      await Promise.all([fetchSummary(), fetchTransactions(), fetchGroupedReport(reportPeriod)]);
    } catch (e) {
      console.error("Error loading finance data", e);
    } finally {
      setLoading(false);
    }
  };

  const fetchSummary = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/finance/summary`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const json = await res.json();
        setSummary(json.data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchTransactions = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/finance/transactions`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const json = await res.json();
        setTransactions(json.data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchGroupedReport = async (period: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/finance/reports?period=${period}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const json = await res.json();
        setGroupedReports(json.data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (id: string | number) => {
    if (typeof id === "string" && id.startsWith("PAY-")) {
      alert("This transaction is an approved sponsorship payment. Use Pending Payments to manage it.");
      return;
    }
    if (!window.confirm("Are you sure you want to delete this transaction?")) {
      return;
    }
    try {
      const res = await fetch(`${API_BASE_URL}/finance/transactions/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        fetchData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const formatCurrency = (val: number) => {
    return `LKR ${val.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
  };

  const formatDisplayDate = (dateStr: string) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const getPeriodTitle = () => {
    if (reportPeriod === "DAILY") return "Daily Income & Expense Financial Report";
    if (reportPeriod === "WEEKLY") return "Weekly Income & Expense Financial Report";
    if (reportPeriod === "MONTHLY") return "Monthly Income & Expense Financial Report";
    return "Yearly Income & Expense Financial Report";
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12 print:pb-0 print:space-y-4">
      {/* Print Specific CSS */}
      <style>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 12mm;
          }
          body {
            background-color: white !important;
            color: black !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }
      `}</style>

      {/* Screen Top Header (Hidden on Print) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-brand-1/10 print:hidden">
        <div>
          <h1 className="text-2xl font-black text-ink flex items-center gap-2">
            Finance & Budget
          </h1>
          <p className="text-xs text-subtle mt-1">
            Manage daily income and expenses.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => window.open(`${API_BASE_URL}/finance/export/csv`, "_blank")}
            className="px-4 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white text-xs sm:text-sm font-bold rounded-xl shadow-sm transition-all"
          >
            📊 Export CSV
          </button>
          <Link
            to="/admin/monthly-report/ALL"
            className="px-6 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-800 text-xs sm:text-sm font-extrabold rounded-full border border-rose-200 shadow-sm transition-all whitespace-nowrap active:scale-95"
          >
            All Sponsorships & Payments Report <span className="font-black text-rose-900">PDF</span>
          </Link>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-bold rounded-xl shadow-md transition-all shrink-0"
          >
            Record Transaction
          </button>
        </div>
      </div>


      {/* Screen Top 3 Summary Cards (Hidden on Print) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 print:hidden">
        {/* Today's Summary */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-brand-1/10 space-y-3">
          <p className="text-xs font-bold uppercase tracking-wider text-gray-400">TODAY'S SUMMARY</p>
          <div className="space-y-2 text-sm font-bold">
            <div className="flex justify-between items-center">
              <span className="flex items-center gap-1.5 text-gray-600">
                Income
              </span>
              <span className="text-emerald-600">{formatCurrency(summary.today.income)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="flex items-center gap-1.5 text-gray-600">
                Expense
              </span>
              <span className="text-rose-600">{formatCurrency(summary.today.expense)}</span>
            </div>
          </div>
        </div>

        {/* This Month */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-brand-1/10 space-y-3">
          <p className="text-xs font-bold uppercase tracking-wider text-gray-400">THIS MONTH</p>
          <div className="space-y-2 text-sm font-bold">
            <div className="flex justify-between items-center">
              <span className="flex items-center gap-1.5 text-gray-600">
                Income
              </span>
              <span className="text-emerald-600">{formatCurrency(summary.month.income)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="flex items-center gap-1.5 text-gray-600">
                Expense
              </span>
              <span className="text-rose-600">{formatCurrency(summary.month.expense)}</span>
            </div>
          </div>
        </div>

        {/* This Year */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-brand-1/10 space-y-3">
          <p className="text-xs font-bold uppercase tracking-wider text-gray-400">THIS YEAR</p>
          <div className="space-y-2 text-sm font-bold">
            <div className="flex justify-between items-center">
              <span className="flex items-center gap-1.5 text-gray-600">
                Income
              </span>
              <span className="text-emerald-600">{formatCurrency(summary.year.income)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="flex items-center gap-1.5 text-gray-600">
                Expense
              </span>
              <span className="text-rose-600">{formatCurrency(summary.year.expense)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Screen Tabs Header (Hidden on Print) */}
      <div className="border-b border-gray-200 flex gap-6 text-sm font-bold text-gray-500 pt-2 print:hidden">
        <button
          onClick={() => setActiveTab("history")}
          className={`pb-3 flex items-center gap-2 transition-all border-b-2 ${
            activeTab === "history"
              ? "border-emerald-700 text-emerald-800"
              : "border-transparent hover:text-ink"
          }`}
        >
          Transaction History
        </button>
        <button
          onClick={() => setActiveTab("grouped")}
          className={`pb-3 flex items-center gap-2 transition-all border-b-2 ${
            activeTab === "grouped"
              ? "border-emerald-700 text-emerald-800"
              : "border-transparent hover:text-ink"
          }`}
        >
          Grouped Financial Reports
        </button>
      </div>

      {/* TAB 1: TRANSACTION HISTORY (Hidden on Print) */}
      {activeTab === "history" && (
        <div className="bg-white rounded-2xl shadow-sm border border-brand-1/10 overflow-hidden print:hidden">
          {loading ? (
            <div className="p-12 text-center text-subtle text-sm">Loading transactions...</div>
          ) : transactions.length === 0 ? (
            <div className="p-12 text-center text-subtle text-sm">
              No transactions recorded yet. Use the "Record Transaction" button above to add transactions.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 border-b border-gray-200 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4">Description</th>
                    <th className="px-6 py-4">Type</th>
                    <th className="px-6 py-4">Recorded By</th>
                    <th className="px-6 py-4 text-right">Amount</th>
                    <th className="px-6 py-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-medium">
                  {transactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-gray-50/80 transition-colors">
                      <td className="px-6 py-4 text-gray-600 whitespace-nowrap">{formatDisplayDate(tx.date)}</td>
                      <td className="px-6 py-4 text-ink font-semibold">{tx.description}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {tx.type === "INCOME" && (
                          <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-black rounded-full border border-emerald-300 uppercase">
                            INCOME
                          </span>
                        )}
                        {tx.type === "EXPENSE" && (
                          <span className="inline-flex items-center gap-1 px-3 py-1 bg-rose-100 text-rose-800 text-xs font-black rounded-full border border-rose-300 uppercase">
                            EXPENSE
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-gray-600 whitespace-nowrap">{tx.recordedBy}</td>
                      <td
                        className={`px-6 py-4 text-right font-black whitespace-nowrap ${
                          tx.type === "INCOME" ? "text-emerald-700" : "text-rose-700"
                        }`}
                      >
                        {formatCurrency(tx.amount)}
                      </td>
                      <td className="px-6 py-4 text-center whitespace-nowrap">
                        <button
                          onClick={() => handleDelete(tx.id)}
                          className="px-3 py-1 text-xs font-bold text-rose-600 hover:text-white hover:bg-rose-600 rounded-lg border border-rose-200 transition-all"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: GROUPED FINANCIAL REPORTS */}
      {activeTab === "grouped" && (
        <div className="space-y-6 print:space-y-4">
          {/* Controls: Filter & Print (Hidden on Print) */}
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-brand-1/10 flex flex-wrap items-center justify-between gap-4 print:hidden">
            <div className="flex items-center gap-2">
              {(["DAILY", "WEEKLY", "MONTHLY", "YEARLY"] as const).map((period) => (
                <button
                  key={period}
                  onClick={() => setReportPeriod(period)}
                  className={`px-4 py-2 text-xs font-black rounded-xl uppercase transition-all ${
                    reportPeriod === period
                      ? "bg-emerald-800 text-white shadow-md"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {period}
                </button>
              ))}
            </div>

            <button
              onClick={() => window.print()}
              className="px-5 py-2.5 bg-brand-1 hover:bg-brand-2 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-2"
            >
              Print / Export PDF
            </button>
          </div>

          {/* OFFICIAL FORMAL PRINTABLE REPORT FRAME */}
          <div className="bg-white rounded-2xl shadow-sm border border-brand-1/10 overflow-hidden p-0 print:border-4 print:border-double print:border-brand-1/50 print:p-6 print:rounded-2xl">
            {/* Formal Printable Header (Visible Only on Print) */}
            <div className="hidden print:block mb-6 pb-4 border-b-2 border-brand-1">
              <div className="flex items-center justify-between gap-4">
                <BuddhistFlagSVG />
                <div className="text-center flex-1">
                  <img src="/logo.png" alt="Logo" className="w-24 h-24 object-contain mx-auto mb-1" />
                  <h1 className="text-xl font-black text-brand-1 tracking-wide">
                    Sagaramati Pirivena Development Council
                  </h1>
                  <h2 className="text-xs font-bold text-ink mt-0.5">
                    Dhananjaya Rajamaha Viharaya, Kandegama, Polonnaruwa
                  </h2>
                  <p className="text-[11px] font-bold text-gray-700 mt-2 bg-gray-100 py-1 px-3 rounded-full inline-block border border-gray-300">
                    {getPeriodTitle()}
                  </p>
                </div>
                <BuddhistFlagSVG />
              </div>
              <div className="flex justify-between items-center text-[10px] text-gray-500 font-bold mt-4 pt-2 border-t border-gray-200">
                <span>Financial Report | Sagaramati Pirivena</span>
                <span>Issued Date: {new Date().toLocaleDateString('en-GB')}</span>
              </div>
            </div>

            {/* Financial Data Table */}
            {groupedReports.length === 0 ? (
              <div className="p-12 text-center text-subtle text-sm">No financial records found for the selected period.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm print:text-xs">
                  <thead className="bg-gray-50 border-b border-gray-200 text-xs print:text-[11px] font-bold text-gray-700 uppercase tracking-wider">
                    <tr>
                      <th className="px-6 py-3.5 print:px-4 print:py-2">Period</th>
                      <th className="px-6 py-3.5 print:px-4 print:py-2 text-emerald-700">Total Income</th>
                      <th className="px-6 py-3.5 print:px-4 print:py-2 text-rose-700">Total Expense</th>
                      <th className="px-6 py-3.5 print:px-4 print:py-2 text-right">Net Balance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 font-semibold">
                    {groupedReports.map((item, idx) => (
                      <tr key={idx} className="hover:bg-gray-50/80 transition-colors">
                        <td className="px-6 py-3.5 print:px-4 print:py-2 font-bold text-ink whitespace-nowrap">{item.period}</td>
                        <td className="px-6 py-3.5 print:px-4 print:py-2 text-emerald-700 font-bold whitespace-nowrap">{formatCurrency(item.totalIncome)}</td>
                        <td className="px-6 py-3.5 print:px-4 print:py-2 text-rose-700 font-bold whitespace-nowrap">{formatCurrency(item.totalExpense)}</td>
                        <td
                          className={`px-6 py-3.5 print:px-4 print:py-2 text-right font-black whitespace-nowrap ${
                            item.netBalance >= 0 ? "text-emerald-800" : "text-rose-800"
                          }`}
                        >
                          {formatCurrency(item.netBalance)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Formal Printable Footer & Signatures (Visible Only on Print) */}
            <div className="hidden print:block mt-12 pt-6 border-t border-gray-300">
              <div className="grid grid-cols-3 gap-6 text-center text-[11px] font-bold text-ink mb-6">
                <div>
                  <div className="border-b border-dotted border-gray-400 pb-8 mb-1"></div>
                  <p>Venerable President Monk</p>
                </div>
                <div>
                  <div className="border-b border-dotted border-gray-400 pb-8 mb-1"></div>
                  <p>Venerable Secretary Monk</p>
                </div>
                <div>
                  <div className="border-b border-dotted border-gray-400 pb-8 mb-1"></div>
                  <p>Venerable Treasurer Monk</p>
                </div>
              </div>

              <div className="text-center pt-3 border-t border-brand-1/20 text-[11px] font-bold text-brand-1">
                Sagaramati Monastic Development Council
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Record Transaction Modal */}
      <RecordTransactionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchData}
        token={token || ""}
      />
    </div>
  );
};
