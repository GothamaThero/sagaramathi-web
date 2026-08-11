import React from "react";
import { Link, useLocation } from "react-router";

const HeaderLayout: React.FC = () => {
  const location = useLocation();

  const navLinks = [
    { name: "මුල් පිටුව (Home)", path: "/" },
    { name: "පරිශීලක පුවරුව (Dashboard)", path: "/dashboard" },
    { name: "අප ගැන (About)", path: "/about" },
  ];

  return (
    <header className="bg-brand-12/90 backdrop-blur-md border-b border-brand-10 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2.5">
          <span className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-1 via-brand-3 to-brand-5 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-brand-1/30 border border-brand-1/40">
            S
          </span>
          <span className="text-xl font-bold text-white tracking-tight">
            Sagaramathi <span className="text-brand-1">Web</span>
          </span>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-1.5">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                  isActive
                    ? "bg-brand-1/20 text-brand-1 border border-brand-2/40 shadow-sm"
                    : "text-slate-300 hover:text-white hover:bg-brand-11/60"
                }`}
              >
                {link.name}
              </Link>
            );
          })}
        </nav>

        {/* Auth Action Buttons */}
        <div className="flex items-center gap-3">
          <Link
            to="/login"
            className="px-4 py-2 text-slate-300 hover:text-white text-sm font-medium transition-colors"
          >
            ඇතුළු වන්න
          </Link>
          <Link
            to="/register"
            className="px-4.5 py-2 bg-gradient-to-r from-brand-1 to-brand-3 hover:from-brand-2 hover:to-brand-4 text-white text-sm font-semibold rounded-xl transition-all shadow-md shadow-brand-1/30 active:scale-95"
          >
            ලියාපදිංචි වන්න
          </Link>
        </div>
      </div>
    </header>
  );
};

export default HeaderLayout;
