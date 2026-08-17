import React, { useEffect, useState } from "react";
import { Link } from "react-router";
import { useAuth } from "../../context/AuthContext";
import { EditDanaModal } from "../../component/EditDanaModal";
import { AdminPaymentModal } from "../../component/AdminPaymentModal";
import { API_BASE_URL } from "../../libs/api";
import { isSameMonth } from "../../libs/month";

export const AdminMonthlyDanasScreen: React.FC = () => {
  const { user, token } = useAuth();
  const [danas, setDanas] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedMonth, setSelectedMonth] = useState<string>("ALL");
  const [editingDana, setEditingDana] = useState<any | null>(null);
  const [viewingPaymentsDana, setViewingPaymentsDana] = useState<any | null>(null);

  const months = [
    "All Months", "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  useEffect(() => {
    fetchAdminDanas();
  }, []);

  const fetchAdminDanas = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/dana/admin/all`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setDanas(data);
      }
    } catch (error) {
      console.error("Failed to fetch admin danas", error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: number) => {
    try {
      const res = await fetch(`${API_BASE_URL}/dana/${id}/approve`, { method: "PATCH", headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) fetchAdminDanas();
    } catch (error) { console.error("Failed to approve", error); }
  };

  const handleReject = async (id: number) => {
    try {
      const res = await fetch(`${API_BASE_URL}/dana/${id}/reject`, { method: "PATCH", headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) fetchAdminDanas();
    } catch (error) { console.error("Failed to reject", error); }
  };

  const handleDeleteDana = async (id: number) => {
    if (!confirm("Are you sure you want to delete this Dana?")) return;
    try {
      const res = await fetch(`${API_BASE_URL}/dana/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        fetchAdminDanas();
      } else {
        const errorData = await res.json();
        alert(`Failed to delete: ${errorData.message}`);
      }
    } catch (error) {
      console.error("Failed to delete dana", error);
      alert("Failed to delete dana.");
    }
  };

  // Filter and sort danas by selected month and day number (1 to 31)
  const filteredDanas = (selectedMonth === "ALL" || selectedMonth === "All Months"
    ? danas
    : danas.filter((d) => isSameMonth(d.month, selectedMonth))
  ).slice().sort((a, b) => (parseInt(a.day, 10) || 0) - (parseInt(b.day, 10) || 0));

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-ink flex items-center gap-2">
            Monthly Danas
          </h1>
          <p className="text-xs text-subtle mt-1">Review Dana sponsorships grouped by month.</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Download Postal Address PDF Button */}
          <Link
            to={`/admin/monthly-addresses/${selectedMonth}`}
            className="px-5 py-3 bg-amber-600 hover:bg-amber-700 text-white text-xs sm:text-sm font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 whitespace-nowrap"
          >
            තැපැල් ලිපින PDF (Postal Address PDF)
          </Link>

          {/* Download Monthly Letters PDF Button */}
          <Link
            to={`/admin/monthly-letters/${selectedMonth}`}
            className="px-5 py-3 bg-brand-1 hover:bg-brand-2 text-white text-xs sm:text-sm font-bold rounded-xl shadow-md shadow-brand-1/25 hover:shadow-lg transition-all flex items-center justify-center gap-2 whitespace-nowrap"
          >
            Download Monthly Letters PDF
          </Link>
        </div>
      </div>

      {/* Month Filter Bar */}
      <div className="bg-surface border border-brand-1/10 rounded-2xl p-4 shadow-sm flex items-center gap-2 overflow-x-auto no-scrollbar">
        {months.map((m) => {
          const isSelected = (m === "All Months" && selectedMonth === "ALL") || selectedMonth === m;
          const count = m === "All Months" 
            ? danas.length 
            : danas.filter((d) => isSameMonth(d.month, m)).length;

          return (
            <button
              key={m}
              onClick={() => setSelectedMonth(m === "All Months" ? "ALL" : m)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
                isSelected
                  ? "bg-brand-1 text-white shadow-md shadow-brand-1/20"
                  : "bg-surface-2 hover:bg-brand-1/10 text-muted hover:text-brand-1 border border-brand-1/10"
              }`}
            >
              <span>{m}</span>
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                isSelected ? "bg-white/20 text-white" : "bg-brand-1/10 text-brand-1"
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Table Section */}
      <div className="space-y-8">
        {loading ? (
          <div className="bg-surface border border-brand-1/10 rounded-2xl overflow-hidden shadow-sm py-20 flex flex-col items-center gap-3 text-subtle">
            <span className="text-sm font-semibold">Loading data...</span>
          </div>
        ) : filteredDanas.length === 0 ? (
          <div className="bg-surface border border-brand-1/10 rounded-2xl overflow-hidden shadow-sm py-20 flex flex-col items-center gap-3 text-subtle">
            <p className="text-sm font-semibold">No Dana bookings found for the selected month</p>
          </div>
        ) : (
          <div className="bg-surface border border-brand-1/10 rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-brand-1/10 bg-surface-2/50">
                    <th className="px-5 py-3 text-left font-semibold text-subtle uppercase tracking-wider text-xs">Date</th>
                    <th className="px-5 py-3 text-left font-semibold text-subtle uppercase tracking-wider text-xs">Applicant</th>
                    <th className="px-5 py-3 text-left font-semibold text-subtle uppercase tracking-wider text-xs">Meal Type</th>
                    <th className="px-5 py-3 text-left font-semibold text-subtle uppercase tracking-wider text-xs">Status</th>
                    <th className="px-5 py-3 text-right font-semibold text-subtle uppercase tracking-wider text-xs">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-1/5">
                  {filteredDanas.map((dana) => (
                    <tr key={dana.id} className="hover:bg-brand-1/[0.01] transition-colors">
                      <td className="px-5 py-4 font-semibold text-ink whitespace-nowrap">
                        <span className="px-2.5 py-1 rounded-lg bg-brand-1/10 text-brand-1 font-bold mr-2 text-xs">
                          {dana.month}
                        </span>
                        Day {dana.day}
                      </td>
                      <td className="px-5 py-4 text-ink">
                        <div className="font-semibold">{dana.name}</div>
                        <div className="text-xs text-subtle mt-0.5">{dana.purpose}</div>
                      </td>
                      <td className="px-5 py-4">
                        <span className="inline-block px-2 py-1 bg-surface-2 text-muted text-xs font-semibold rounded border border-brand-1/10 whitespace-nowrap">
                          {dana.mealType === 'MORNING' ? 'Morning Meal (Heel Dana)' : dana.mealType === 'NOON' ? 'Midday Meal (Dawal Dana)' : 'Evening Refreshments'}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center px-2 py-1 rounded text-[11px] font-bold border whitespace-nowrap ${
                          dana.status === 'APPROVED' ? 'bg-green-50 text-green-700 border-green-200' :
                          dana.status === 'REJECTED' ? 'bg-red-50 text-red-700 border-red-200' :
                          'bg-amber-50 text-amber-700 border-amber-200'
                        }`}>
                          {dana.status}
                        </span>
                        {dana.status === "APPROVED" && (
                          <Link to={`/certificate/${dana.id}`} className="block mt-2 text-brand-1 hover:underline text-[11px] font-bold whitespace-nowrap">
                            Print Certificate
                          </Link>
                        )}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setEditingDana(dana)}
                            className="px-3 py-1 bg-white border border-blue-200 text-blue-600 hover:bg-blue-50 hover:border-blue-300 rounded text-xs font-semibold transition-colors"
                          >
                            Edit
                          </button>
                          
                          {user?.role === 'SUPER_ADMIN' && (
                            <button
                              onClick={() => handleDeleteDana(dana.id)}
                              className="px-3 py-1 bg-white border border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 rounded text-xs font-semibold transition-colors"
                            >
                              Delete
                            </button>
                          )}

                          {dana.status === 'PENDING' && (
                            <>
                              <button
                                onClick={() => handleApprove(dana.id)}
                                className="px-3 py-1 bg-white border border-green-200 text-green-600 hover:bg-green-50 hover:border-green-300 rounded text-xs font-semibold transition-colors"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => handleReject(dana.id)}
                                className="px-3 py-1 bg-white border border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 rounded text-xs font-semibold transition-colors"
                              >
                                Reject
                              </button>
                            </>
                          )}

                          <button
                            onClick={() => setViewingPaymentsDana(dana)}
                            className="px-3 py-1 bg-white border border-orange-200 text-orange-600 hover:bg-orange-50 hover:border-orange-300 rounded text-xs font-semibold transition-colors"
                          >
                            View Payments
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {editingDana && (
        <EditDanaModal dana={editingDana} token={token} onClose={() => setEditingDana(null)} onSuccess={() => { setEditingDana(null); fetchAdminDanas(); }} />
      )}

      {/* View/Edit Payments Modal */}
      {viewingPaymentsDana !== null && (
        <AdminPaymentModal
          dana={viewingPaymentsDana}
          token={token}
          onClose={() => setViewingPaymentsDana(null)}
          onRefresh={() => {
            fetchAdminDanas();
            setViewingPaymentsDana(null);
          }}
        />
      )}
    </div>
  );
};
