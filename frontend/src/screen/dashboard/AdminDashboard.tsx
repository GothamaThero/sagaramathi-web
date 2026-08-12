import { useAuth } from "../../context/AuthContext";
import { AnalyticsCharts } from "../../component/AnalyticsCharts";

export const AdminDashboard = () => {
  const { user, token } = useAuth();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-surface p-6 rounded-2xl shadow-sm border border-brand-1/10">
        <div>
          <h1 className="text-2xl font-bold text-ink">Dashboard Analytics</h1>
          <p className="text-subtle text-sm">Welcome back, {user?.name}</p>
        </div>
      </div>

      <AnalyticsCharts token={token} />
    </div>
  );
};

