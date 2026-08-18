import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { API_BASE_URL } from "../../libs/api";

const DEFAULT_VISION = `ගුණාත්මක අධ්‍යාපනයෙන් හා ආධ්‍යාත්මික සංවර්ධනයෙන් කලාපයේ ප්‍රමුඛතම භික්ෂු අධ්‍යාපන මධ්‍යස්ථානය බවට පත්වීම.

To become the prominent Bhikkhu education center of the zone in quality and spiritual development.`;
const DEFAULT_MISSION = `ලොව සදාචාරාත්මක හර පද්ධතීන්ට ගරු කරමින් විවෘත දෑසකින් හා සංවේදී මනසකින් මෙන් ම පිරිපුන් බුද්ධියකින් අනාගත ලෝකයේ අභියෝගයන්ට සාර්ථකව මුහුණ දිය හැකි ගුණ නැණ සපිරි මානව ප්‍රජාවක් ලොවට බිහි කිරීම අපගේ ඒකායන අරමුණයි.

Our main purpose is to create a human virtuous community endowed with intellect, sensitivity, open-mindedness and matured capability to face future challenges successfully upholding moral values.`;
const DEFAULT_GEETHAYA = `ජනමන නන්දිත
සගගණ සේවිත
තෙවළා බුදුබණ පද
නිති දිළුවන
සාගරමති මාතා.....

සාගර ජල සේ
දැනුම් සාගරේ
පිහිනමු කිමිදෙමු
නව මං සොයමින්
අපි සැවෝමා.....

මහසුප් සැරියුත් මහ යති පරපුර
පැරකුම් විදුසක්විති පඬි පෙළපත
සිරි ලක් සභිත අස්වැද්දූ ලෙස
නගමු අපිත් ඒ සිරිලක් සභිත.....

පද රචනය :
කන්දේගම දීපවංසාලංකාර හිමි`;

const AboutScreen: React.FC = () => {
  const { user, token } = useAuth();
  const [vision, setVision] = useState<string>(DEFAULT_VISION);
  const [mission, setMission] = useState<string>(DEFAULT_MISSION);
  const [geethaya, setGeethaya] = useState<string>(DEFAULT_GEETHAYA);

  const [editingVision, setEditingVision] = useState<boolean>(false);
  const [editingMission, setEditingMission] = useState<boolean>(false);
  const [editingGeethaya, setEditingGeethaya] = useState<boolean>(false);

  const [tempVision, setTempVision] = useState<string>("");
  const [tempMission, setTempMission] = useState<string>("");
  const [tempGeethaya, setTempGeethaya] = useState<string>("");

  const [saving, setSaving] = useState<boolean>(false);

  // Only SUPER_ADMIN can edit vision, mission, and piriven geethaya
  const isSuperAdmin = user?.role === "SUPER_ADMIN";

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/settings`);
      if (res.ok) {
        const data = await res.json();
        if (data.vision) setVision(data.vision);
        if (data.mission) setMission(data.mission);
        if (data.geethaya) setGeethaya(data.geethaya);
      }
    } catch (e) {
      console.error("Error fetching site settings:", e);
    }
  };

  const handleSaveSetting = async (key: "vision" | "mission" | "geethaya", value: string) => {
    if (!token) {
      alert("Please log in first.");
      return;
    }

    try {
      setSaving(true);
      const res = await fetch(`${API_BASE_URL}/settings`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ key, value })
      });

      if (res.ok) {
        if (key === "vision") {
          setVision(value);
          setEditingVision(false);
          alert("Vision updated successfully!");
        } else if (key === "mission") {
          setMission(value);
          setEditingMission(false);
          alert("Mission updated successfully!");
        } else if (key === "geethaya") {
          setGeethaya(value);
          setEditingGeethaya(false);
          alert("Piriven Geethaya updated successfully!");
        }
      } else {
        const err = await res.json();
        alert(err.message || "Failed to update setting.");
      }
    } catch (e) {
      console.error("Error saving setting:", e);
      alert("Error saving setting.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50/40 via-white to-gray-50 py-12 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto space-y-12">
        {/* Page Header */}
        <div className="bg-white border-2 border-amber-500/30 rounded-3xl p-8 sm:p-12 shadow-lg text-center space-y-5 relative overflow-hidden">
          <div className="flex justify-center mb-2">
            <img
              src="/logo.png"
              alt="Sagaramati Pirivena Emblem"
              className="w-20 h-20 sm:w-24 sm:h-24 object-contain filter drop-shadow-md"
            />
          </div>

          <h1 className="text-3xl sm:text-4xl font-black text-brand-1 tracking-tight">
            About Us
          </h1>

          <div className="w-24 h-1 bg-gradient-to-r from-transparent via-amber-500 to-transparent mx-auto rounded-full" />

          <p className="text-gray-700 text-base sm:text-lg max-w-3xl mx-auto leading-relaxed font-semibold text-justify">
            Sagaramati Monastery & Pirivena is a premier Buddhist educational and monastic institute dedicated to empowering the Venerable Sangha with profound Dhamma education, monastic discipline, and modern technological expertise.
          </p>
        </div>

        {/* Vision & Mission Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Vision Card */}
          <div className="bg-white/90 backdrop-blur-md border-2 border-amber-500/30 p-8 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 relative overflow-hidden group flex flex-col justify-between">
            <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl group-hover:bg-amber-500/20 transition-colors pointer-events-none" />

            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-black text-brand-1 flex items-center gap-2">
                  Our Vision
                </h2>

                {isSuperAdmin && !editingVision && (
                  <button
                    onClick={() => {
                      setTempVision(vision);
                      setEditingVision(true);
                    }}
                    className="px-3 py-1 bg-amber-100 hover:bg-amber-200 text-amber-900 text-xs font-bold rounded-lg border border-amber-300 shadow-sm transition-colors flex items-center gap-1"
                  >
                    Edit Vision
                  </button>
                )}
              </div>

              {editingVision ? (
                <div className="space-y-3">
                  <textarea
                    rows={6}
                    value={tempVision}
                    onChange={(e) => setTempVision(e.target.value)}
                    className="w-full p-3 border border-amber-400 rounded-xl text-sm font-medium focus:ring-2 focus:ring-amber-500 outline-none leading-relaxed"
                    placeholder="Write vision description..."
                  />
                  <div className="flex gap-2 justify-end">
                    <button
                      onClick={() => setEditingVision(false)}
                      className="px-4 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-700 text-xs font-bold rounded-lg"
                    >
                      Cancel
                    </button>
                    <button
                      disabled={saving}
                      onClick={() => handleSaveSetting("vision", tempVision)}
                      className="px-4 py-1.5 bg-brand-1 hover:bg-emerald-800 text-white text-xs font-bold rounded-lg shadow-md disabled:opacity-50"
                    >
                      {saving ? "Saving..." : "Save"}
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-gray-700 leading-relaxed font-semibold text-sm sm:text-base text-justify whitespace-pre-line">
                  "{vision}"
                </p>
              )}
            </div>
          </div>

          {/* Mission Card */}
          <div className="bg-white/90 backdrop-blur-md border-2 border-emerald-600/30 p-8 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 relative overflow-hidden group flex flex-col justify-between">
            <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-emerald-600/10 rounded-full blur-2xl group-hover:bg-emerald-600/20 transition-colors pointer-events-none" />

            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-black text-emerald-900 flex items-center gap-2">
                  Our Mission
                </h2>

                {isSuperAdmin && !editingMission && (
                  <button
                    onClick={() => {
                      setTempMission(mission);
                      setEditingMission(true);
                    }}
                    className="px-3 py-1 bg-emerald-100 hover:bg-emerald-200 text-emerald-900 text-xs font-bold rounded-lg border border-emerald-300 shadow-sm transition-colors flex items-center gap-1"
                  >
                    Edit Mission
                  </button>
                )}
              </div>

              {editingMission ? (
                <div className="space-y-3">
                  <textarea
                    rows={6}
                    value={tempMission}
                    onChange={(e) => setTempMission(e.target.value)}
                    className="w-full p-3 border border-emerald-400 rounded-xl text-sm font-medium focus:ring-2 focus:ring-emerald-500 outline-none leading-relaxed"
                    placeholder="Write mission description..."
                  />
                  <div className="flex gap-2 justify-end">
                    <button
                      onClick={() => setEditingMission(false)}
                      className="px-4 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-700 text-xs font-bold rounded-lg"
                    >
                      Cancel
                    </button>
                    <button
                      disabled={saving}
                      onClick={() => handleSaveSetting("mission", tempMission)}
                      className="px-4 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-lg shadow-md disabled:opacity-50"
                    >
                      {saving ? "Saving..." : "Save"}
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-gray-700 leading-relaxed font-semibold text-sm sm:text-base text-justify whitespace-pre-line">
                  "{mission}"
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Piriven Geethaya Section */}
        <div className="bg-gradient-to-b from-amber-50/70 via-white to-amber-50/50 border-2 border-amber-500/40 rounded-3xl p-8 sm:p-10 shadow-xl relative overflow-hidden text-center space-y-6">
          <div className="flex items-center justify-between border-b border-amber-200/80 pb-4">
            <div className="w-10 h-10" />
            <h2 className="text-2xl sm:text-3xl font-black text-brand-1 tracking-wide">
              සාගරමති පිරිවෙන් ගීතය
            </h2>
            {isSuperAdmin && !editingGeethaya ? (
              <button
                onClick={() => {
                  setTempGeethaya(geethaya);
                  setEditingGeethaya(true);
                }}
                className="px-3 py-1 bg-amber-100 hover:bg-amber-200 text-amber-900 text-xs font-bold rounded-lg border border-amber-300 shadow-sm transition-colors"
              >
                Edit Song
              </button>
            ) : (
              <div className="w-10 h-10" />
            )}
          </div>

          {editingGeethaya ? (
            <div className="space-y-4 max-w-2xl mx-auto">
              <textarea
                rows={12}
                value={tempGeethaya}
                onChange={(e) => setTempGeethaya(e.target.value)}
                className="w-full p-4 border border-amber-400 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-amber-500 outline-none leading-relaxed text-center"
                placeholder="Write Piriven Geethaya lyrics..."
              />
              <div className="flex gap-2 justify-center">
                <button
                  onClick={() => setEditingGeethaya(false)}
                  className="px-4 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-700 text-xs font-bold rounded-lg"
                >
                  Cancel
                </button>
                <button
                  disabled={saving}
                  onClick={() => handleSaveSetting("geethaya", tempGeethaya)}
                  className="px-4 py-1.5 bg-brand-1 hover:bg-emerald-800 text-white text-xs font-bold rounded-lg shadow-md disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Save Geethaya"}
                </button>
              </div>
            </div>
          ) : (
            <div className="max-w-2xl mx-auto space-y-6 text-gray-800">
              <p className="whitespace-pre-line text-base sm:text-lg font-bold leading-loose tracking-wide text-brand-1 font-serif">
                {geethaya}
              </p>
            </div>
          )}
        </div>

        {/* Footer Credit Line */}
        <div className="text-center pt-4 border-t border-gray-200/60 text-xs text-subtle font-medium">
          Designed &amp; Developed by <strong className="text-brand-1">Gothamavansalankara Thero</strong> | EXONIT (Pvt) Ltd.
        </div>
      </div>
    </div>
  );
};

export default AboutScreen;
