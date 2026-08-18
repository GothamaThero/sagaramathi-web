import React, { useEffect, useState } from "react";
import { Outlet, NavLink, Link, useNavigate, useLocation } from "react-router";
import { useAuth } from "../context/AuthContext";
import { API_BASE_URL } from "../libs/api";

const AdminLayout: React.FC = () => {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [unreadChatCount, setUnreadChatCount] = useState<number>(0);
  const [unreadConfirmCount, setUnreadConfirmCount] = useState<number>(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  useEffect(() => {
    if (!token) return;

    const fetchUnreadCounts = async () => {
      try {
        const [chatRes, confirmRes] = await Promise.all([
          fetch(`${API_BASE_URL}/chat/unread-count`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API_BASE_URL}/dana-confirm/admin/all`, { headers: { Authorization: `Bearer ${token}` } })
        ]);

        if (chatRes.ok) {
          const json = await chatRes.json();
          setUnreadChatCount(json.unreadCount || 0);
        }
        if (confirmRes.ok) {
          const json = await confirmRes.json();
          setUnreadConfirmCount(json.unreadCount || 0);
        }
      } catch (e) {
        console.error("Failed to fetch unread counts", e);
      }
    };

    fetchUnreadCounts();
    const interval = setInterval(fetchUnreadCounts, 5000);
    return () => clearInterval(interval);
  }, [token]);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    setMobileMenuOpen(false);
    logout();
    navigate("/");
  };

  const isDashboardActive = location.pathname === "/admin" || location.pathname === "/admin/dashboard";
  const isCertificatesActive = location.pathname.startsWith("/admin/certificates");
  const isTemplatesActive = location.pathname.startsWith("/admin/templates");
  const isFinanceActive = location.pathname.startsWith("/admin/finance");
  const isChatActive = location.pathname.startsWith("/admin/chat");
  const isWhatsappReportsActive = location.pathname.startsWith("/admin/whatsapp-reports");
  const isDanaConfirmationsActive = location.pathname.startsWith("/admin/dana-confirmations");

  const totalUnreadBadge = unreadChatCount + unreadConfirmCount;

  return (
    <div className="min-h-screen bg-surface-2 flex flex-col md:flex-row font-sans text-ink print:bg-white">
      {/* Mobile Top Header (Visible on screens < md) */}
      <header className="md:hidden bg-brand-10 text-white px-4 py-3 flex items-center justify-between shadow-md z-30 sticky top-0 print:hidden">
        <Link to="/admin/dashboard" className="flex items-center gap-2.5">
          <img src="/logo.png" alt="Sāgaramati Emblem" className="w-8 h-8 object-contain" />
          <div className="flex flex-col leading-none">
            <span className="font-extrabold text-base tracking-tight">Sāgaramati</span>
            <span className="text-[10px] text-yellow-400 font-bold uppercase tracking-wider">Admin Portal</span>
          </div>
        </Link>

        <div className="flex items-center gap-3">
          {totalUnreadBadge > 0 && (
            <span className="px-2 py-0.5 text-xs font-black rounded-full bg-rose-500 text-white shadow animate-pulse">
              {totalUnreadBadge} new
            </span>
          )}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle Admin Menu"
            className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white focus:outline-none transition-colors"
          >
            {mobileMenuOpen ? (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </header>

      {/* Mobile Backdrop & Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-40 flex print:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Drawer Content */}
          <aside className="relative w-4/5 max-w-xs bg-brand-10 text-white flex flex-col h-full shadow-2xl z-50 p-5 overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-white/15 mb-4">
              <div className="flex items-center gap-3">
                <img src="/logo.png" alt="Sāgaramati Emblem" className="w-9 h-9 object-contain" />
                <span className="font-extrabold text-base tracking-wide">Admin Menu</span>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-1 rounded-md text-white/70 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="p-3 bg-white/10 rounded-xl mb-4">
              <p className="text-[11px] text-white/70 mb-0.5">Logged in as</p>
              <p className="font-bold text-sm truncate">{user?.name || "Admin User"}</p>
              <span className="inline-block mt-1.5 px-2 py-0.5 bg-yellow-500/20 text-yellow-400 text-[10px] font-extrabold rounded uppercase tracking-wider border border-yellow-500/30">
                {user?.role || "SUPER ADMIN"}
              </span>
            </div>

            <nav className="space-y-1.5 flex-1">
              <Link
                to="/admin/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
                  isDashboardActive ? "bg-white/20 text-white font-bold" : "text-white/80 hover:bg-white/10"
                }`}
              >
                Dashboard
              </Link>
              <Link
                to="/admin/certificates"
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
                  isCertificatesActive ? "bg-white/20 text-white font-bold" : "text-white/80 hover:bg-white/10"
                }`}
              >
                Certificates
              </Link>
              <Link
                to="/admin/templates"
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
                  isTemplatesActive ? "bg-white/20 text-white font-bold" : "text-white/80 hover:bg-white/10"
                }`}
              >
                Template Editor
              </Link>
              <Link
                to="/admin/finance"
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
                  isFinanceActive ? "bg-white/20 text-white font-bold" : "text-white/80 hover:bg-white/10"
                }`}
              >
                Finance & Budget
              </Link>
              <Link
                to="/admin/chat"
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center justify-between px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
                  isChatActive ? "bg-white/20 text-white font-bold" : "text-white/80 hover:bg-white/10"
                }`}
              >
                <span>Chat</span>
                {unreadChatCount > 0 && (
                  <span className="px-2 py-0.5 text-xs font-black rounded-full bg-rose-500 text-white shadow">
                    {unreadChatCount}
                  </span>
                )}
              </Link>
              <Link
                to="/admin/whatsapp-reports"
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
                  isWhatsappReportsActive ? "bg-white/20 text-white font-bold" : "text-white/80 hover:bg-white/10"
                }`}
              >
                WhatsApp Reports
              </Link>
              <Link
                to="/admin/dana-confirmations"
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center justify-between px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
                  isDanaConfirmationsActive ? "bg-white/20 text-white font-bold" : "text-white/80 hover:bg-white/10"
                }`}
              >
                <span>Dana Confirmations</span>
                {unreadConfirmCount > 0 && (
                  <span className="px-2 py-0.5 text-xs font-black rounded-full bg-red-600 text-white shadow">
                    {unreadConfirmCount}
                  </span>
                )}
              </Link>
              <Link
                to="/admin/audit-logs"
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
                  location.pathname.startsWith("/admin/audit-logs") ? "bg-white/20 text-white font-bold" : "text-white/80 hover:bg-white/10"
                }`}
              >
                Audit Logs
              </Link>
            </nav>

            <div className="pt-4 border-t border-white/15 space-y-2 mt-auto">
              <Link
                to="/"
                onClick={() => setMobileMenuOpen(false)}
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
        </div>
      )}

      {/* Desktop Sidebar (Visible on screens >= md) */}
      <aside className="w-64 bg-brand-10 text-white flex flex-col hidden md:flex shrink-0 shadow-xl z-20 print:hidden">
        <div className="p-6 border-b border-white/10 flex items-center gap-3">
          <img src="/logo.png" alt="Sāgaramati Emblem" className="w-10 h-10 object-contain" />
          <span className="font-bold text-lg tracking-wide">Sāgaramati</span>
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
            className={`flex items-center px-4 py-3 rounded-lg text-sm font-semibold transition-colors ${
              isDashboardActive ? "bg-white/10 text-white" : "text-white/70 hover:bg-white/5 hover:text-white"
            }`}
          >
            Dashboard
          </Link>
          <Link
            to="/admin/certificates"
            className={`flex items-center px-4 py-3 rounded-lg text-sm font-semibold transition-colors ${
              isCertificatesActive ? "bg-white/20 text-white font-bold" : "text-white/70 hover:bg-white/5 hover:text-white"
            }`}
          >
            Certificates
          </Link>
          <Link
            to="/admin/templates"
            className={`flex items-center px-4 py-3 rounded-lg text-sm font-semibold transition-colors ${
              isTemplatesActive ? "bg-white/20 text-white font-bold" : "text-white/70 hover:bg-white/5 hover:text-white"
            }`}
          >
            Template Editor
          </Link>
          <Link
            to="/admin/finance"
            className={`flex items-center px-4 py-3 rounded-lg text-sm font-semibold transition-colors ${
              isFinanceActive ? "bg-white/20 text-white font-bold" : "text-white/70 hover:bg-white/5 hover:text-white"
            }`}
          >
            Finance & Budget
          </Link>
          <Link
            to="/admin/chat"
            className={`flex items-center justify-between px-4 py-3 rounded-lg text-sm font-semibold transition-colors ${
              isChatActive ? "bg-white/20 text-white font-bold" : "text-white/70 hover:bg-white/5 hover:text-white"
            }`}
          >
            <span>Chat</span>
            {unreadChatCount > 0 && (
              <span className="px-2 py-0.5 text-xs font-black rounded-full bg-rose-500 text-white shadow-sm animate-pulse">
                {unreadChatCount}
              </span>
            )}
          </Link>
          <Link
            to="/admin/whatsapp-reports"
            className={`flex items-center px-4 py-3 rounded-lg text-sm font-semibold transition-colors ${
              isWhatsappReportsActive ? "bg-white/20 text-white font-bold" : "text-white/70 hover:bg-white/5 hover:text-white"
            }`}
          >
            <span>WhatsApp Reports</span>
          </Link>
          <Link
            to="/admin/dana-confirmations"
            className={`flex items-center justify-between px-4 py-3 rounded-lg text-sm font-semibold transition-colors ${
              isDanaConfirmationsActive ? "bg-white/20 text-white font-bold" : "text-white/70 hover:bg-white/5 hover:text-white"
            }`}
          >
            <span>Dana Confirmations</span>
            {unreadConfirmCount > 0 && (
              <span className="px-2 py-0.5 text-xs font-black rounded-full bg-red-600 text-white shadow-sm animate-bounce">
                {unreadConfirmCount}
              </span>
            )}
          </Link>
          <Link
            to="/admin/audit-logs"
            className={`flex items-center px-4 py-3 rounded-lg text-sm font-semibold transition-colors ${
              location.pathname.startsWith("/admin/audit-logs") ? "bg-white/20 text-white font-bold" : "text-white/70 hover:bg-white/5 hover:text-white"
            }`}
          >
            <span>Audit Logs</span>
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

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 h-auto md:h-screen overflow-y-auto bg-bg print:h-auto print:overflow-visible print:bg-white">
        {/* Top Tabs Bar */}
        <div className="bg-surface border-b border-brand-1/10 px-4 sm:px-6 pt-3 flex-shrink-0 z-10 shadow-sm relative print:hidden">
          <div className="flex gap-1 overflow-x-auto custom-scrollbar pb-1">
            <NavLink
              to="/admin/dashboard"
              className={({ isActive }) =>
                `flex items-center gap-2 px-3.5 sm:px-4 py-2.5 text-xs sm:text-sm font-semibold border-b-[3px] transition-colors whitespace-nowrap ${
                  isActive ? "border-brand-1 text-brand-1 font-bold" : "border-transparent text-muted hover:text-ink hover:border-brand-1/30"
                }`
              }
            >
              Analytics
            </NavLink>
            <NavLink
              to="/admin/users"
              className={({ isActive }) =>
                `flex items-center gap-2 px-3.5 sm:px-4 py-2.5 text-xs sm:text-sm font-semibold border-b-[3px] transition-colors whitespace-nowrap ${
                  isActive ? "border-brand-1 text-brand-1 font-bold" : "border-transparent text-muted hover:text-ink hover:border-brand-1/30"
                }`
              }
            >
              Users
            </NavLink>
            <NavLink
              to="/admin/danas"
              className={({ isActive }) =>
                `flex items-center gap-2 px-3.5 sm:px-4 py-2.5 text-xs sm:text-sm font-semibold border-b-[3px] transition-colors whitespace-nowrap ${
                  isActive ? "border-brand-1 text-brand-1 font-bold" : "border-transparent text-muted hover:text-ink hover:border-brand-1/30"
                }`
              }
            >
              Danas
            </NavLink>
            <NavLink
              to="/admin/pending-dana"
              className={({ isActive }) =>
                `flex items-center gap-2 px-3.5 sm:px-4 py-2.5 text-xs sm:text-sm font-semibold border-b-[3px] transition-colors whitespace-nowrap ${
                  isActive ? "border-brand-1 text-brand-1 font-bold" : "border-transparent text-muted hover:text-ink hover:border-brand-1/30"
                }`
              }
            >
              Pending Dana
            </NavLink>
            <NavLink
              to="/admin/pending-payments"
              className={({ isActive }) =>
                `flex items-center gap-2 px-3.5 sm:px-4 py-2.5 text-xs sm:text-sm font-semibold border-b-[3px] transition-colors whitespace-nowrap ${
                  isActive ? "border-brand-1 text-brand-1 font-bold" : "border-transparent text-muted hover:text-ink hover:border-brand-1/30"
                }`
              }
            >
              Pending Payments
            </NavLink>
            <NavLink
              to="/admin/monthly-danas"
              className={({ isActive }) =>
                `flex items-center gap-2 px-3.5 sm:px-4 py-2.5 text-xs sm:text-sm font-semibold border-b-[3px] transition-colors whitespace-nowrap ${
                  isActive ? "border-brand-1 text-brand-1 font-bold" : "border-transparent text-muted hover:text-ink hover:border-brand-1/30"
                }`
              }
            >
              Monthly Danas
            </NavLink>
          </div>
        </div>

        {/* Page Content Viewport */}
        <div className="flex-1 overflow-auto p-4 sm:p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
