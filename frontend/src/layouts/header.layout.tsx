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
    { name: "Our Temple", path: "/temple" },
    { name: "Gallery", path: "/gallery" },
    { name: "Contact Us", path: "/contact" },
  ];

  return (
    <header className="bg-surface/90 backdrop-blur-xl border-b border-brand-1/10 sticky top-0 z-40 shadow-sm shadow-brand-1/5">
      <div className="max-w-[1400px] mx-auto px-6 h-20 flex items-center justify-between">

        {/* Left: Brand */}
        <Link to="/" className="flex items-center gap-4 group">
          <div className="w-12 h-12 rounded-full bg-brand-1 flex items-center justify-center text-white font-black text-xl shadow-md shadow-brand-1/30 group-hover:scale-105 transition-transform">
            S
          </div>
          <div className="flex flex-col leading-none">
            <span className="text-ink font-black text-xl tracking-tight">Sagaramati</span>
            <span className="text-brand-1 text-xs font-bold tracking-widest uppercase mt-1">Pirivena</span>
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
                className={`text-base font-bold transition-colors ${
                  isActive ? "text-brand-1 font-extrabold" : "text-ink/80 hover:text-brand-1"
                }`}
              >
                {link.name}
              </Link>
            );
          })}
          
          {/* Outlined buttons in center for logged out users */}
          {!user && (
            <div className="flex items-center gap-4 ml-4">
              <Link
                to="/register"
                className="px-5 py-2 text-base font-bold text-brand-1 border border-brand-1/30 hover:border-brand-1/60 hover:bg-brand-1/5 rounded-full transition-all"
              >
                Register
              </Link>
              <Link
                to="/login"
                className="px-5 py-2 text-base font-bold text-brand-1 border border-brand-1/30 hover:border-brand-1/60 hover:bg-brand-1/5 rounded-full transition-all"
              >
                Sign In
              </Link>
            </div>
          )}
        </nav>

        {/* Right: Dashboard & Logout */}
        <div className="hidden md:flex items-center gap-6">
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
                className="text-ink hover:text-brand-1 text-base font-bold transition-colors"
              >
                Dashboard
              </Link>
              <button
                onClick={() => { logout(); navigate("/login"); }}
                className="px-6 py-2.5 bg-[#F97316] hover:bg-[#EA580C] text-white text-base font-black rounded-full shadow-md active:scale-95 transition-all"
              >
                Logout
              </button>
            </>
          ) : (
            <div className="w-[100px]"></div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden px-3 py-1.5 text-xs font-bold text-ink border border-brand-1/20 rounded-lg hover:text-brand-1"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? "Close" : "Menu"}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-brand-1/10 bg-surface px-6 py-4 space-y-2 pb-6 shadow-inner">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setMobileOpen(false)}
              className={`block px-4 py-3 rounded-lg text-sm font-medium ${
                location.pathname === link.path
                  ? "bg-brand-1/10 text-brand-1"
                  : "text-muted hover:text-brand-1 hover:bg-brand-1/5"
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
                className="block px-4 py-3 text-sm font-medium text-muted hover:text-brand-1 hover:bg-brand-1/5 rounded-lg"
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
                className="w-full text-center py-3 text-sm font-semibold text-brand-1 border border-brand-1/30 rounded-full hover:bg-brand-1/5">
                Register
              </Link>
              <Link to="/login" onClick={() => setMobileOpen(false)}
                className="w-full text-center py-3 text-sm font-semibold text-brand-1 border border-brand-1/30 rounded-full hover:bg-brand-1/5">
                Sign In
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
};

export default HeaderLayout;
