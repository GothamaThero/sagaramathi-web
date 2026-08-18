import React, { useState } from "react";
import { Link, useNavigate } from "react-router";
import { useAuth } from "../../context/AuthContext";
import { API_BASE_URL } from "../../libs/api";

const LoginScreen: React.FC = () => {
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading]   = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      
      const data = await response.json();
      
      if (response.ok) {
        login(data.token, data.user);
        navigate("/dashboard");
      } else {
        alert(data.message || "Login failed");
      }
    } catch (error: any) {
      console.error("Login error:", error);
      if (error.name === "AbortError") {
        alert("Server request timed out. Please check if the backend server is running.");
      } else {
        alert("Network error. Could not connect to backend server.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex">

      {/* ── Left brand panel ─────────────────────────────── */}
      <div className="hidden lg:flex lg:w-1/2 bg-brand-1 flex-col items-center justify-center p-12 relative overflow-hidden">
        {/* decorative circles */}
        <div className="absolute -top-24 -left-24 w-80 h-80 rounded-full bg-white/5" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-white/5" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-white/[0.03]" />

        <div className="relative z-10 text-center space-y-6 max-w-md">
          <div className="space-y-3">
            <span className="text-[11px] font-bold text-amber-200 uppercase tracking-widest bg-white/10 px-4 py-1.5 rounded-full border border-white/15">
              Historic Monastery &amp; Pirivena
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white leading-tight font-serif pt-2">
              Sāgaramati Pirivena &amp; Dhananjaya Rajamaha Viharaya
            </h2>
            <p className="text-white/80 text-xs sm:text-sm leading-relaxed max-w-xs mx-auto">
              Kandegama, Aralaganwila, Polonnaruwa.
            </p>
          </div>
        </div>
      </div>

      {/* ── Right form panel ─────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-bg">
        <div className="w-full max-w-md">

          {/* Logo (mobile only) */}
          <div className="lg:hidden text-center mb-8">
            <img src="/logo.png" alt="Sagaramati Emblem" className="w-16 h-16 object-contain mx-auto mb-3 filter drop-shadow-md" />
            <h2 className="text-lg font-black text-brand-1">Sāgaramati Pirivena</h2>
          </div>

          <div className="mb-6">
            <h1 className="text-3xl font-black text-brand-1 font-serif">Sign In</h1>
            <p className="text-subtle text-xs sm:text-sm font-semibold mt-1">Access your account</p>
          </div>

          <div className="bg-white rounded-3xl p-8 shadow-xl border border-brand-1/10 space-y-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  placeholder="admin@sagaramathi.lk"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-3 border border-gray-200 rounded-xl outline-none focus:border-brand-1 focus:ring-2 focus:ring-brand-1/20 font-medium bg-white text-ink text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  Password *
                </label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-3 border border-gray-200 rounded-xl outline-none focus:border-brand-1 focus:ring-2 focus:ring-brand-1/20 font-medium bg-white text-ink text-sm"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-brand-1 hover:bg-emerald-800 text-white font-bold text-sm rounded-xl shadow-lg shadow-brand-1/25 disabled:opacity-50 transition-colors mt-2"
              >
                {loading ? "Signing in..." : "Sign In"}
              </button>
            </form>

            <div className="pt-4 text-center border-t border-gray-100">
              <p className="text-xs text-subtle font-medium">
                Don't have an account?{" "}
                <Link to="/register" className="font-bold text-brand-1 hover:underline">
                  Register here
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default LoginScreen;
