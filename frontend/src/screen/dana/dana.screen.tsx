import React, { useState } from "react";
import { Link } from "react-router";
import { useAuth } from "../../context/AuthContext";
import { API_BASE_URL } from "../../libs/api";

const DanaScreen: React.FC = () => {
  const { token, user } = useAuth();
  
  const [formData, setFormData] = useState({
    month: "",
    day: "",
    mealType: "NOON",
    purpose: "",
  });
  
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const finalData = {
      name: user?.name || "Registered User",
      phone: "N/A (Registered User)",
      whatsapp: "N/A (Registered User)",
      address: "N/A (Registered User)",
      month: formData.month,
      day: formData.day,
      mealType: formData.mealType,
      purpose: formData.purpose
    };

    try {
      const response = await fetch(`${API_BASE_URL}/dana`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(finalData),
      });

      if (response.ok) {
        setSubmitted(true);
      } else {
        const err = await response.json();
        alert(`Failed to submit: ${err.message || 'Error occurred'}`);
      }
    } catch (error) {
      console.error("Submission Error:", error);
      alert("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  return (
    <div className="min-h-screen bg-bg py-12 px-4 sm:px-6 flex items-center justify-center">
      <div className="w-full max-w-xl space-y-8">
        
        {/* Page Title & Intro */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-brand-1/10 rounded-full text-brand-1 text-xs font-extrabold uppercase tracking-wider">
            Dana Sponsorship Booking
          </div>
          <h1 className="text-3xl font-extrabold text-ink tracking-tight">
            Sāgaramati Pirivena Dana Sponsorship
          </h1>
          <p className="text-subtle text-xs sm:text-sm max-w-md mx-auto">
            Select your preferred month, day, and meal type to register for temple Dana sponsorship.
          </p>
        </div>

        {/* Card Container */}
        <div className="bg-surface border border-brand-1/15 rounded-3xl p-6 sm:p-8 shadow-xl">
          {!token ? (
            <div className="text-center py-10 space-y-5">
              <h3 className="text-lg font-bold text-ink">Please Sign In to Book Dana</h3>
              <p className="text-xs text-subtle max-w-xs mx-auto">
                You need to log in to book Dana and manage your sponsorship.
              </p>
              <div className="flex justify-center gap-3 pt-2">
                <Link
                  to="/login"
                  className="px-6 py-2.5 bg-brand-1 hover:bg-brand-2 text-white font-bold text-xs rounded-xl shadow-md transition-all"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-6 py-2.5 bg-surface-2 text-ink hover:bg-brand-1/10 font-bold text-xs rounded-xl border border-brand-1/15 transition-all"
                >
                  Register
                </Link>
              </div>
            </div>
          ) : submitted ? (
            <div className="text-center py-8 space-y-4">
              <h3 className="text-xl font-bold text-ink">Dana Booking Successful!</h3>
              <p className="text-xs text-subtle max-w-md mx-auto">
                Your Dana booking request has been submitted to the administration. Once approved, you can view details and your Certificate from your User Dashboard.
              </p>
              <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={() => setSubmitted(false)}
                  className="px-6 py-2.5 bg-surface-2 hover:bg-brand-1/10 text-ink font-bold text-xs rounded-xl border border-brand-1/15 transition-all"
                >
                  Book Another Dana
                </button>
                <Link
                  to="/dashboard"
                  className="px-6 py-2.5 bg-brand-1 hover:bg-brand-2 text-white font-bold text-xs rounded-xl shadow-md transition-all"
                >
                  Go to My Dashboard
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              
              {/* Logged in User Badge */}
              <div className="p-3 bg-brand-1/5 border border-brand-1/15 rounded-xl flex items-center justify-between text-xs">
                <span className="text-subtle">Applicant Name:</span>
                <span className="font-bold text-brand-1">{user?.name}</span>
              </div>

              {/* Month Selection */}
              <div>
                <label className="form-label text-xs">MONTH</label>
                <select
                  required
                  value={formData.month}
                  onChange={(e) => setFormData({ ...formData, month: e.target.value })}
                  className="form-input text-xs font-semibold cursor-pointer bg-surface"
                >
                  <option value="">Select Month...</option>
                  {months.map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>

              {/* Day Selection */}
              <div>
                <label className="form-label text-xs">DAY NUMBER (1 - 31)</label>
                <select
                  required
                  value={formData.day}
                  onChange={(e) => setFormData({ ...formData, day: e.target.value })}
                  className="form-input text-xs font-semibold cursor-pointer bg-surface"
                >
                  <option value="">Select Day...</option>
                  {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                    <option key={d} value={d.toString()}>Day {d}</option>
                  ))}
                </select>
              </div>

              {/* Meal Type */}
              <div>
                <label className="form-label text-xs">MEAL TYPE</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {[
                    { id: "MORNING", label: "Morning Meal (Heel Dana)" },
                    { id: "NOON", label: "Midday Meal (Dawal Dana)" },
                    { id: "EVENING", label: "Evening Refreshments" },
                  ].map((type) => (
                    <button
                      key={type.id}
                      type="button"
                      onClick={() => setFormData({ ...formData, mealType: type.id })}
                      className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all border ${
                        formData.mealType === type.id
                          ? "bg-brand-1 text-white border-brand-1 shadow-sm"
                          : "bg-surface-2 text-muted border-brand-1/10 hover:border-brand-1/30"
                      }`}
                    >
                      {type.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Purpose / Intention */}
              <div>
                <label className="form-label text-xs">PURPOSE / INTENTION</label>
                <textarea
                  required
                  rows={3}
                  value={formData.purpose}
                  onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                  placeholder="e.g. In memory of deceased relatives / Birthday blessing..."
                  className="form-input text-xs"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full py-3 text-xs font-bold shadow-md shadow-brand-1/20"
              >
                {loading ? "Submitting..." : "Book Dana Sponsorship"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default DanaScreen;
