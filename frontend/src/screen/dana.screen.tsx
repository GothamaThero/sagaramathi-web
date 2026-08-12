import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";

const DanaScreen: React.FC = () => {
  const { token } = useAuth();
  
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    phone: "",
    whatsapp: "",
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

    try {
      const response = await fetch("http://localhost:3000/api/dana", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setSubmitted(true);
        setTimeout(() => {
          setSubmitted(false);
          setFormData({
            name: "",
            address: "",
            phone: "",
            whatsapp: "",
            month: "",
            day: "",
            mealType: "NOON",
            purpose: "",
          });
        }, 4000);
      } else {
        alert("දානය වෙන් කිරීම අසාර්ථකයි. කරුණාකර නැවත උත්සාහ කරන්න.");
      }
    } catch (error) {
      console.error("Error submitting dana:", error);
      alert("දානය වෙන් කිරීම අසාර්ථකයි. කරුණාකර නැවත උත්සාහ කරන්න.");
    } finally {
      setLoading(false);
    }
  };
  const months = [
    "ජනවාරි", "පෙබරවාරි", "මාර්තු", "අප්‍රේල්", "මැයි", "ජූනි",
    "ජූලි", "අගෝස්තු", "සැප්තැම්බර්", "ඔක්තෝබර්", "නොවැම්බර්", "දෙසැම්බර්"
  ];

  const days = Array.from({ length: 31 }, (_, i) => i + 1);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 flex flex-col gap-16 relative">

      {/* Hero Section */}
      <div className="relative rounded-3xl overflow-hidden bg-surface-2 p-8 sm:p-16 text-center shadow-sm border border-brand-1/20 mb-4">
        <div className="relative z-10 max-w-2xl mx-auto flex flex-col items-center gap-6">
          <div className="inline-flex w-20 h-20 bg-brand-1/10 rounded-full items-center justify-center shadow-sm border border-brand-1/20">
            <span className="text-4xl">🍲</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-ink tracking-tight">
            දානය භාර ගැනීම
          </h1>
          <p className="text-subtle text-sm sm:text-base font-medium max-w-xl mx-auto leading-relaxed">
            සාගරමතී පිරිවෙන වෙත ඔබගේ දානමය පුණ්‍යකර්මයන් වෙන් කරවා ගන්න. පිරිවෙන් විහාරස්ථානයේ වැඩ වාසය කරන ස්වාමීන් වහන්සේලා උදෙසා දානය පිරිනැමීමට ඔබට මෙතැනින් දිනයක් වෙන් කරවා ගත හැක.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        <div className="lg:col-span-8 bg-surface border border-brand-1/10 rounded-3xl p-6 sm:p-10 shadow-sm">
          <div className="mb-10 text-center sm:text-left">
            <h2 className="text-2xl font-bold text-ink flex items-center justify-center sm:justify-start gap-3">
              <span className="text-brand-1">📝</span> දිනයක් වෙන් කරවා ගන්න
            </h2>
            <p className="text-sm text-subtle mt-2">කරුණාකර ඔබගේ තොරතුරු නිවැරදිව පහතින් ඇතුළත් කරන්න.</p>
          </div>

          {submitted ? (
            <div className="py-16 flex flex-col items-center justify-center text-center space-y-5 bg-brand-1/5 rounded-3xl border border-brand-1/20">
              <div className="w-20 h-20 bg-green-500/20 text-green-600 rounded-full flex items-center justify-center text-4xl mb-2">
                ✓
              </div>
              <h3 className="text-2xl font-bold text-ink">සාර්ථකයි!</h3>
              <p className="text-base text-subtle max-w-md leading-relaxed">
                ඔබගේ ඉල්ලීම සාර්ථකව යොමු කරන ලදී. අපගේ කාර්යාලයෙන් ඔබව ඉක්මනින් සම්බන්ධ කරගනු ඇත.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-12">
              
              {/* Section 1: Personal Info */}
              <div className="space-y-6">
                <h3 className="text-lg font-bold text-ink border-b border-brand-1/10 pb-3">පුද්ගලික තොරතුරු</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <label className="form-label">ඔබගේ නම</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="ඔබගේ නම ඇතුළත් කරන්න"
                      className="form-input hover:border-brand-1/30 py-3 text-base"
                    />
                  </div>
                  <div>
                    <label className="form-label">දුරකථන අංකය</label>
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="07X XXX XXXX"
                      className="form-input hover:border-brand-1/30 py-3 text-base"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <label className="form-label">WhatsApp අංකය</label>
                    <input
                      type="tel"
                      required
                      value={formData.whatsapp}
                      onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                      placeholder="07X XXX XXXX"
                      className="form-input hover:border-brand-1/30 py-3 text-base"
                    />
                  </div>
                  <div>
                    <label className="form-label">ලිපිනය (Address)</label>
                    <input
                      type="text"
                      required
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      placeholder="ඔබගේ සම්පූර්ණ ලිපිනය"
                      className="form-input hover:border-brand-1/30 py-3 text-base"
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Dana Details */}
              <div className="space-y-6 pt-6">
                <h3 className="text-lg font-bold text-ink border-b border-brand-1/10 pb-3">දානයට අදාළ තොරතුරු</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <label className="form-label">දානය භාර ගන්න මාසය</label>
                    <select
                      required
                      value={formData.month}
                      onChange={(e) => setFormData({ ...formData, month: e.target.value })}
                      className="form-input hover:border-brand-1/30 py-3 text-base"
                    >
                      <option value="" disabled>මාසය තෝරන්න</option>
                      {months.map((m) => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="form-label">දානය භාර ගන්න දිනය</label>
                    <select
                      required
                      value={formData.day}
                      onChange={(e) => setFormData({ ...formData, day: e.target.value })}
                      className="form-input hover:border-brand-1/30 py-3 text-base"
                    >
                      <option value="" disabled>දිනය තෝරන්න</option>
                      {days.map((d) => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="form-label">දාන වර්ගය (Meal Type)</label>
                  <select
                    required
                    value={formData.mealType}
                    onChange={(e) => setFormData({ ...formData, mealType: e.target.value })}
                    className="form-input hover:border-brand-1/30 py-3 text-base"
                  >
                    <option value="MORNING">හීල් දානය</option>
                    <option value="NOON">දවල් දානය</option>
                    <option value="EVENING">ගිලන්පස</option>
                  </select>
                </div>

                <div>
                  <label className="form-label">දානය භාර ගැනීමේ අරමුණ</label>
                  <textarea
                    required
                    rows={4}
                    value={formData.purpose}
                    onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                    placeholder="උදා: මියගිය ඥාතීන්ට පින් අනුමෝදන් කිරීම, උපන්දින සැමරුම ආදිය..."
                    className="form-input hover:border-brand-1/30 py-3 text-base resize-none"
                  />
                </div>
              </div>

              <div className="pt-6">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full sm:w-auto px-10 py-4 bg-brand-1 hover:bg-brand-2 text-white text-base font-bold rounded-xl shadow-lg shadow-brand-1/25 hover:shadow-xl hover:shadow-brand-1/40 hover:-translate-y-0.5 transition-all disabled:opacity-50"
                >
                  {loading ? "යවමින්..." : "දානය බාර ගැනීම"}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Info Cards */}
        <div className="lg:col-span-4 space-y-8">
          <div className="bg-surface-2 border border-brand-1/10 rounded-3xl p-8 shadow-sm">
            <h3 className="text-lg font-bold text-ink mb-6 flex items-center gap-3">
              <span className="text-brand-3 text-2xl">📌</span> වැදගත් උපදෙස්
            </h3>
            <ul className="space-y-4">
              {[
                "ඔබගේ ඉල්ලීම යොමු කළ පසු අපගේ විහාරස්ථ කාර්යාලයෙන් ඔබව WhatsApp හෝ දුරකථනය හරහා සම්බන්ධ කරගනු ඇත.",
                "දැනට දානය වෙන් වී ඇති දින සහ හිස් දින පිළිබඳව කාර්යාලයෙන් තහවුරු කරගන්න."
              ].map((text, i) => (
                <li key={i} className="flex items-start gap-4 text-sm text-muted leading-relaxed">
                  <span className="w-2 h-2 rounded-full bg-brand-1/50 mt-2 flex-shrink-0" />
                  {text}
                </li>
              ))}
            </ul>
          </div>
          
          <div className="bg-brand-4/5 border border-brand-4/20 rounded-3xl p-8 shadow-sm flex flex-col sm:flex-row lg:flex-col items-start sm:items-center lg:items-start gap-5">
            <div className="w-14 h-14 rounded-2xl bg-brand-4/20 flex items-center justify-center flex-shrink-0 text-2xl">
              📞
            </div>
            <div>
              <h4 className="font-bold text-brand-4 text-lg">වැඩිදුර තොරතුරු සඳහා</h4>
              <p className="text-sm text-brand-4/80 font-medium mt-1">කාර්යාලය: 011 234 5678</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DanaScreen;
