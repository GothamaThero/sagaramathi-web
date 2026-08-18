import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { API_BASE_URL } from "../../libs/api";

export const AdminAuditLogsScreen: React.FC = () => {
  const { token } = useAuth();
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filterAction, setFilterAction] = useState<string>("ALL");

  useEffect(() => {
    fetchAuditLogs();
  }, [token]);

  const fetchAuditLogs = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/settings/audit-logs`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const json = await res.json();
        setLogs(json.data || []);
      }
    } catch (e) {
      console.error("Error fetching audit logs", e);
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = logs.filter((log) => {
    if (filterAction === "ALL") return true;
    if (filterAction === "APPROVE") return log.action.includes("APPROVE");
    if (filterAction === "DELETE") return log.action.includes("DELETE");
    if (filterAction === "FINANCIAL") return log.action.includes("TRANSACTION") || log.action.includes("PAYMENT");
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-brand-1/10 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-ink">ආරක්ෂිත ක්‍රියාකාරකම් සටහන (Security Audit Trail)</h1>
            <span className="px-3 py-1 bg-amber-100 text-amber-900 text-xs font-bold rounded-full border border-amber-300">
              🔒 Admin Audit System
            </span>
          </div>
          <p className="text-xs text-subtle mt-1">
            පරිපාලකයින් විසින් පද්ධතියේ සිදුකළ සියලුම අනුමත කිරීම්, මකාදැමීම්, සහ මුදල් වෙනස්කම් ආරක්ෂිතව සටහන් වන ස්ථානය.
          </p>
        </div>

        <button
          onClick={fetchAuditLogs}
          className="px-4 py-2 bg-brand-1 text-white text-xs font-bold rounded-xl shadow-md transition-all active:scale-95 flex items-center gap-1"
        >
          <span>🔄</span> Refresh Logs
        </button>
      </div>

      {/* Filter Options */}
      <div className="flex flex-wrap sm:flex-nowrap gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setFilterAction("ALL")}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
            filterAction === "ALL" ? "bg-brand-1 text-white shadow-sm" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          සියල්ල (All {logs.length})
        </button>
        <button
          onClick={() => setFilterAction("APPROVE")}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
            filterAction === "APPROVE" ? "bg-emerald-700 text-white shadow-sm" : "bg-emerald-50 text-emerald-800 hover:bg-emerald-100"
          }`}
        >
          🟢 අනුමත කිරීම් (Approvals)
        </button>
        <button
          onClick={() => setFilterAction("DELETE")}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
            filterAction === "DELETE" ? "bg-red-700 text-white shadow-sm" : "bg-red-50 text-red-800 hover:bg-red-100"
          }`}
        >
          🔴 මකාදැමීම් (Deletions)
        </button>
        <button
          onClick={() => setFilterAction("FINANCIAL")}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
            filterAction === "FINANCIAL" ? "bg-blue-700 text-white shadow-sm" : "bg-blue-50 text-blue-800 hover:bg-blue-100"
          }`}
        >
          💰 මූල්‍ය ගනුදෙනු (Financials)
        </button>
      </div>

      {/* Audit Logs Table */}
      <div className="bg-white rounded-2xl border border-brand-1/10 shadow-sm overflow-hidden p-6">
        {loading ? (
          <div className="p-12 text-center text-subtle font-semibold">Audit logs ලබා ගනිමින් පවතී...</div>
        ) : filteredLogs.length === 0 ? (
          <div className="p-12 text-center text-subtle font-medium">සටහන් වූ Audit logs නොමැත.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 text-ink font-bold border-b">
                <tr>
                  <th className="p-3">ID</th>
                  <th className="p-3">දිනය & වේලාව</th>
                  <th className="p-3">සිදුකළ පුද්ගලයා</th>
                  <th className="p-3">තනතුර</th>
                  <th className="p-3">ක්‍රියාකාරකම (Action)</th>
                  <th className="p-3">ඉලක්කය (Target)</th>
                  <th className="p-3">විස්තරය (Details)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-800">
                {filteredLogs.map((log) => {
                  const isApprove = log.action.includes("APPROVE");
                  const isDelete = log.action.includes("DELETE");
                  const isCreate = log.action.includes("CREATE") || log.action.includes("RECORD");

                  return (
                    <tr key={log.id} className="hover:bg-gray-50/80 transition-all">
                      <td className="p-3 font-bold text-brand-1">#{log.id}</td>
                      <td className="p-3 font-medium text-gray-500">
                        {new Date(log.createdAt).toLocaleString("si-LK")}
                      </td>
                      <td className="p-3 font-bold text-ink">{log.userName}</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 bg-gray-100 text-gray-700 font-bold rounded text-[10px]">
                          {log.userRole}
                        </span>
                      </td>
                      <td className="p-3 font-bold">
                        {isApprove && (
                          <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-full">
                            🟢 {log.action}
                          </span>
                        )}
                        {isDelete && (
                          <span className="px-2.5 py-1 bg-red-100 text-red-800 rounded-full">
                            🔴 {log.action}
                          </span>
                        )}
                        {isCreate && (
                          <span className="px-2.5 py-1 bg-blue-100 text-blue-800 rounded-full">
                            🔵 {log.action}
                          </span>
                        )}
                        {!isApprove && !isDelete && !isCreate && (
                          <span className="px-2.5 py-1 bg-amber-100 text-amber-900 rounded-full">
                            🟡 {log.action}
                          </span>
                        )}
                      </td>
                      <td className="p-3 font-bold text-gray-700">{log.target || "-"}</td>
                      <td className="p-3 text-gray-600">{log.details || "-"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
