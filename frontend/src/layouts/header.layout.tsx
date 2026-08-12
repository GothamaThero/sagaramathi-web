import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { useAuth } from "../context/AuthContext";

const HeaderLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks = [
    { name: "මුල් පිටුව", path: "/" },
    { name: "දානය භාර ගැනීම", path: "/dana" },
    { name: "අප ගැන", path: "/about" },
  ];

  return (
    <header className="bg-ink border-b border-brand-1/20 sticky top-0 z-40 shadow-sm">
      <div className="max-w-[1400px] mx-auto px-6 h-20 flex items-center justify-between">

        {/* Left: Brand */}
        <Link to="/" className="flex items-center gap-4 group">
          <div className="w-12 h-12 rounded-full bg-white border-2 border-brand-1 flex items-center justify-center text-brand-1 font-black text-xl shadow-md group-hover:scale-105 transition-transform">
            S
          </div>
          <div className="flex flex-col leading-none">
            <span className="text-white font-bold text-lg tracking-tight">Sagaramathi</span>
            <span className="text-brand-1 text-xs font-semibold tracking-widest uppercase mt-1">Pirivena</span>
          </div>
        </Link>

        {/* Center: Navigation Links */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`text-sm font-semibold transition-colors ${
                  isActive ? "text-brand-1" : "text-white/80 hover:text-white"
                }`}
              >
                {link.name}
              </Link>
            );
          })}
          
          {/* Outlined buttons in center for logged out users (matches Join/Contact from screenshot) */}
          {!user && (
            <div className="flex items-center gap-4 ml-4">
              <Link
                to="/register"
                className="px-5 py-2 text-sm font-semibold text-white/90 hover:text-white border border-white/20 hover:border-white/50 rounded-full transition-all"
              >
                ලියාපදිංචි වන්න
              </Link>
              <Link
                to="/login"
                className="px-5 py-2 text-sm font-semibold text-white/90 hover:text-white border border-white/20 hover:border-white/50 rounded-full transition-all"
              >
                ඇතුළු වන්න
              </Link>
            </div>
          )}
        </nav>

        {/* Right: Dashboard & Logout */}
        <div className="hidden md:flex items-center gap-6">
          {user ? (
            <>
              <Link
                to={user.role === "USER" ? "/dashboard" : "/admin"}
                className="flex items-center gap-2 text-white/90 hover:text-white text-sm font-semibold transition-colors"
              >
                <svg className="w-4 h-4 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
                Dashboard
              </Link>
              <button
                onClick={() => { logout(); navigate("/login"); }}
                className="px-6 py-2.5 bg-[#F97316] hover:bg-[#EA580C] text-white text-sm font-bold rounded-full shadow-md active:scale-95 transition-all"
              >
                Logout
              </button>
            </>
          ) : (
            <div className="w-[100px]"></div> /* Placeholder for alignment */
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2 text-white hover:text-brand-1"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {mobileOpen
              ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            }
          </svg>
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-brand-1/20 bg-ink px-6 py-4 space-y-2 pb-6 shadow-inner">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setMobileOpen(false)}
              className={`block px-4 py-3 rounded-lg text-sm font-medium ${
                location.pathname === link.path
                  ? "bg-brand-1/20 text-brand-1"
                  : "text-white/80 hover:text-white hover:bg-white/5"
              }`}
            >
              {link.name}
            </Link>
          ))}
          
          {user ? (
            <>
              <Link
                to={user.role === "USER" ? "/dashboard" : "/admin"}
                onClick={() => setMobileOpen(false)}
                className="block px-4 py-3 text-sm font-medium text-white/80 hover:text-white hover:bg-white/5 rounded-lg"
              >
                Dashboard
              </Link>
              <button onClick={() => { setMobileOpen(false); logout(); navigate("/login"); }}
                className="w-full text-center mt-4 py-3 text-sm font-bold text-white bg-[#F97316] hover:bg-[#EA580C] rounded-full">
                Logout
              </button>
            </>
          ) : (
            <div className="flex flex-col gap-3 mt-4">
              <Link to="/register" onClick={() => setMobileOpen(false)}
                className="w-full text-center py-3 text-sm font-semibold text-white border border-white/20 rounded-full hover:bg-white/5">
                ලියාපදිංචි වන්න
              </Link>
              <Link to="/login" onClick={() => setMobileOpen(false)}
                className="w-full text-center py-3 text-sm font-semibold text-white border border-white/20 rounded-full hover:bg-white/5">
                ඇතුළු වන්න
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
};

export default HeaderLayout;
