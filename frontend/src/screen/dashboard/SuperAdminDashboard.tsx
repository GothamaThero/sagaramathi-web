import { useEffect, useState } from "react";
import { Link } from "react-router";
import { useAuth } from "../../context/AuthContext";
import { EditDanaModal } from "../../component/EditDanaModal";
import { AnalyticsCharts } from "../../component/AnalyticsCharts";
import { AdminCalendar } from "../../component/AdminCalendar";

export const SuperAdminDashboard = () => {
  const { user, token } = useAuth();
  const [danas, setDanas] = useState<any[]>([]);
  const [editingDana, setEditingDana] = useState<any | null>(null);
  const [viewMode, setViewMode] = useState<"list" | "calendar">("list");

  useEffect(() => {
    fetchAdminDanas();
  }, []);

  const fetchAdminDanas = async () => {
    try {
      const response = await fetch("http://localhost:3000/api/dana/admin/all", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setDanas(data);
      }
    } catch (error) {
      console.error("Failed to fetch admin danas", error);
    }
  };

  const handleApprove = async (id: number, type: 'dana' | 'payment') => {
    const url = type === 'dana' ? `http://localhost:3000/api/dana/${id}/approve` : `http://localhost:3000/api/payments/${id}/approve`;
    try {
      const res = await fetch(url, { method: "PATCH", headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) fetchAdminDanas();
    } catch (error) { console.error(`Failed to approve ${type}`, error); }
  };

  const handleReject = async (id: number, type: 'dana' | 'payment') => {
    const url = type === 'dana' ? `http://localhost:3000/api/dana/${id}/reject` : `http://localhost:3000/api/payments/${id}/reject`;
    try {
      const res = await fetch(url, { method: "PATCH", headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) fetchAdminDanas();
    } catch (error) { console.error(`Failed to reject ${type}`, error); }
  };

  const handleDeleteDana = async (id: number) => {
    if (!confirm("Are you sure you want to delete this Dana?")) return;
    try {
      const res = await fetch(`http://localhost:3000/api/dana/${id}`, {
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
      alert("Failed to delete dana. Please check console.");
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-black text-brand-1 mb-2">Super Admin Dashboard</h1>
          <p className="text-subtle">Welcome, {user?.name}</p>
        </div>
        <div className="flex gap-4">
          <Link to="/users" className="bg-brand-3 hover:bg-brand-4 text-white font-bold py-2 px-6 rounded-xl shadow-lg transition-all">
            Users Management
          </Link>
          <Link to="/dana" className="bg-brand-1 hover:bg-brand-2 text-white font-bold py-2 px-6 rounded-xl shadow-lg transition-all">
            + අලුතින් දානයක් වෙන් කරන්න (Add New Dana)
          </Link>
        </div>
      </div>

      <AnalyticsCharts token={token} />

      <div className="flex justify-end gap-2 mb-4">
        <button onClick={() => setViewMode("list")} className={`px-4 py-2 rounded-xl text-sm font-bold ${viewMode === 'list' ? 'bg-brand-1 text-white' : 'bg-gray-200 text-gray-700'}`}>List View</button>
        <button onClick={() => setViewMode("calendar")} className={`px-4 py-2 rounded-xl text-sm font-bold ${viewMode === 'calendar' ? 'bg-brand-1 text-white' : 'bg-gray-200 text-gray-700'}`}>Calendar View</button>
      </div>

      {viewMode === "calendar" ? (
        <AdminCalendar danas={danas} />
      ) : (
      <div className="space-y-8">
        {danas.map(dana => (
          <div key={dana.id} className="bg-surface p-6 rounded-2xl shadow-sm border border-brand-1/10 flex flex-col md:flex-row justify-between gap-4">
            <div>
              <h3 className="font-bold text-xl">{dana.month} {dana.day} - {dana.name}</h3>
              <p className="text-sm font-semibold text-brand-2 bg-brand-1/10 inline-block px-2 py-0.5 rounded mt-1 mb-2">
                {dana.mealType === 'MORNING' ? 'හීල් දානය' : dana.mealType === 'NOON' ? 'දවල් දානය' : 'ගිලන්පස'}
              </p>
              <p className="text-sm text-subtle">Status: <span className="font-semibold text-ink">{dana.status}</span></p>
              {dana.approvedBy && <p className="text-xs text-brand-1">Approved/Rejected By: {dana.approvedBy.name}</p>}
              {dana.status === "APPROVED" && (
                <Link to={`/certificate/${dana.id}`} className="mt-2 inline-block bg-brand-3 text-white px-3 py-1 rounded text-xs font-bold">
                  Print Certificate
                </Link>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <button onClick={() => setEditingDana(dana)} className="bg-blue-100 text-blue-700 px-3 py-1 rounded-lg text-sm font-bold">Edit / Update</button>
              {dana.status === 'PENDING' && (
                <div className="flex gap-2">
                  <button onClick={() => handleApprove(dana.id, 'dana')} className="bg-green-100 text-green-700 px-3 py-1 rounded-lg text-sm font-bold w-full">Approve</button>
                  <button onClick={() => handleReject(dana.id, 'dana')} className="bg-red-100 text-red-700 px-3 py-1 rounded-lg text-sm font-bold w-full">Reject</button>
                </div>
              )}
              <button onClick={() => handleDeleteDana(dana.id)} className="bg-red-600 text-white px-3 py-1 rounded-lg text-sm font-bold">Delete Dana</button>
            </div>
          </div>
        ))}
      </div>
      )}

      {editingDana && (
        <EditDanaModal dana={editingDana} token={token} onClose={() => setEditingDana(null)} onSuccess={() => { setEditingDana(null); fetchAdminDanas(); }} />
      )}
    </div>
  );
};
