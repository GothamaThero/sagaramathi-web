import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import { useAuth } from "../context/AuthContext";

export const CertificateScreen = () => {
  const { id } = useParams();
  const { token } = useAuth();
  const [dana, setDana] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDana = async () => {
      try {
        const res = await fetch(`http://localhost:3000/api/dana/admin/all`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          const found = data.find((d: any) => d.id === Number(id));
          if (found) setDana(found);
        }
      } catch (e) {
        console.error("Error fetching dana for certificate", e);
      }
    };
    if (token) fetchDana();
  }, [id, token]);

  if (!dana) return <div className="p-10 text-center">Loading Certificate...</div>;

  const mealName = dana.mealType === 'MORNING' ? 'හීල් දානය' : dana.mealType === 'NOON' ? 'දවල් දානය' : 'ගිලන්පස';

  return (
    <div className="bg-white min-h-screen p-8 flex flex-col items-center justify-center">
      {/* Non-printable back button */}
      <div className="mb-4 print:hidden">
        <button onClick={() => navigate(-1)} className="mr-4 px-4 py-2 bg-gray-200 rounded">Back</button>
        <button onClick={() => window.print()} className="px-4 py-2 bg-brand-1 text-white rounded">Print / Save as PDF</button>
      </div>

      {/* Printable Certificate Area */}
      <div className="border-8 border-brand-1/20 p-12 max-w-4xl w-full text-center relative overflow-hidden print:border-4 print:border-black">
        {/* Background decorative pattern */}
        <div className="absolute inset-0 opacity-5 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:16px_16px]"></div>
        
        <div className="relative z-10">
          <h1 className="text-4xl font-black text-brand-1 mb-8" style={{ fontFamily: 'sans-serif' }}>පුණ්‍යානුමෝදනාව</h1>
          
          <div className="text-lg space-y-6 leading-relaxed mb-12">
            <p>
              සාගරමතී ආරණ්‍ය සේනාසනයේ වැඩ වසන මහා සංඝරත්නය උදෙසා<br/>
              <strong>{dana.year || new Date().getFullYear()}</strong> වර්ෂයේ <strong>{dana.month}</strong> මස <strong>{dana.day}</strong> වන දින
            </p>
            <p className="text-2xl font-bold text-ink">
              {dana.name} මහතා/මහත්මිය ඇතුළු පිරිස
            </p>
            <p>විසින් මහත් ශ්‍රද්ධාවෙන් යුතුව පූජා කරන ලද</p>
            <p className="text-3xl font-black text-brand-2 bg-brand-1/10 inline-block px-6 py-2 rounded-full border border-brand-1/20">
              {mealName}
            </p>
            <p className="mt-6 text-sm text-subtle max-w-2xl mx-auto">
              අරමුණ: {dana.purpose}
            </p>
            <p>
              මෙම උතුම් වූ දානමය පුණ්‍යකර්මයෙන් ජනිත වූ සියලු පින්, ඔබ සැමටත්, පවුලේ සැමටත්, මියගිය ඥාතීන්ටත් අනුමෝදන් වේවා!
            </p>
            <p className="text-xl font-bold mt-4">
              නිදුක් නිරෝගී සුවය හා චිත්ත ශාන්තිය සැලසේවා!
            </p>
          </div>

          <div className="flex justify-between items-end mt-20 pt-8 border-t border-brand-1/20">
            <div className="text-left">
              <p className="text-xs text-subtle">Date Issued: {new Date().toLocaleDateString()}</p>
              <p className="text-xs text-subtle">Booking Ref: #{dana.id}</p>
            </div>
            <div className="text-center">
              <div className="w-40 border-b border-black mb-2"></div>
              <p className="text-sm font-bold">සාගරමතී ආරණ්‍ය සේනාසනය</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
