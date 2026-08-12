import React from "react";
import { Outlet, NavLink, Link, useNavigate, useLocation } from "react-router";
import { useAuth } from "../context/AuthContext";

const AdminLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const isDashboardActive = location.pathname.startsWith("/admin");

  return (
    <div className="min-h-screen bg-surface-2 flex font-sans text-ink">
      {/* Sidebar */}
      <aside className="w-64 bg-brand-10 text-white flex flex-col hidden md:flex shrink-0 shadow-xl z-20">
        <div className="p-6 border-b border-white/10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-brand-1 font-bold text-xl shadow-inner">
            S
          </div>
          <span className="font-bold text-lg tracking-wide">Sagaramathi</span>
        </div>

        <div className="p-6 pb-2">
          <p className="text-xs text-white/60 mb-1">Logged in as</p>
          <p className="font-semibold text-sm mb-2">{user?.name || "Admin User"}</p>
          <span className="inline-block px-2 py-0.5 bg-yellow-500/20 text-yellow-400 text-[10px] font-bold rounded uppercase tracking-wider border border-yellow-500/30">
            {user?.role || "SUPER ADMIN"}
          </span>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-1">
          <Link
            to="/admin/dashboard"
            className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition-colors ${
              isDashboardActive ? "bg-white/10 text-white" : "text-white/70 hover:bg-white/5 hover:text-white"
            }`}
          >
            <svg className="w-5 h-5 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
            Dashboard
          </Link>
        </nav>

        <div className="p-4 space-y-2 mt-auto border-t border-white/10">
          <Link
            to="/"
            className="flex items-center justify-center w-full px-4 py-2.5 rounded-lg border border-white/20 text-white text-sm font-semibold hover:bg-white/10 transition-colors"
          >
            Back to Website
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center justify-center w-full px-4 py-2.5 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold shadow-md transition-colors"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden bg-bg">
        {/* Top Tabs */}
        <div className="bg-surface border-b border-brand-1/10 px-6 pt-4 flex-shrink-0 z-10 shadow-sm relative">
          <div className="flex gap-1 overflow-x-auto no-scrollbar">
            <NavLink
              to="/admin/dashboard"
              className={({ isActive }) =>
                `flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-[3px] transition-colors whitespace-nowrap ${
                  isActive ? "border-brand-1 text-brand-1" : "border-transparent text-muted hover:text-ink hover:border-brand-1/30"
                }`
              }
            >
              <span className="opacity-70">📊</span> Analytics
            </NavLink>
            <NavLink
              to="/admin/users"
              className={({ isActive }) =>
                `flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-[3px] transition-colors whitespace-nowrap ${
                  isActive ? "border-brand-1 text-brand-1" : "border-transparent text-muted hover:text-ink hover:border-brand-1/30"
                }`
              }
            >
              <span className="opacity-70">👥</span> Users
            </NavLink>
            <NavLink
              to="/admin/danas"
              className={({ isActive }) =>
                `flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-[3px] transition-colors whitespace-nowrap ${
                  isActive ? "border-brand-1 text-brand-1" : "border-transparent text-muted hover:text-ink hover:border-brand-1/30"
                }`
              }
            >
              <span className="opacity-70">📝</span> Danas
            </NavLink>
            <NavLink
              to="/admin/pending-dana"
              className={({ isActive }) =>
                `flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-[3px] transition-colors whitespace-nowrap ${
                  isActive ? "border-brand-1 text-brand-1" : "border-transparent text-muted hover:text-ink hover:border-brand-1/30"
                }`
              }
            >
              <span className="opacity-70">⏳</span> Pending Dana
            </NavLink>
            <NavLink
              to="/admin/pending-payments"
              className={({ isActive }) =>
                `flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-[3px] transition-colors whitespace-nowrap ${
                  isActive ? "border-brand-1 text-brand-1" : "border-transparent text-muted hover:text-ink hover:border-brand-1/30"
                }`
              }
            >
              <span className="opacity-70">💳</span> Pending Payments
            </NavLink>
          </div>
        </div>

        {/* Page Content */}
        <div className="flex-1 overflow-auto p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
