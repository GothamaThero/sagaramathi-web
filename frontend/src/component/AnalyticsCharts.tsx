import { useEffect, useState } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { API_BASE_URL } from "../libs/api";

interface AnalyticsChartsProps {
  token: string | null;
}

export const AnalyticsCharts = ({ token }: AnalyticsChartsProps) => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const activeToken = token || localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/analytics/stats`, {
        headers: { Authorization: `Bearer ${activeToken}` }
      });
      if (res.ok) {
        const data = await res.json();
        setStats(data.data);
      } else {
        setError("Failed to load dashboard statistics.");
      }
    } catch (error) {
      console.error("Failed to fetch stats", error);
      setError("Unable to connect to backend server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [token]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="bg-surface p-6 rounded-xl border border-brand-1/10 animate-pulse min-h-[120px]">
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-3"></div>
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="bg-surface p-6 rounded-xl border border-brand-1/10 text-center space-y-3">
        <p className="text-sm font-semibold text-rose-600">{error || "No data available."}</p>
        <button
          onClick={fetchStats}
          className="px-4 py-2 bg-brand-1 text-white text-xs font-bold rounded-lg shadow hover:bg-brand-2 transition-all"
        >
          Retry
        </button>
      </div>
    );
  }


  const pieData = [
    { name: "Approved", value: stats.approvedBookings },
    { name: "Pending", value: stats.pendingBookings },
    { name: "Rejected/Other", value: stats.totalBookings - stats.approvedBookings - stats.pendingBookings }
  ];

  const COLORS = ["#10b981", "#f59e0b", "#ef4444"];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
      {/* Total Users Card */}
      <div className="bg-surface p-6 rounded-xl shadow-sm border border-brand-1/10 flex flex-col justify-center min-h-[120px]">
        <h3 className="text-sm font-semibold text-subtle mb-3">Total Users</h3>
        <p className="text-3xl font-black text-ink">{stats.totalUsers || 0}</p>
      </div>
      
      {/* Total Bookings Card */}
      <div className="bg-surface p-6 rounded-xl shadow-sm border border-brand-1/10 flex flex-col justify-center min-h-[120px]">
        <h3 className="text-sm font-semibold text-subtle mb-3">Total Danas</h3>
        <div className="flex items-baseline gap-2">
          <p className="text-3xl font-black text-ink">{stats.totalBookings}</p>
          <span className="text-sm font-semibold text-amber-500">{stats.pendingBookings} pending</span>
        </div>
      </div>

      {/* Income Card */}
      <div className="bg-surface p-6 rounded-xl shadow-sm border border-brand-1/10 flex flex-col justify-center min-h-[120px]">
        <h3 className="text-sm font-semibold text-subtle mb-3">Total Income</h3>
        <p className="text-3xl font-black text-brand-1">Rs. {stats.totalIncome.toLocaleString()}</p>
      </div>

      {/* Approved Bookings Card */}
      <div className="bg-surface p-6 rounded-xl shadow-sm border border-brand-1/10 flex flex-col justify-center min-h-[120px]">
        <h3 className="text-sm font-semibold text-subtle mb-3">Approved Danas</h3>
        <p className="text-3xl font-black text-green-600">{stats.approvedBookings}</p>
      </div>

      {/* Pie Chart Card (Optional, keeping it for visual flair) */}
      <div className="bg-surface p-6 rounded-xl shadow-sm border border-brand-1/10 flex flex-col items-center justify-center min-h-[120px]">
        <div className="h-20 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                innerRadius={20}
                outerRadius={35}
                paddingAngle={5}
                dataKey="value"
              >
                {pieData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <p className="text-xs font-semibold text-subtle mt-2">Bookings Status</p>
      </div>
    </div>
  );
};
