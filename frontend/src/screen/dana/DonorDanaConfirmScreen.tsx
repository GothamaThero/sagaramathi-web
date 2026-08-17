import React, { useEffect, useState } from "react";
import { useParams } from "react-router";
import { API_BASE_URL } from "../../libs/api";

export const DonorDanaConfirmScreen: React.FC = () => {
  const { id } = useParams();
  const [dana, setDana] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [submittedStatus, setSubmittedStatus] = useState<string>("");
  const [notes] = useState<string>("");

  useEffect(() => {
    fetchDanaConfirmation();
  }, [id]);

  const fetchDanaConfirmation = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/dana-confirm/public/${id}`);
      if (res.ok) {
        const result = await res.json();
        setDana(result.data);
        if (result.data?.confirmation?.responseStatus && result.data.confirmation.responseStatus !== "PENDING") {
          setSubmittedStatus(result.data.confirmation.responseStatus);
        }
      } else {
        setErrorMsg("දානමය තොරතුරු සොයා ගැනීමට නොහැකි විය. කාරුණිකව විහාරස්ථානය අමතන්න.");
      }
    } catch (e) {
      console.error("Error fetching dana confirmation:", e);
      setErrorMsg("සම්බන්ධතා දෝෂයකි. කාරුණිකව නැවත උත්සාහ කරන්න.");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmResponse = async (status: "ATTENDING" | "BANK_TRANSFER" | "DECLINED") => {
    try {
      setSubmitting(true);
      const res = await fetch(`${API_BASE_URL}/dana-confirm/public/${id}/respond`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ responseStatus: status, notes })
      });

      if (res.ok) {
        setSubmittedStatus(status);
      } else {
        alert("තහවුරු කිරීමේදී දෝෂයක් සිදු විය. කාරුණිකව දුරකථනයෙන් පිරිවෙන අමතන්න.");
      }
    } catch (e) {
      console.error("Error responding to dana confirmation:", e);
      alert("සම්බන්ධතා දෝෂයකි.");
    } finally {
      setSubmitting(false);
    }
  };

  const generateGoogleCalendarLink = () => {
    if (!dana) return "#";
    const title = encodeURIComponent(`කන්දෙගම සාගරමති පිරිවෙනේ දානමය පුණ්‍යකර්මය - ${dana.name}`);
    const details = encodeURIComponent(`කන්දෙගම සාගරමති පිරිවෙනේ නේවාසික මහා සංඝරත්නය උදෙසා පූජා කරන දානමය පුණ්‍යකර්මය.\nවිහාරස්ථානය: 027-3272215 / 070-5216408`);
    const location = encodeURIComponent(`ධනංජය රජමහා විහාරය, කන්දෙගම, පොළොන්නරුව`);
    
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&location=${location}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-amber-50 flex items-center justify-center p-6 text-center font-bold text-gray-700">
        <div className="space-y-3">
          <div className="w-12 h-12 border-4 border-amber-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p>දානමය තොරතුරු සූදානම් වෙමින් පවතී...</p>
        </div>
      </div>
    );
  }

  if (errorMsg || !dana) {
    return (
      <div className="min-h-screen bg-amber-50 flex items-center justify-center p-6 text-center">
        <div className="max-w-md bg-white p-8 rounded-3xl shadow-xl border border-red-200 space-y-4">
          <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto text-2xl font-bold">⚠️</div>
          <h2 className="text-xl font-bold text-gray-800">{errorMsg || "තොරතුරු හමු නොවීය"}</h2>
          <p className="text-sm text-gray-600">තොරතුරු ලබා ගැනීමට කාරුණිකව විහාරස්ථානය අමතන්න: 027-3272215 / 070-5216408</p>
        </div>
      </div>
    );
  }

  const mealNameSi = dana.mealType === 'MORNING' ? 'හීල් දානමය පුණ්‍යකර්මය' : dana.mealType === 'NOON' ? 'දවල් දානමය පුණ්‍යකර්මය' : 'ගිලන්පස පූජාව';

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 font-serif text-gray-800 flex justify-center items-start">
      <div className="max-w-lg w-full bg-white rounded-3xl shadow-2xl border-2 border-amber-600/30 overflow-hidden space-y-6 pb-8">
        
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-amber-700 via-amber-800 to-amber-900 text-white p-6 text-center relative">
          <img src="/logo.png" alt="Logo" className="w-20 h-20 object-contain mx-auto mb-2 drop-shadow-md" />
          <h1 className="text-xl font-black tracking-wide">සාගරමති පිරිවෙන් සංවර්ධන සභාව</h1>
          <p className="text-xs text-amber-200 font-sans mt-1">ධනංජය රජමහා විහාරය, කන්දෙගම, පොළොන්නරුව</p>
          <div className="mt-3 bg-amber-600/40 py-1.5 px-4 rounded-full text-xs font-bold inline-block text-amber-100 border border-amber-400/30">
            දානමය පැමිණීම තහවුරු කිරීමේ පුවරුව
          </div>
        </div>

        {/* Devotional Quote */}
        <div className="px-6 text-center space-y-1">
          <p className="text-sm font-bold text-amber-800">"සුඛා සංඝස්ස සාමග්ගී - සමග්ගානං තපෝ සුඛෝ"</p>
          <p className="text-xs text-gray-500 font-sans">නමෝ තස්ස භගවතෝ အရහතෝ සම්මා සම්බුද්ධස්ස</p>
        </div>

        {/* Dana Details Box */}
        <div className="mx-6 p-5 bg-amber-500/10 rounded-2xl border border-amber-600/20 space-y-3">
          <div className="border-b border-amber-600/20 pb-2">
            <span className="text-xs font-bold text-gray-500 block uppercase font-sans">දායකයාගේ නම:</span>
            <p className="text-lg font-bold text-amber-900">{dana.name}</p>
          </div>

          <div className="grid grid-cols-2 gap-3 border-b border-amber-600/20 pb-2">
            <div>
              <span className="text-xs font-bold text-gray-500 block uppercase font-sans">දිනය:</span>
              <p className="text-base font-bold text-gray-900">{dana.month} මස {dana.day} වන දින</p>
            </div>
            <div>
              <span className="text-xs font-bold text-gray-500 block uppercase font-sans">දානමය වේලාව:</span>
              <p className="text-base font-bold text-amber-800">{mealNameSi}</p>
            </div>
          </div>

          <div>
            <span className="text-xs font-bold text-gray-500 block uppercase font-sans">අරමුණ:</span>
            <p className="text-sm font-bold text-gray-800">{dana.purpose || "දානමය පුණ්‍යකර්මය"}</p>
          </div>
        </div>

        {/* Audio Voice Note Preview */}
        <div className="mx-6 p-4 bg-amber-50 rounded-2xl border border-amber-200 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-900">
            <span>🎙️</span>
            <span>පූජනීය ස්වාමීන් වහන්සේගේ දැනුම්දීමේ හඬ පණිවිඩය (Voice Note):</span>
          </div>
          <p className="text-xs text-gray-700 leading-relaxed italic">
            "තෙරුවන් සරණයි! කන්දෙගම ඓතිහාසික ධනංජය රජමහා විහාරස්ථ සාගරමති පිරිවෙනේ නේවාසික මහා සංඝරත්නයේ දානය උදෙසා ඔබ විසින් බාරගන්නා ලද දානමය පුණ්‍යකර්මය තව දින 7කින් යෙදී ඇත..."
          </p>
        </div>

        {/* Confirmation Buttons Section */}
        <div className="px-6 space-y-4">
          <h2 className="text-center font-bold text-base text-gray-900 border-b pb-2">
            ඔබගේ දානමය දායකත්වයේ පැමිණීම පහතින් තහවුරු කරන්න:
          </h2>

          {submittedStatus ? (
            <div className="p-6 bg-emerald-50 rounded-2xl border-2 border-emerald-500 text-center space-y-3">
              <div className="w-14 h-14 bg-emerald-500 text-white rounded-full flex items-center justify-center mx-auto text-2xl font-bold shadow-md">✓</div>
              <h3 className="text-lg font-bold text-emerald-900">ඔබගේ තහවුරු කිරීම සාර්ථකව පිරිවෙන වෙත ලැබුණි!</h3>
              <p className="text-xs text-emerald-800 font-sans font-medium">
                {submittedStatus === "ATTENDING" && "🟢 ඔබ පැමිණ දානය පූජා කරන බව තහවුරු කළේය."}
                {submittedStatus === "BANK_TRANSFER" && "🔵 ඔබ විහාරස්ථ බැංකු ගිණුමට මුදල් තැන්පත් කරන බව තහවුරු කළේය."}
                {submittedStatus === "DECLINED" && "🔴 මෙවර පැමිණීමට නොහැකි බව තහවුරු කළේය."}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <button
                onClick={() => handleConfirmResponse("ATTENDING")}
                disabled={submitting}
                className="w-full py-4 px-5 bg-emerald-700 hover:bg-emerald-800 active:scale-95 text-white font-bold text-base rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2"
              >
                <span>🟢</span>
                <span>මම පැමිණ දානය පූජා කරමි</span>
              </button>

              <button
                onClick={() => handleConfirmResponse("BANK_TRANSFER")}
                disabled={submitting}
                className="w-full py-4 px-5 bg-blue-700 hover:bg-blue-800 active:scale-95 text-white font-bold text-base rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2"
              >
                <span>🔵</span>
                <span>විහාරස්ථ බැංකු ගිණුමට මුදල් බැර කරමි</span>
              </button>

              <button
                onClick={() => handleConfirmResponse("DECLINED")}
                disabled={submitting}
                className="w-full py-3.5 px-5 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold text-sm rounded-2xl transition-all flex items-center justify-center gap-2"
              >
                <span>🔴</span>
                <span>මෙවර පැමිණීමට නොහැක</span>
              </button>
            </div>
          )}
        </div>

        {/* Add to Mobile Phone Calendar Button */}
        <div className="px-6 pt-2">
          <a
            href={generateGoogleCalendarLink()}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-3 px-4 bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold text-xs rounded-2xl border border-amber-300 flex items-center justify-center gap-2 transition-all shadow-sm"
          >
            <span>📅</span>
            <span>ඔබගේ Phone Calendar එකට මතක් කිරීම් Alarm එකක් ලෙස එකතු කරගන්න</span>
          </a>
        </div>

        {/* Temple Contact Info */}
        <div className="px-6 pt-4 border-t text-center text-xs text-gray-500 font-sans space-y-1">
          <p className="font-bold text-gray-700 font-serif">තොරතුරු සඳහා විහාරස්ථානය අමතන්න:</p>
          <p>දුරකථන: 027-3272215 | Whatsapp: 070-5216408</p>
          <p className="text-[10px] text-amber-800 pt-2 font-bold">ඔබ සැමට තුනුරුවනේ අනන්ත ගුණ බලයෙන් සෙත සැලසේවා!</p>
        </div>

      </div>
    </div>
  );
};
