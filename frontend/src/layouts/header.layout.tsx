import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { useAuth } from "../context/AuthContext";

const HeaderLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Dana Offerings", path: "/dana" },
    { name: "About Us", path: "/about" },
    { name: "Our Temples", path: "/temple" },
    { name: "Gallery", path: "/gallery" },
    { name: "Contact Us", path: "/contact" },
  ];

  return (
    <header className="bg-surface/90 backdrop-blur-xl border-b border-brand-1/10 sticky top-0 z-40 shadow-sm shadow-brand-1/5">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between">

        {/* Left: Brand */}
        <Link to="/" className="flex items-center gap-2.5 sm:gap-3 group">
          <img src="/logo.png" alt="Sāgaramati Emblem" className="w-9 h-9 sm:w-11 sm:h-11 object-contain filter drop-shadow-sm group-hover:scale-105 transition-transform" />
          <div className="flex flex-col leading-none">
            <span className="text-ink font-black text-lg sm:text-xl tracking-tight">Sāgaramati</span>
            <span className="text-brand-1 text-[10px] sm:text-xs font-bold tracking-widest uppercase mt-0.5 sm:mt-1">Pirivena</span>
          </div>
        </Link>

        {/* Center: Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 lg:gap-8">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`text-sm lg:text-base font-bold transition-colors ${
                  isActive ? "text-brand-1 font-extrabold" : "text-ink/80 hover:text-brand-1"
                }`}
              >
                {link.name}
              </Link>
            );
          })}
          
          {/* Outlined buttons in center for logged out users */}
          {!user && (
            <div className="flex items-center gap-3 ml-2 lg:ml-4">
              <Link
                to="/register"
                className="px-4 py-1.5 lg:px-5 lg:py-2 text-sm lg:text-base font-bold text-brand-1 border border-brand-1/30 hover:border-brand-1/60 hover:bg-brand-1/5 rounded-full transition-all"
              >
                Register
              </Link>
              <Link
                to="/login"
                className="px-4 py-1.5 lg:px-5 lg:py-2 text-sm lg:text-base font-bold text-brand-1 border border-brand-1/30 hover:border-brand-1/60 hover:bg-brand-1/5 rounded-full transition-all"
              >
                Sign In
              </Link>
            </div>
          )}
        </nav>

        {/* Right: Desktop Dashboard & Logout */}
        <div className="hidden md:flex items-center gap-4 lg:gap-6">
          {user ? (
            <>
              <Link
                to="/profile"
                className="flex items-center gap-2 px-3 py-1.5 bg-brand-1/10 hover:bg-brand-1/20 text-brand-1 rounded-full font-bold text-sm transition-all"
              >
                <div className="w-7 h-7 rounded-full bg-brand-1 text-white font-black text-xs flex items-center justify-center">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <span>{user.name}</span>
              </Link>
              <Link
                to={user.role === "USER" ? "/dashboard" : "/admin"}
                className="text-ink hover:text-brand-1 text-sm lg:text-base font-bold transition-colors"
              >
                Dashboard
              </Link>
              <button
                onClick={() => { logout(); navigate("/login"); }}
                className="px-5 py-2 lg:px-6 lg:py-2.5 bg-[#F97316] hover:bg-[#EA580C] text-white text-sm lg:text-base font-black rounded-full shadow-md active:scale-95 transition-all"
              >
                Logout
              </button>
            </>
          ) : (
            <div className="w-[80px]"></div>
          )}
        </div>

        {/* Mobile Hamburger Button */}
        <button
          className="md:hidden p-2 text-ink border border-brand-1/20 rounded-xl hover:text-brand-1 focus:outline-none transition-colors"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle Navigation Menu"
        >
          {mobileOpen ? (
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

      {/* Mobile Drawer Menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-brand-1/10 bg-surface/98 backdrop-blur-2xl px-5 py-4 space-y-2 pb-6 shadow-xl animate-fade-in">
          {user && (
            <div className="p-3 bg-brand-1/5 border border-brand-1/15 rounded-2xl flex items-center justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-brand-1 text-white font-black text-xs flex items-center justify-center">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-xs font-bold text-ink">{user.name}</p>
                  <p className="text-[10px] text-brand-1 font-semibold">{user.role}</p>
                </div>
              </div>
              <Link
                to="/profile"
                onClick={() => setMobileOpen(false)}
                className="text-[11px] font-extrabold text-brand-1 hover:underline"
              >
                Profile →
              </Link>
            </div>
          )}

          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setMobileOpen(false)}
              className={`block px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${
                location.pathname === link.path
                  ? "bg-brand-1 text-white shadow-sm"
                  : "text-ink/80 hover:text-brand-1 hover:bg-brand-1/5"
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
                className="block px-4 py-2.5 text-sm font-bold text-brand-1 bg-brand-1/10 rounded-xl mt-2"
              >
                Dashboard
              </Link>
              <button
                onClick={() => { setMobileOpen(false); logout(); navigate("/login"); }}
                className="w-full text-center mt-3 py-2.5 text-sm font-bold text-white bg-[#F97316] hover:bg-[#EA580C] rounded-xl shadow-md active:scale-95 transition-all"
              >
                Logout
              </button>
            </>
          ) : (
            <div className="flex flex-col gap-2.5 mt-4 pt-3 border-t border-brand-1/10">
              <Link
                to="/login"
                onClick={() => setMobileOpen(false)}
                className="w-full text-center py-2.5 text-sm font-bold text-brand-1 border border-brand-1/30 rounded-xl hover:bg-brand-1/5"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileOpen(false)}
                className="w-full text-center py-2.5 text-sm font-bold text-white bg-brand-1 rounded-xl shadow hover:bg-brand-2"
              >
                Register Account
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
};

export default HeaderLayout;
