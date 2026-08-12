import { useEffect, useState } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface AnalyticsChartsProps {
  token: string | null;
}

export const AnalyticsCharts = ({ token }: AnalyticsChartsProps) => {
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    if (token) fetchStats();
  }, [token]);

  const fetchStats = async () => {
    try {
      const res = await fetch("http://localhost:3000/api/analytics/stats", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setStats(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch stats", error);
    }
  };

  if (!stats) return null;

  const pieData = [
    { name: "Approved", value: stats.approvedBookings },
    { name: "Pending", value: stats.pendingBookings },
    { name: "Rejected/Other", value: stats.totalBookings - stats.approvedBookings - stats.pendingBookings }
  ];

  const COLORS = ["#10b981", "#f59e0b", "#ef4444"];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* Total Users Card */}
      <div className="bg-surface p-6 rounded-xl shadow-sm border border-brand-1/10 flex flex-col justify-center min-h-[120px]">
        <h3 className="text-sm font-semibold text-subtle mb-3">මුළු පරිශීලකයින් (Total Users)</h3>
        <p className="text-3xl font-black text-ink">{stats.totalUsers || 0}</p>
      </div>
      
      {/* Total Bookings Card */}
      <div className="bg-surface p-6 rounded-xl shadow-sm border border-brand-1/10 flex flex-col justify-center min-h-[120px]">
        <h3 className="text-sm font-semibold text-subtle mb-3">මුළු දාන ප්‍රමාණය (Total Danas)</h3>
        <div className="flex items-baseline gap-2">
          <p className="text-3xl font-black text-ink">{stats.totalBookings}</p>
          <span className="text-sm font-semibold text-amber-500">{stats.pendingBookings} pending</span>
        </div>
      </div>

      {/* Income Card */}
      <div className="bg-surface p-6 rounded-xl shadow-sm border border-brand-1/10 flex flex-col justify-center min-h-[120px]">
        <h3 className="text-sm font-semibold text-subtle mb-3">මුළු ආදායම (Total Income)</h3>
        <p className="text-3xl font-black text-brand-1">Rs. {stats.totalIncome.toLocaleString()}</p>
      </div>

      {/* Approved Bookings Card */}
      <div className="bg-surface p-6 rounded-xl shadow-sm border border-brand-1/10 flex flex-col justify-center min-h-[120px]">
        <h3 className="text-sm font-semibold text-subtle mb-3">අනුමත දාන (Approved Danas)</h3>
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
