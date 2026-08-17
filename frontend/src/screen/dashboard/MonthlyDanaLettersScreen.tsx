import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useSearchParams, Link } from "react-router";
import { useAuth } from "../../context/AuthContext";
import { API_BASE_URL } from "../../libs/api";
import { isSameMonth } from "../../libs/month";

const BuddhistFlagSVG = () => (
  <svg className="w-16 h-11 sm:w-24 sm:h-16 shadow-md rounded border border-gray-300 inline-block shrink-0" viewBox="0 0 60 40">
    <rect x="0" y="0" width="10" height="40" fill="#003594" />
    <rect x="10" y="0" width="10" height="40" fill="#FFD100" />
    <rect x="20" y="0" width="10" height="40" fill="#D21034" />
    <rect x="30" y="0" width="10" height="40" fill="#FFFFFF" stroke="#E5E7EB" strokeWidth="0.5" />
    <rect x="40" y="0" width="10" height="40" fill="#FF6700" />
    <g transform="translate(50, 0)">
      <rect x="0" y="0" width="10" height="8" fill="#003594" />
      <rect x="0" y="8" width="10" height="8" fill="#FFD100" />
      <rect x="0" y="16" width="10" height="8" fill="#D21034" />
      <rect x="0" y="24" width="10" height="8" fill="#FFFFFF" stroke="#E5E7EB" strokeWidth="0.5" />
      <rect x="0" y="32" width="10" height="8" fill="#FF6700" />
    </g>
  </svg>
);

const renderHighlightedText = (template: string, values: Record<string, string>) => {
  let tokenized = template;
  Object.keys(values).forEach((key) => {
    const regex = new RegExp(`\\{${key}\\}`, "g");
    tokenized = tokenized.replace(regex, `__HL_${key}__`);
  });

  const parts = tokenized.split(/(__HL_[a-zA-Z0-9_]+__)/g);

  return parts.map((part, index) => {
    if (part.startsWith("__HL_") && part.endsWith("__")) {
      const key = part.slice(5, -2);
      const val = values[key];
      if (val !== undefined) {
        return (
          <strong key={index} className="text-brand-1 font-bold">
            {val}
          </strong>
        );
      }
    }
    return part;
  });
};

export const MonthlyDanaLettersScreen: React.FC = () => {
  const { month } = useParams();
  const [searchParams] = useSearchParams();
  const { token } = useAuth();
  const navigate = useNavigate();
  const [danas, setDanas] = useState<any[]>([]);
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [lang, setLang] = useState<"en" | "si">("en");

  useEffect(() => {
    fetchSettings();
    fetchDanas();
  }, [month, token, searchParams]);

  const fetchSettings = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/settings`);
      if (res.ok) {
        const data = await res.json();
        setSettings(data);
      }
    } catch (e) {
      console.error("Error fetching settings for letters", e);
    }
  };

  const fetchDanas = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/dana/admin/all`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        let list = data;
        if (month && month !== "ALL") {
          list = data.filter((d: any) => isSameMonth(d.month, month));
        }
        const singleId = searchParams.get("id");
        if (singleId) {
          const single = list.filter((d: any) => String(d.id) === String(singleId));
          if (single.length > 0) list = single;
        }
        setDanas([...list].sort((a: any, b: any) => (parseInt(a.day, 10) || 0) - (parseInt(b.day, 10) || 0)));
      }
    } catch (e) {
      console.error("Failed to fetch danas for letters", e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-10 text-center text-ink font-semibold">Loading Letters...</div>;

  return (
    <div className="bg-slate-100 min-h-screen p-4 sm:p-8 print:p-0 print:bg-white">
      {/* Print Page Margin & Color Adjust Rules */}
      <style>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 5mm 8mm;
          }
          body {
            background: white !important;
            margin: 0 !important;
            padding: 0 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .print-letter-card {
            width: 100% !important;
            max-width: 194mm !important;
            height: 277mm !important;
            max-height: 277mm !important;
            padding: 5mm 8mm !important;
            margin: 0 auto !important;
            box-sizing: border-box !important;
            page-break-after: always !important;
            break-after: page !important;
            display: flex !important;
            flex-direction: column !important;
            justify-content: space-between !important;
            overflow: hidden !important;
            border: 3px double #800000 !important;
            border-radius: 0 !important;
            box-shadow: none !important;
          }
        }
      `}</style>

      {/* Top Bar for Print / Controls */}
      <div className="max-w-4xl mx-auto mb-6 bg-white p-4 rounded-2xl shadow-sm border border-brand-1/10 flex flex-wrap items-center justify-between gap-4 print:hidden">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-ink text-sm font-bold rounded-xl transition-all">
            Back
          </button>
          <div>
            <h1 className="font-bold text-ink">Monthly Dana Letters - {month === "ALL" ? "All Months" : month}</h1>
            <p className="text-xs text-subtle">Total Dana Count: {danas.length}</p>
          </div>
        </div>

        {/* Language Switcher Buttons */}
        <div className="flex bg-gray-100 p-1 rounded-xl border border-brand-1/20">
          <button
            onClick={() => setLang("en")}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
              lang === "en"
                ? "bg-brand-1 text-white shadow-md"
                : "text-gray-600 hover:text-ink hover:bg-gray-200"
            }`}
          >
            English Letters
          </button>
          <button
            onClick={() => setLang("si")}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
              lang === "si"
                ? "bg-brand-1 text-white shadow-md"
                : "text-gray-600 hover:text-ink hover:bg-gray-200"
            }`}
          >
            සිංහල ලිපි (Sinhala Letters)
          </button>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to={`/admin/monthly-addresses/${month}`}
            className="px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1"
          >
            තැපැල් ලිපින (Postal Address Slips)
          </Link>

          <button
            onClick={() => window.print()}
            className="px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center gap-2"
          >
            Print / Save PDF
          </button>
        </div>
      </div>

      {danas.length === 0 ? (
        <div className="max-w-4xl mx-auto bg-white p-12 rounded-2xl text-center text-subtle font-semibold">
          No Dana bookings found for the selected month.
        </div>
      ) : (
        <div className="max-w-4xl mx-auto space-y-8 print:space-y-0">
          {danas.map((dana, index) => {
            const mealNameEn = dana.mealType === 'MORNING' ? 'Morning Meal (Heel Dana)' : dana.mealType === 'NOON' ? 'Midday Meal (Dawal Dana)' : 'Evening Refreshments (Gilampasa)';
            const mealNameSi = dana.mealType === 'MORNING' ? 'හීල් දානමය පුණ්‍යකර්මය' : dana.mealType === 'NOON' ? 'දවල් දානමය පුණ්‍යකර්මය' : 'ගිලන්පස පූජාව';
            
            const yearStr = dana.year || new Date().getFullYear();
            const displayName = dana.name.trim();

            const isMonk = displayName.includes("Rev.") || displayName.includes("Venerable") || displayName.includes("Thero") || displayName.includes("හිමි") || displayName.includes("ස්වාමීන්") || displayName.includes("නායක");
            const isFemale = displayName.includes("Mrs.") || displayName.includes("Miss") || displayName.includes("Ms.") || displayName.includes("මහත්මිය");

            const salutationEn = isMonk ? "Venerable Sir," : isFemale ? "Dear Madam," : "Dear Sir,";
            const salutationSi = isMonk ? "පූජනීය හාමුදුරුවනේ," : isFemale ? "පින්වත් මහත්මියනි," : "පින්වත් මහත්මයාණනි,";

            const recipientEn = isMonk ? "Venerable Sir" : "you";
            const recipientSi = isMonk ? "පූජනීය ඔබවහන්සේ" : isFemale ? "ඔබතුමිය" : "ඔබතුමා";
            const recipientPossessiveSi = isMonk ? "ඔබවහන්සේගේ" : isFemale ? "ඔබතුමියගේ" : "ඔබතුමාගේ";

            // Template fields English
            const orgTitleEn = settings.letter_org_title || "Sagaramati Pirivena Development Council";
            const patron1En = settings.letter_patron_1 || "Patron: Ven. Gonawala Sudassilankara Nahimipano";
            const patron2En = settings.letter_patron_2 || "Chief President: Ven. Kandegama Deepawansalankara Thero";
            const patron3En = settings.letter_patron_3 || "Chief Secretary: Ven. Horana Vijayawansalankara Thero";
            const patron4En = settings.letter_patron_4 || "Treasurer: Mr. H. M. Gunapala";
            const presidentEn = settings.letter_president || "Chief Organizer: Mr. K. G. C. Gunawardena";
            const addr1En = settings.letter_address_1 || "Sagaramati Pirivena";
            const addr2En = settings.letter_address_2 || "Dhananjaya Rajamaha Viharaya";
            const addr3En = settings.letter_address_3 || "Kandegama, Polonnaruwa";
            const subjectEn = settings.letter_subject || "Annual Dana Offering Sponsorship";
            const bankNameEn = settings.letter_bank_name || "People's Bank - Aralaganwila Branch";
            const bankAccEn = settings.letter_bank_acc || "253200150044402";
            const bankOwnerEn = settings.letter_bank_owner || "Sagaramati Pirivena Development Council";
            const sigPresEn = settings.letter_sig_pres || "President";
            const sigSecEn = settings.letter_sig_sec || "Secretary";

            // Template fields Sinhala
            const orgTitleSi = settings.letter_org_title_si || "සාගරමති පිරිවෙන් සංවර්ධන සභාව";
            const patron1Si = settings.letter_patron_1_si || "අනුශාසක : පූජ්‍ය ගෝණවල සුදස්සීලංකාර නාහිමිපාණෝ";
            const patron2Si = settings.letter_patron_2_si || "ප්‍රධාන සභාපති : පූජ්‍ය කන්දේගම දීපවංසාලංකාර හිමි";
            const patron3Si = settings.letter_patron_3_si || "ප්‍රධාන ලේකම් : පූජ්‍ය හොරණ විජයවංසාලංකාර හිමි";
            const patron4Si = settings.letter_patron_4_si || "භාණ්ඩාගාරික : එච්. එම්. ගුණපාල මහතා";
            const presidentSi = settings.letter_president_si || "ප්‍රධාන සංවිධායක : කේ. ජී. සී. ගුණවර්ධන මහතා";
            const addr1Si = settings.letter_address_1_si || "සාගරමති පිරිවෙන";
            const addr2Si = settings.letter_address_2_si || "ධනංජය රජමහා විහාරය";
            const addr3Si = settings.letter_address_3_si || "කන්දෙගම, පොළොන්නරුව";
            const subjectSi = settings.letter_subject_si || "වාර්ෂික දානමය පුණ්‍යකර්මය පිළිබඳ පූර්ව දැනුම්දීම";
            const bankNameSi = settings.letter_bank_name_si || "මහජන බැංකුව - අරලගංවිල ශාඛාව";
            const bankAccSi = settings.letter_bank_acc_si || "253200150044402";
            const bankOwnerSi = settings.letter_bank_owner_si || "සාගරමති පිරිවෙන් සංවර්ධන සභාව";
            const sigPresSi = settings.letter_sig_pres_si || "සභාපති";
            const sigSecSi = settings.letter_sig_sec_si || "ලේකම්";

            return (
              <div 
                key={dana.id || index}
                className="print-letter-card bg-white p-6 sm:p-8 rounded-2xl shadow-md border-4 border-double border-brand-1/50 relative overflow-hidden text-ink"
                style={lang === "si" ? { fontFamily: "'Noto Serif Sinhala', 'Abhaya Libre', serif" } : {}}
              >
                {/* Official Letterhead Header */}
                <div className="border-b border-brand-1/30 pb-2 mb-2">
                  {/* Top Logo & Flanking Buddhist Flags at Outer Ends */}
                  <div className="flex items-center justify-between w-full mb-1 px-1">
                    <BuddhistFlagSVG />
                    <img
                      src="/logo.png"
                      alt="Sagaramati Pirivena Logo"
                      className="w-16 h-16 sm:w-20 sm:h-20 object-contain"
                    />
                    <BuddhistFlagSVG />
                  </div>

                  {/* Main Title Top */}
                  <div className="text-center mb-1">
                    <h2 className="text-lg sm:text-xl font-black text-brand-1 tracking-wide">
                      {lang === "en" ? orgTitleEn : orgTitleSi}
                    </h2>
                  </div>

                  {/* 2-Column Info: Patrons (Left) & Contact (Right) */}
                  <div className="flex justify-between items-start text-[11px] leading-tight text-gray-700">
                    {/* Left Column - Patrons */}
                    <div className="space-y-0.5 whitespace-nowrap">
                      {lang === "en" ? (
                        <>
                          <p className="font-bold text-ink">{patron1En}</p>
                          <p className="font-bold text-ink">{patron2En}</p>
                          <p className="font-bold text-ink">{patron3En}</p>
                          <p className="font-bold text-ink">{patron4En}</p>
                          <p className="font-bold text-ink">{presidentEn}</p>
                        </>
                      ) : (
                        <>
                          <p className="font-bold text-ink">{patron1Si}</p>
                          <p className="font-bold text-ink">{patron2Si}</p>
                          <p className="font-bold text-ink">{patron3Si}</p>
                          <p className="font-bold text-ink">{patron4Si}</p>
                          <p className="font-bold text-ink">{presidentSi}</p>
                        </>
                      )}
                    </div>

                    {/* Right Column - Address & Contact */}
                    <div className="text-left space-y-0.5 whitespace-nowrap text-[11px]">
                      <p className="font-bold text-xs text-ink">{lang === "en" ? addr1En : addr1Si}</p>
                      <p>{lang === "en" ? addr2En : addr2Si}</p>
                      <p>{lang === "en" ? addr3En : addr3Si}</p>
                      <p>Phone: {settings.letter_phone || "027-3272215"}</p>
                      <p>Whatsapp: {settings.letter_whatsapp || "076-3272215"}</p>
                      <p>Email: {settings.letter_email || "psagaramathi@yahoo.com"}</p>
                    </div>
                  </div>
                </div>

                {/* Donor Address Block & Date */}
                <div className="flex justify-between items-start my-3 text-xs sm:text-sm">
                  <div className="space-y-0.5 max-w-lg">
                    <p className="font-bold text-sm sm:text-base text-ink">{displayName},</p>
                    {(() => {
                      const rawAddress = (dana.address && !dana.address.includes("N/A")) 
                        ? dana.address 
                        : (dana.user?.address && !dana.user?.address.includes("N/A")) 
                        ? dana.user.address 
                        : null;

                      if (rawAddress) {
                        const lines = rawAddress.split(",").map((s: string) => s.trim()).filter(Boolean);
                        return (
                          <div className="space-y-0.5">
                            {lines.map((line: string, i: number) => (
                              <p key={i} className="text-gray-800 font-medium leading-tight">
                                {line}{i < lines.length - 1 ? "," : "."}
                              </p>
                            ))}
                          </div>
                        );
                      }

                      return (
                        <div className="space-y-1 pt-1 opacity-40">
                          <p className="border-b border-dotted border-gray-400 w-80 h-3"></p>
                          <p className="border-b border-dotted border-gray-400 w-80 h-3"></p>
                        </div>
                      );
                    })()}
                    {((dana.phone && !dana.phone.includes("N/A")) || (dana.user?.phone && !dana.user?.phone.includes("N/A"))) && (
                      <p className="text-gray-700 text-xs mt-0.5 font-semibold">
                        {lang === "en" ? "Phone: " : "දුරකථන අංකය: "}{dana.phone && !dana.phone.includes("N/A") ? dana.phone : dana.user.phone}
                      </p>
                    )}
                  </div>
                  <div className="text-right text-xs text-gray-600">
                    <p className="font-bold text-gray-800">
                      {lang === "en" ? "Date: " : "දිනය: "}{new Date().toISOString().split("T")[0].replace(/-/g, ".")}
                    </p>
                    <p className="mt-0.5 font-black text-brand-1">
                      {lang === "en" ? "Ref No: #" : "ලියාපදිංචි අංකය: #"}{dana.id}
                    </p>
                  </div>
                </div>

                {/* Salutation */}
                <p className="font-bold text-sm sm:text-base mb-2 text-ink">
                  {lang === "en" ? salutationEn : salutationSi}
                </p>

                {/* Subject Heading */}
                <div className="text-center my-2">
                  <span className="text-base sm:text-lg font-black text-brand-1 border-b-2 border-brand-1 pb-0.5 inline-block">
                    {lang === "en" ? subjectEn : subjectSi}
                  </span>
                </div>

                {/* Letter Body Content */}
                <div className="text-xs sm:text-sm leading-relaxed space-y-2.5 text-gray-900 text-justify font-medium">
                  {lang === "en" ? (
                    <>
                      <p>
                        We express our heartfelt gratitude to {recipientEn} for coming forward to sponsor the requisite needs of the resident monks of Sagaramati Pirivena, Dhananjaya Rajamaha Viharaya, Kandegama.
                      </p>
                      <p>
                        Accordingly, we kindly remind you that every year on <strong className="text-brand-1 font-bold">{dana.month} {dana.day}</strong>, the sponsorship for <strong className="text-ink font-bold">"{dana.purpose || 'Dana Offering'}"</strong> has been reserved in your name.
                      </p>
                      <p>
                        Therefore, we respectfully remind you that for this year <strong className="font-bold">{yearStr}</strong>, on <strong className="text-brand-1 font-bold">{dana.month} {dana.day}</strong>, monks will be present for your <strong className="text-brand-1 font-bold">{mealNameEn}</strong>. You may attend in person to offer the Dana or contribute by depositing funds into the temple bank account below. If you wish to attend in person, please contact the phone numbers listed above for further details. If depositing funds, please transfer to the bank account below and send a copy of the receipt by post, email, or Whatsapp. The estimated expense for morning and midday meals is approximately LKR 5000.
                      </p>
                    </>
                  ) : (
                    <>
                      <p>
                        {renderHighlightedText(
                          (settings.letter_body_p1_si || "කන්දෙගම ඓතිහාසික ධනංජය රජමහා විහාරස්ථ සාගරමති පිරිවෙනේ නේවාසික මහා සංඝරත්නයේ සිව්පසය උදෙසා {recipient} විසින් ඉදිරිපත්ව දායකත්වය ලබාදීම පිළිබඳව අපගේ ප්‍රණාමය පුද කරමු.")
                            .replace(/ඔබතුමන්ලා/g, "{recipient}")
                            .replace(/ගෞරවනීය/g, "පින්වත්"),
                          { recipient: recipientSi }
                        )}
                      </p>
                      <p>
                        {renderHighlightedText(
                          (settings.letter_body_p2_si || "ඒ අනුව, සෑම වසරකම {month} මස {day} වන දින \"{purpose}\" සඳහා වන දානමය දායකත්වය {recipient_possessive} නමින් වෙන් කර ඇති බව කාරුණිකව මතක් කර සිටිමු.")
                            .replace(/ඔබතුමන්ලාගේ/g, "{recipient_possessive}"),
                          {
                            month: dana.month,
                            day: `${dana.day} වන දින`,
                            purpose: dana.purpose || 'දානමය පුණ්‍යකර්මය',
                            recipient_possessive: recipientPossessiveSi,
                            recipient: recipientSi
                          }
                        )}
                      </p>
                      <p>
                        {renderHighlightedText(
                          settings.letter_body_p3_si || "එබැවින්, මෙවර {year} වසරේ {month} මස {day} වන දිනට යෙදෙන ඔබගේ {meal_type} සඳහා මහා සංඝරත්නය වඩමවන බව දැනුම් දෙමු. ඔබට පැමිණ දානය පූජා කිරීමට හෝ පහත සඳහන් විහාරස්ථ බැංකු ගිණුමට ආධාර තැන්පත් කිරීමට හැක. ගිණුමට මුදල් බැර කරන්නේ නම්, රිසිට් පතෙහි පිටපතක් දුරකථනයෙන්, ලිපිනෙන්, Email හෝ Whatsapp මගින් අප වෙත එවීමට කාරුණික වන්න. හීල් සහ දවල් දානමය වියදම ආසන්න වශයෙන් රුපියල් 5000 ක් පමණ වේ.",
                          {
                            year: String(yearStr),
                            month: dana.month,
                            day: `${dana.day} වන දිනට`,
                            meal_type: mealNameSi
                          }
                        )}
                      </p>
                    </>
                  )}
                </div>

                {/* Bank Account Details Box */}
                <div className="my-3 p-3 bg-brand-1/5 rounded-xl border border-brand-1/20 space-y-0.5 text-xs sm:text-sm font-bold">
                  <p className="font-bold text-sm text-brand-1">{lang === "en" ? bankNameEn : bankNameSi}</p>
                  <p className="font-bold text-ink">
                    {lang === "en" ? "Account Number - " : "ගිණුම් අංකය - "}{lang === "en" ? bankAccEn : bankAccSi}
                  </p>
                  <p className="font-bold text-ink">
                    {lang === "en" ? "Account Name - " : "ගිණුමේ නම - "}{lang === "en" ? bankOwnerEn : bankOwnerSi}
                  </p>
                </div>

                {/* Footer Signatures */}
                <div className="pt-2 border-t border-gray-200 space-y-2">
                  <p className="text-center font-bold text-xs sm:text-sm text-brand-1">
                    {lang === "en" ? "May the Noble Triple Gem Bless You!" : "ඔබ සැමට තුනුරුවනේ අනන්ත ගුණ බලයෙන් සෙත සැලසේවා!"}
                  </p>
                  <div className="flex justify-between items-end px-6 text-xs font-bold">
                    <div className="text-center">
                      <div className="w-36 border-b border-gray-400 mb-1"></div>
                      <p>{lang === "en" ? sigPresEn : sigPresSi}</p>
                    </div>
                    <div className="text-center">
                      <div className="w-36 border-b border-gray-400 mb-1"></div>
                      <p>{lang === "en" ? sigSecEn : sigSecSi}</p>
                    </div>
                  </div>

                  <div className="pt-1 text-center text-[10px] text-brand-1 font-semibold tracking-wide">
                    {lang === "en" ? "Sagaramati Monastic Development Council" : "සාගරමති පිරිවෙන් සංවර්ධන සභාව"}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MonthlyDanaLettersScreen;
