import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { API_BASE_URL } from "../../libs/api";

export const AdminWhatsappReportsScreen: React.FC = () => {
  const { token } = useAuth();
  const [reportData, setReportData] = useState<any>(null);
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    fetchReportData();
    fetchLogs();
  }, [token]);

  const fetchReportData = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/whatsapp-reports/current`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setReportData(data);
      }
    } catch (e) {
      console.error("Error fetching whatsapp report data", e);
    } finally {
      setLoading(false);
    }
  };

  const fetchLogs = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/whatsapp-reports/logs`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setLogs(data);
      }
    } catch (e) {
      console.error("Error fetching whatsapp report logs", e);
    }
  };

  const handleSendWhatsApp = async (phone: string) => {
    if (!reportData) return;
    const cleanPhone = phone.replace(/[^0-9]/g, "");
    const formattedPhone = cleanPhone.startsWith("0") ? `94${cleanPhone.slice(1)}` : cleanPhone;
    const encodedText = encodeURIComponent(reportData.messageText);
    const waUrl = `https://wa.me/${formattedPhone}?text=${encodedText}`;

    // Record log in backend
    try {
      await fetch(`${API_BASE_URL}/whatsapp-reports/dispatch`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          phoneNumber: phone,
          period: reportData.period,
          messageText: reportData.messageText,
        }),
      });
      fetchLogs();
    } catch (e) {
      console.error("Error recording dispatch log", e);
    }

    // Open WhatsApp in new tab
    window.open(waUrl, "_blank");
  };

  const handleCopyText = () => {
    if (!reportData?.messageText) return;
    navigator.clipboard.writeText(reportData.messageText);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  if (loading) {
    return <div className="p-12 text-center text-sm font-semibold text-subtle">Loading Monthly WhatsApp Report...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-brand-1/10">
        <div>
          <h1 className="text-2xl font-black text-ink flex items-center gap-2">
            Monthly WhatsApp Reports (මාසික වාර්තා)
          </h1>
          <p className="text-xs text-subtle mt-1">
            Automated monthly financial & Dana summary report for WhatsApp dispatches.
          </p>
        </div>

        <button
          onClick={fetchReportData}
          className="px-5 py-2.5 bg-brand-1 hover:bg-brand-2 text-white font-bold text-xs rounded-xl shadow-sm transition-all"
        >
          Refresh Report Data
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-brand-1/10 shadow-sm space-y-1">
          <p className="text-xs font-bold text-subtle uppercase tracking-wider">පසුගිය මාසයේ ලැබුණු මුළු මුදල්</p>
          <p className="text-2xl font-black text-emerald-700">
            රු. {(reportData?.totalReceivedAmount || 0).toLocaleString("en-US")}.00
          </p>
          <p className="text-[11px] text-gray-500 font-semibold">{reportData?.period}</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-brand-1/10 shadow-sm space-y-1">
          <p className="text-xs font-bold text-subtle uppercase tracking-wider">අලුතින් බාරගත් දානයන්</p>
          <p className="text-2xl font-black text-brand-1">
            {reportData?.newDanasCount || 0} Danas
          </p>
          <p className="text-[11px] text-gray-500 font-semibold">Registered in previous month</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-brand-1/10 shadow-sm space-y-1">
          <p className="text-xs font-bold text-subtle uppercase tracking-wider">ගෙවා නොමැති / හිඟ දානයන්</p>
          <p className="text-2xl font-black text-amber-700">
            {reportData?.unpaidDanasCount || 0} Unpaid
          </p>
          <p className="text-[11px] text-gray-500 font-semibold">Pending payment for that month</p>
        </div>
      </div>

      {/* Report Dispatch Actions & Message Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - WhatsApp Action Buttons */}
        <div className="bg-white p-6 rounded-2xl border border-brand-1/10 shadow-sm space-y-6">
          <div>
            <h2 className="text-lg font-bold text-ink border-b pb-2">WhatsApp Direct Dispatches</h2>
            <p className="text-xs text-subtle mt-1">
              Click any button below to send the generated monthly summary report directly via WhatsApp.
            </p>
          </div>

          <div className="space-y-4">
            <button
              onClick={() => handleSendWhatsApp("0718008225")}
              className="w-full py-4 px-6 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm rounded-2xl shadow-md transition-all flex items-center justify-between group active:scale-98"
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">💬</span>
                <span className="text-left">
                  <span className="block font-bold">Send Report to 0718008225</span>
                  <span className="text-[11px] text-emerald-100 font-normal">Official WhatsApp Recipient 1</span>
                </span>
              </div>
              <span className="px-3 py-1 bg-white/20 rounded-xl text-xs font-bold group-hover:translate-x-1 transition-transform">
                Send via WhatsApp &rarr;
              </span>
            </button>

            <button
              onClick={() => handleSendWhatsApp("0705216408")}
              className="w-full py-4 px-6 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm rounded-2xl shadow-md transition-all flex items-center justify-between group active:scale-98"
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">💬</span>
                <span className="text-left">
                  <span className="block font-bold">Send Report to 0705216408</span>
                  <span className="text-[11px] text-emerald-100 font-normal">Official WhatsApp Recipient 2</span>
                </span>
              </div>
              <span className="px-3 py-1 bg-white/20 rounded-xl text-xs font-bold group-hover:translate-x-1 transition-transform">
                Send via WhatsApp &rarr;
              </span>
            </button>

            <button
              onClick={handleCopyText}
              className="w-full py-3 px-6 bg-gray-100 hover:bg-gray-200 text-ink font-bold text-xs rounded-xl transition-all border border-gray-300 flex items-center justify-center gap-2"
            >
              <span>{copied ? "✓ Copied to Clipboard!" : "📋 Copy Report Text to Clipboard"}</span>
            </button>
          </div>
        </div>

        {/* Right Column - Formatted Report Preview */}
        <div className="bg-white p-6 rounded-2xl border border-brand-1/10 shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b pb-2">
            <h2 className="text-lg font-bold text-ink">Formatted Message Preview</h2>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              Ready to Send
            </span>
          </div>

          <div className="bg-emerald-50/60 p-5 rounded-2xl border border-emerald-200 font-mono text-xs text-ink leading-relaxed whitespace-pre-wrap select-all shadow-inner">
            {reportData?.messageText || "Generating report preview..."}
          </div>
        </div>
      </div>

      {/* Dispatch History Logs */}
      <div className="bg-white p-6 rounded-2xl border border-brand-1/10 shadow-sm space-y-4">
        <h2 className="text-lg font-bold text-ink border-b pb-2">Recent Report Dispatch Logs</h2>
        {logs.length === 0 ? (
          <p className="text-xs text-subtle py-4 text-center">No past dispatch logs found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50/50 text-left font-bold text-subtle">
                  <th className="py-2.5 px-4">Recipient Phone</th>
                  <th className="py-2.5 px-4">Report Period</th>
                  <th className="py-2.5 px-4">Dispatched By</th>
                  <th className="py-2.5 px-4">Dispatched Date/Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {logs.map((log, idx) => (
                  <tr key={log.id || idx} className="hover:bg-gray-50/50">
                    <td className="py-3 px-4 font-bold text-emerald-800">{log.phoneNumber || "N/A"}</td>
                    <td className="py-3 px-4 font-semibold text-ink">{log.period || "N/A"}</td>
                    <td className="py-3 px-4 text-subtle">{log.sentBy || "Admin"}</td>
                    <td className="py-3 px-4 text-gray-500">
                      {log.sentAt ? new Date(log.sentAt).toLocaleString() : "N/A"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
