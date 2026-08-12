import React, { useState } from "react";
import { Link, useNavigate } from "react-router";

const RegisterScreen: React.FC = () => {
  const [name, setName]               = useState("");
  const [email, setEmail]             = useState("");
  const [password, setPassword]       = useState("");
  const [confirmPassword, setConfirm] = useState("");
  const [role, setRole]               = useState("USER");
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState<string | null>(null);

  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("මුරපද ද්විත්වය සමාන නොවේ.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("http://localhost:3000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        alert("ලියාපදිංචි වීම සාර්ථකයි! දැන් ඇතුළු වන්න.");
        navigate("/login");
      } else {
        setError(data.message || "Registration failed");
      }
    } catch (err) {
      console.error("Register error:", err);
      setError("Network error, please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-[calc(100vh-4rem)] py-12 px-4 sm:px-6 lg:px-8 bg-bg flex items-center justify-center">
      <div className="w-full max-w-3xl space-y-8">
        
        {/* Header section */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-brand-1/8 border border-brand-1/15 rounded-full text-brand-1 text-xs font-semibold uppercase tracking-widest">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-1 animate-pulse" />
            Sagaramathi Pirivena Management System
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-ink tracking-tight">
            නව පරිශීලකයෙකු ලියාපදිංචි කිරීම
          </h1>
          <p className="text-muted text-sm max-w-lg mx-auto">
            පද්ධතියේ සේවාවන් ලබා ගැනීම සඳහා පහත විස්තර නිවැරදිව ඇතුළත් කර ගිණුම සක්‍රිය කරගන්න.
          </p>
        </div>

        {/* Full-width Form Card */}
        <div className="bg-surface border border-brand-1/10 rounded-3xl p-6 sm:p-10 shadow-xl shadow-brand-1/5">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {error && (
              <div className="flex items-center gap-3 p-4 bg-brand-1/8 border border-brand-1/20 rounded-2xl text-brand-1 text-sm font-medium">
                <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {error}
              </div>
            )}

            {/* Grid Layout for Form Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              
              {/* Name */}
              <div>
                <label className="form-label">සම්පූර්ණ නම (Full Name)</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="උදා: සුනිල් පෙරේරා"
                  className="form-input"
                />
              </div>

              {/* Email */}
              <div>
                <label className="form-label">විද්‍යුත් තැපෑල (Email Address)</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="user@example.com"
                  className="form-input"
                />
              </div>

              {/* Password */}
              <div>
                <label className="form-label">මුරපදය (Password)</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="form-input"
                />
              </div>

              {/* Confirm Password */}
              <div>
                <label className="form-label">මුරපදය තහවුරු කරන්න (Confirm Password)</label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirm(e.target.value)}
                  placeholder="••••••••"
                  className="form-input"
                />
              </div>

              {/* Role Select - Full Span */}
              <div className="sm:col-span-2">
                <label className="form-label">කාර්යභාරය (User Role)</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="form-input"
                >
                  <option value="USER">👤 USER — සාමාන්‍ය පරිශීලක</option>
                  <option value="ADMIN">👑 ADMIN — පරිපාලක</option>
                </select>
              </div>

            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full py-3.5 text-base font-bold shadow-lg shadow-brand-1/25"
              >
                {loading ? (
                  <>
                    <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    ලියාපදිංචි කරමින්...
                  </>
                ) : (
                  "ගිණුම ලියාපදිංචි කරන්න"
                )}
              </button>
            </div>

            <p className="text-center text-xs text-subtle pt-2">
              ලියාපදිංචි වීමෙන් ඔබ සාගරමතී පිරිවෙන් පද්ධතියේ{" "}
              <span className="text-muted font-medium hover:underline cursor-pointer">සේවා නියමයන්</span> සහ{" "}
              <span className="text-muted font-medium hover:underline cursor-pointer">පෞද්ගලිකත්ව ප්‍රතිපත්තිය</span> සමඟ එකඟ වේ.
            </p>
          </form>

          {/* Divider */}
          <div className="relative mt-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-brand-1/10" />
            </div>
            <div className="relative text-center">
              <span className="bg-surface px-4 text-xs text-subtle font-medium">දැනටමත් ගිණුමක් තිබේද?</span>
            </div>
          </div>

          <div className="mt-6 text-center">
            <Link
              to="/login"
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-surface-2 hover:bg-brand-1/8 text-brand-1 text-sm font-semibold rounded-xl border border-brand-1/15 transition-all"
            >
              ඇතුළු වීමේ පිටුවට පිවිසෙන්න
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>
          </div>

        </div>

      </div>
    </div>
  );
};

export default RegisterScreen;
