import React, { useState } from "react";
import { Link, useNavigate } from "react-router";
import { API_BASE_URL } from "../../libs/api";

const RegisterScreen: React.FC = () => {
  const [title, setTitle]             = useState("Mr.");
  const [name, setName]               = useState("");
  const [email, setEmail]             = useState("");
  const [address, setAddress]         = useState("");
  const [phone, setPhone]             = useState("");
  const [whatsapp, setWhatsapp]       = useState("");
  const [password, setPassword]       = useState("");
  const [confirmPassword, setConfirm] = useState("");
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState<string | null>(null);

  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const cleanName = name.trim();
      let fullName = cleanName;
      if (title === "Rev.") {
        fullName = cleanName.startsWith("Rev.") ? cleanName : `Rev. ${cleanName}`;
      } else {
        fullName = cleanName.endsWith(title) ? cleanName : `${title} ${cleanName}`;
      }

      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: fullName, email, address, phone, whatsapp, password }),
      });

      const data = await response.json();

      if (response.ok) {
        alert("Registration successful! Please sign in.");
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
            Sagaramati Pirivena Management System
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-ink tracking-tight">
            Register New Account
          </h1>
          <p className="text-muted text-sm max-w-lg mx-auto">
            Please fill in your details below to register your account.
          </p>
        </div>

        {/* Full-width Form Card */}
        <div className="bg-surface border border-brand-1/10 rounded-3xl p-6 sm:p-10 shadow-xl shadow-brand-1/5">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {error && (
              <div className="p-4 bg-brand-1/8 border border-brand-1/20 rounded-2xl text-brand-1 text-sm font-medium">
                {error}
              </div>
            )}

            {/* Grid Layout for Form Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              
              {/* Name */}
              <div>
                <label className="form-label">FULL NAME</label>
                <div className="flex gap-2">
                  <select
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="form-input w-28 text-sm font-semibold shrink-0 cursor-pointer bg-surface border-brand-1/20 focus:border-brand-1"
                  >
                    <option value="Rev.">Rev.</option>
                    <option value="Mr.">Mr.</option>
                    <option value="Mrs.">Mrs.</option>
                    <option value="Miss">Miss</option>
                  </select>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Sunil Perera"
                    className="form-input flex-1"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="form-label">EMAIL ADDRESS</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="user@example.com"
                  className="form-input"
                />
              </div>

              {/* Address */}
              <div className="sm:col-span-2">
                <label className="form-label">ADDRESS</label>
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="e.g. No. 123, Temple Road, Colombo"
                  className="form-input"
                />
              </div>

              {/* Phone Number */}
              <div>
                <label className="form-label">PHONE NUMBER</label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. 0771234567"
                  className="form-input"
                />
              </div>

              {/* WhatsApp Number */}
              <div>
                <label className="form-label">WHATSAPP NUMBER</label>
                <input
                  type="tel"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  placeholder="e.g. 0771234567"
                  className="form-input"
                />
              </div>

              {/* Password */}
              <div>
                <label className="form-label">Password</label>
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
                <label className="form-label">Confirm Password</label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirm(e.target.value)}
                  placeholder="••••••••"
                  className="form-input"
                />
              </div>

            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full py-3.5 text-base font-bold shadow-lg shadow-brand-1/25"
              >
                {loading ? "Registering Account..." : "Register Account"}
              </button>
            </div>

            <p className="text-center text-xs text-subtle pt-2">
              By registering, you agree to Sagaramati Pirivena's{" "}
              <span className="text-muted font-medium hover:underline cursor-pointer">Terms of Service</span> and{" "}
              <span className="text-muted font-medium hover:underline cursor-pointer">Privacy Policy</span>.
            </p>
          </form>

          {/* Divider */}
          <div className="relative mt-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-brand-1/10" />
            </div>
            <div className="relative text-center">
              <span className="bg-surface px-4 text-xs text-subtle font-medium">Already have an account?</span>
            </div>
          </div>

          <div className="mt-6 text-center">
            <Link
              to="/login"
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-surface-2 hover:bg-brand-1/8 text-brand-1 text-sm font-semibold rounded-xl border border-brand-1/15 transition-all"
            >
              Go to Sign In Page
            </Link>
          </div>

        </div>

      </div>
    </div>
  );
};

export default RegisterScreen;
