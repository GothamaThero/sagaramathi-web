import React, { useState } from "react";
import { Link } from "react-router";

const LoginScreen: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Login Form Submitted!");
  };

  return (
    <div className="max-w-md mx-auto px-6 py-16">
      <div className="bg-brand-11 border border-brand-8 p-8 rounded-3xl shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-black text-white">ඇතුළු වන්න (Login)</h1>
          <p className="text-slate-400 text-sm">ඔබගේ ගිණුමට ප්‍රවේශ වීමට විස්තර ඇතුළත් කරන්න</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-1">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@example.com"
              className="w-full px-4 py-2.5 bg-brand-12 border border-brand-9 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-1"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-1">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-2.5 bg-brand-12 border border-brand-9 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-1"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-gradient-to-r from-brand-1 to-brand-4 hover:from-brand-2 hover:to-brand-5 text-white font-bold rounded-xl transition-all shadow-lg shadow-brand-1/30"
          >
            ඇතුළු වන්න
          </button>
        </form>

        <p className="text-center text-xs text-slate-400">
          ගිණුමක් නැතිද?{" "}
          <Link to="/register" className="text-brand-1 font-bold hover:underline">
            ලියාපදිංචි වන්න
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginScreen;
