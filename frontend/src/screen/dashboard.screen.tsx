import { Navigate } from "react-router";
import { useAuth } from "../context/AuthContext";
import { UserDashboard } from "./dashboard/UserDashboard";

const DashboardScreen: React.FC = () => {
  const { user } = useAuth();

  if (user?.role === "SUPER_ADMIN" || user?.role === "ADMIN") {
    return <Navigate to="/admin" replace />;
  }

  return <UserDashboard />;
};

export default DashboardScreen;
