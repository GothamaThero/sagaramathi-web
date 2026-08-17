import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { API_BASE_URL } from "../../libs/api";

export const AdminDanaConfirmationsScreen: React.FC = () => {
  const { token } = useAuth();
  const [list, setList] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filter, setFilter] = useState<"ALL" | "ATTENDING" | "BANK_TRANSFER" | "DECLINED" | "PENDING">("ALL");
  const [unreadCount, setUnreadCount] = useState<number>(0);

  useEffect(() => {
    fetchConfirmations();
    // Poll every 15 seconds for real-time donor confirmation updates
    const timer = setInterval(() => {
      fetchConfirmations(true);
    }, 15000);
    return () => clearInterval(timer);
  }, [token]);

  const fetchConfirmations = async (isPoll: boolean = false) => {
    try {
      if (!isPoll) setLoading(true);
      const res = await fetch(`${API_BASE_URL}/dana-confirm/admin/all`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const result = await res.json();
        setList(result.data || []);
        
        // Play Sinhala Audio Alert if new unread confirmation received
        if (result.unreadCount && result.unreadCount > unreadCount && isPoll) {
          playSinhalaAudioAlert(result.lastEvent?.donorName);
        }
        setUnreadCount(result.unreadCount || 0);
      }
    } catch (e) {
      console.error("Error fetching admin dana confirmations", e);
    } finally {
      if (!isPoll) setLoading(false);
    }
  };

  const playSinhalaAudioAlert = (donorName?: string) => {
    try {
      // Play chime sound
      const audio = new Audio("https://actions.google.com/sounds/v1/cartoon/clack_chime.ogg");
      audio.play().catch(() => {});

      // Text-to-speech Sinhala voice alert if browser supports SpeechSynthesis
      if ('speechSynthesis' in window) {
        const msg = new SpeechSynthesisUtterance(`${donorName || 'දායක මහතෙක්'} දානය පැමිණ පූජා කරන බව තහවුරු කළේය!`);
        msg.lang = 'si-LK';
        window.speechSynthesis.speak(msg);
      }
    } catch (e) {
      console.log("Audio alert error", e);
    }
  };

  const markAllRead = async () => {
    try {
      await fetch(`${API_BASE_URL}/dana-confirm/admin/mark-read`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      });
      setUnreadCount(0);
    } catch (e) {
      console.error(e);
    }
  };

  const filteredList = list.filter((item) => {
    if (filter === "ALL") return true;
    return item.responseStatus === filter;
  });

  const countAttending = list.filter((i) => i.responseStatus === "ATTENDING").length;
  const countBank = list.filter((i) => i.responseStatus === "BANK_TRANSFER").length;
  const countDeclined = list.filter((i) => i.responseStatus === "DECLINED").length;
  const countPending = list.filter((i) => i.responseStatus === "PENDING").length;

  if (loading) {
    return <div className="p-12 text-center text-subtle font-semibold">Loading Dana confirmations...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-brand-1/10 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-ink">දානමය පැමිණීම් තහවුරු කිරීමේ පුවරුව</h1>
            {unreadCount > 0 && (
              <span className="px-3 py-1 bg-red-600 text-white text-xs font-bold rounded-full animate-bounce">
                🔔 නව තහවුරු කිරීම් {unreadCount}යි!
              </span>
            )}
          </div>
          <p className="text-xs text-subtle mt-1">
            දායකයින් ඔවුන්ගේ ජංගම දුරකථනයෙන් තහවුරු කළ දානමය පැමිණීම් සජීවී පුවරුව (Real-time Live Confirmation Center).
          </p>
        </div>

        <div className="flex items-center gap-3">
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              className="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-800 text-xs font-bold rounded-xl transition-all"
            >
              Clear Red Badge ({unreadCount})
            </button>
          )}
          <button
            onClick={() => fetchConfirmations()}
            className="px-4 py-2 bg-brand-1 text-white text-xs font-bold rounded-xl shadow-md transition-all active:scale-95"
          >
            🔄 Refresh Live Data
          </button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div 
          onClick={() => setFilter("ATTENDING")}
          className={`p-5 rounded-2xl border cursor-pointer transition-all ${
            filter === "ATTENDING" ? "bg-emerald-700 text-white border-emerald-800 shadow-md" : "bg-white text-ink border-emerald-200 hover:bg-emerald-50"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-2xl">🟢</span>
            <span className="text-2xl font-black">{countAttending}</span>
          </div>
          <p className="text-xs font-bold mt-2">පැමිණ පූජා කරන අය (Attending)</p>
        </div>

        <div 
          onClick={() => setFilter("BANK_TRANSFER")}
          className={`p-5 rounded-2xl border cursor-pointer transition-all ${
            filter === "BANK_TRANSFER" ? "bg-blue-700 text-white border-blue-800 shadow-md" : "bg-white text-ink border-blue-200 hover:bg-blue-50"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-2xl">🔵</span>
            <span className="text-2xl font-black">{countBank}</span>
          </div>
          <p className="text-xs font-bold mt-2">බැංකුවට බැර කරන අය (Bank Transfer)</p>
        </div>

        <div 
          onClick={() => setFilter("DECLINED")}
          className={`p-5 rounded-2xl border cursor-pointer transition-all ${
            filter === "DECLINED" ? "bg-red-700 text-white border-red-800 shadow-md" : "bg-white text-ink border-red-200 hover:bg-red-50"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-2xl">🔴</span>
            <span className="text-2xl font-black">{countDeclined}</span>
          </div>
          <p className="text-xs font-bold mt-2">නොපැමිණෙන අය (Declined)</p>
        </div>

        <div 
          onClick={() => setFilter("PENDING")}
          className={`p-5 rounded-2xl border cursor-pointer transition-all ${
            filter === "PENDING" ? "bg-amber-600 text-white border-amber-700 shadow-md" : "bg-white text-ink border-amber-200 hover:bg-amber-50"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-2xl">🟡</span>
            <span className="text-2xl font-black">{countPending}</span>
          </div>
          <p className="text-xs font-bold mt-2">තවම තහවුරු නොකළ අය (Pending)</p>
        </div>
      </div>

      {/* Filter Tabs & Table */}
      <div className="bg-white rounded-2xl border border-brand-1/10 shadow-sm overflow-hidden space-y-4 p-6">
        <div className="flex items-center justify-between border-b pb-4">
          <div className="flex gap-2">
            <button
              onClick={() => setFilter("ALL")}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
                filter === "ALL" ? "bg-brand-1 text-white shadow-sm" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              සියල්ල (All {list.length})
            </button>
            <button
              onClick={() => setFilter("ATTENDING")}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
                filter === "ATTENDING" ? "bg-emerald-700 text-white shadow-sm" : "bg-emerald-50 text-emerald-800 hover:bg-emerald-100"
              }`}
            >
              🟢 පැමිණේ ({countAttending})
            </button>
            <button
              onClick={() => setFilter("BANK_TRANSFER")}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
                filter === "BANK_TRANSFER" ? "bg-blue-700 text-white shadow-sm" : "bg-blue-50 text-blue-800 hover:bg-blue-100"
              }`}
            >
              🔵 බැංකු තැන්පතු ({countBank})
            </button>
            <button
              onClick={() => setFilter("DECLINED")}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
                filter === "DECLINED" ? "bg-red-700 text-white shadow-sm" : "bg-red-50 text-red-800 hover:bg-red-100"
              }`}
            >
              🔴 නොපැමිණේ ({countDeclined})
            </button>
          </div>
        </div>

        {filteredList.length === 0 ? (
          <div className="p-12 text-center text-subtle font-medium">
            තෝරාගත් කාණ්ඩයේ දානමය පැමිණීම් නොමැත.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 text-ink font-bold border-b">
                <tr>
                  <th className="p-3">ID</th>
                  <th className="p-3">දායකයාගේ නම</th>
                  <th className="p-3">දිනය & වේලාව</th>
                  <th className="p-3">දුරකථන / WhatsApp</th>
                  <th className="p-3">තහවුරු කිරීමේ තත්ත්වය</th>
                  <th className="p-3">තහවුරු කළ දිනය</th>
                  <th className="p-3 text-right">ක්‍රියාකාරකම්</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-800">
                {filteredList.map((item) => {
                  const mealSi = item.mealType === 'MORNING' ? 'හීල් දානය' : item.mealType === 'NOON' ? 'දවල් දානය' : 'ගිලන්පස';
                  const waNum = (item.whatsapp && item.whatsapp !== "N/A") ? item.whatsapp.replace(/[^0-9]/g, "") : item.phone.replace(/[^0-9]/g, "");

                  return (
                    <tr key={item.id} className="hover:bg-gray-50/80 transition-all">
                      <td className="p-3 font-bold text-brand-1">#{item.id}</td>
                      <td className="p-3 font-bold text-ink">{item.name}</td>
                      <td className="p-3 font-medium">
                        {item.month} {item.day} - <span className="font-bold text-amber-800">{mealSi}</span>
                      </td>
                      <td className="p-3 font-medium">{item.whatsapp !== "N/A" ? item.whatsapp : item.phone}</td>
                      <td className="p-3">
                        {item.responseStatus === "ATTENDING" && (
                          <span className="px-3 py-1 bg-emerald-100 text-emerald-800 font-bold rounded-full border border-emerald-300">
                            🟢 පැමිණ පූජා කරයි
                          </span>
                        )}
                        {item.responseStatus === "BANK_TRANSFER" && (
                          <span className="px-3 py-1 bg-blue-100 text-blue-800 font-bold rounded-full border border-blue-300">
                            🔵 බැංකුවට මුදල් තැන්පත් කරයි
                          </span>
                        )}
                        {item.responseStatus === "DECLINED" && (
                          <span className="px-3 py-1 bg-red-100 text-red-800 font-bold rounded-full border border-red-300">
                            🔴 නොපැමිණේ (අවලංගුයි)
                          </span>
                        )}
                        {item.responseStatus === "PENDING" && (
                          <span className="px-3 py-1 bg-amber-100 text-amber-800 font-bold rounded-full border border-amber-300">
                            🟡 තවම තහවුරු කර නැත
                          </span>
                        )}
                      </td>
                      <td className="p-3 text-gray-500 font-medium">
                        {item.respondedAt ? new Date(item.respondedAt).toLocaleString("si-LK") : "-"}
                      </td>
                      <td className="p-3 text-right">
                        {waNum ? (
                          <a
                            href={`https://wa.me/${waNum.startsWith("0") ? "94" + waNum.slice(1) : waNum}?text=${encodeURIComponent(`තෙරුවන් සරණයි! කන්දෙගම සාගරමති පිරිවෙනේ ඔබේ දානමය පුණ්‍යකර්මය (${item.month} ${item.day}) පිළිබඳ දැනුවත් කිරීමයි...`)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg transition-all inline-flex items-center gap-1 shadow-sm"
                          >
                            <span>💬</span> WhatsApp
                          </a>
                        ) : (
                          <span className="text-gray-400">N/A</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
