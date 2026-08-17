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
      <div className="hidden lg:flex lg:w-1/2 bg-brand-1 flex-col items-center justify-center p-16 relative overflow-hidden">
        {/* decorative circles */}
        <div className="absolute -top-24 -left-24 w-80 h-80 rounded-full bg-white/5" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-white/5" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-white/[0.03]" />

        <div className="relative z-10 text-center space-y-6 max-w-sm">
          <div className="w-20 h-20 rounded-3xl bg-white/15 border border-white/20 flex items-center justify-center text-white font-black text-4xl mx-auto shadow-2xl">
            S
          </div>
          <div>
            <h2 className="text-3xl font-black text-white leading-tight">
              Sagaramati<br />Pirivena
            </h2>
            <p className="text-white/60 text-sm mt-3 leading-relaxed">
              Monastery Management System<br />
              Full Stack Web Application
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 pt-4">
            {["React 19", "Node.js", "Prisma ORM", "MySQL"].map((tech) => (
              <div key={tech} className="bg-white/10 border border-white/15 rounded-xl py-2 px-3 text-white/80 text-xs font-medium text-center">
                {tech}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right form panel ─────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-bg">
        <div className="w-full max-w-md">

          {/* Logo (mobile only) */}
          <div className="lg:hidden text-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-brand-1 flex items-center justify-center text-white font-black text-2xl mx-auto mb-4 shadow-xl shadow-brand-1/20">
              S
            </div>
          </div>

          <div className="mb-8">
            <h1 className="text-3xl font-bold text-ink">Sign In</h1>
            <p className="text-subtle text-sm mt-1">Access your account</p>
          </div>

          <div className="card-padded space-y-5">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="form-label">Email</label>
                <input type="email" required value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="user@example.com" className="form-input" />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="form-label !mb-0">Password</label>
                  <button type="button" className="text-xs text-brand-1 hover:underline">
                    Forgot Password?
                  </button>
                </div>
                <input type="password" required value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••" className="form-input" />
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full">
                {loading ? "Signing In..." : "Sign In"}
              </button>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-brand-1/6" />
              </div>
              <div className="relative text-center">
                <span className="bg-surface px-3 text-xs text-subtle">or</span>
              </div>
            </div>

            <p className="text-center text-sm text-subtle">
              Don't have an account?{" "}
              <Link to="/register" className="text-brand-1 font-semibold hover:underline">
                Register
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;
