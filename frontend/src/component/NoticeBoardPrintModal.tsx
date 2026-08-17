import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { API_BASE_URL } from "../libs/api";

interface NoticeBoardPrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedMonth?: string;
}

export const NoticeBoardPrintModal: React.FC<NoticeBoardPrintModalProps> = ({
  isOpen,
  onClose,
  selectedMonth = ""
}) => {
  const { token } = useAuth();
  const [loading, setLoading] = useState<boolean>(true);
  const [sheetData, setSheetData] = useState<any>(null);
  const [filterMonth, setFilterMonth] = useState<string>(selectedMonth || "August");

  const monthOptions = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  useEffect(() => {
    if (isOpen) {
      fetchNoticeBoardData(filterMonth);
    }
  }, [isOpen, filterMonth, token]);

  const fetchNoticeBoardData = async (m: string) => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/dana/admin/notice-board?month=${encodeURIComponent(m)}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const json = await res.json();
        setSheetData(json);
      }
    } catch (e) {
      console.error("Error fetching notice board data", e);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Controls Header (Hidden during browser printing) */}
        <div className="print:hidden p-4 bg-gray-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-xl">🖨️</span>
            <div>
              <h2 className="font-bold text-sm">පිරිවෙන් පුවරුවේ ඇලවීමේ දාන ලැයිස්තුව (A4 Printable Notice Sheet)</h2>
              <p className="text-xs text-gray-400">මුද්‍රණය කිරීමට පෝස්ටර් මාදිලියේ සූදානම් කළ A4 පිටුව</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={filterMonth}
              onChange={(e) => setFilterMonth(e.target.value)}
              className="bg-gray-800 text-white text-xs px-3 py-1.5 rounded-lg border border-gray-700 font-bold focus:outline-none"
            >
              {monthOptions.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
            <button
              onClick={handlePrint}
              className="px-4 py-1.5 bg-amber-500 hover:bg-amber-600 text-black text-xs font-bold rounded-lg shadow-md transition-all flex items-center gap-1"
            >
              <span>🖨️</span> Print / Save PDF
            </button>
            <button
              onClick={onClose}
              className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-white text-xs font-bold rounded-lg transition-all"
            >
              ✕ Close
            </button>
          </div>
        </div>

        {/* Printable Content Body */}
        <div className="p-8 overflow-y-auto print:p-0 print:overflow-visible text-gray-900 bg-white" id="printable-notice-board">
          {loading ? (
            <div className="p-12 text-center text-gray-500 font-bold">ලැයිස්තුව සාදමින් පවතී...</div>
          ) : (
            <div className="border-4 border-amber-900/30 p-8 rounded-xl space-y-6">
              {/* Header Title */}
              <div className="text-center border-b-2 border-amber-900/20 pb-4 space-y-2">
                <h1 className="text-2xl font-black text-amber-950 tracking-wide">
                  කන්දෙගම ඓතිහාසික ධනංජය රජමහා විහාරස්ථ
                </h1>
                <h2 className="text-3xl font-extrabold text-amber-800">
                  සාගරමති පිරිවෙන් සංවර්ධන සභාව - දානමය කාලසටහන
                </h2>
                <div className="inline-block px-6 py-1 bg-amber-100 text-amber-900 font-bold rounded-full text-sm border border-amber-300 mt-2">
                  {sheetData?.month} මාසයේ අනුමත දානමය පුණ්‍යකර්ම ලැයිස්තුව (මුළු දානයන්: {sheetData?.totalCount || 0})
                </div>
              </div>

              {/* Data Table */}
              <table className="w-full text-left text-xs border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-amber-900 text-white font-bold">
                    <th className="p-2.5 border border-amber-800 text-center w-12">දිනය</th>
                    <th className="p-2.5 border border-amber-800">දායකයාගේ නම</th>
                    <th className="p-2.5 border border-amber-800">ලිපිනය</th>
                    <th className="p-2.5 border border-amber-800">දුරකථන / WhatsApp</th>
                    <th className="p-2.5 border border-amber-800">දාන මාදිලිය</th>
                    <th className="p-2.5 border border-amber-800">අරමුණ</th>
                    <th className="p-2.5 border border-amber-800 text-center">තැන්පතු</th>
                  </tr>
                </thead>
                <tbody>
                  {sheetData?.data?.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-gray-500 font-bold">
                        මෙම මාසය සඳහා අනුමත වූ දානමය පුණ්‍යකර්ම ලියාපදිංචි වී නොමැත.
                      </td>
                    </tr>
                  ) : (
                    sheetData?.data?.map((item: any, idx: number) => (
                      <tr key={item.id} className={idx % 2 === 0 ? "bg-white" : "bg-amber-50/40"}>
                        <td className="p-2 border border-gray-300 text-center font-bold text-sm text-amber-900">
                          {item.day}
                        </td>
                        <td className="p-2 border border-gray-300 font-bold text-gray-900">{item.name}</td>
                        <td className="p-2 border border-gray-300 text-gray-700">{item.address}</td>
                        <td className="p-2 border border-gray-300 font-medium">{item.phone}</td>
                        <td className="p-2 border border-gray-300 font-bold text-amber-800">{item.mealType}</td>
                        <td className="p-2 border border-gray-300 text-gray-700 italic">{item.purpose}</td>
                        <td className="p-2 border border-gray-300 text-center font-bold">
                          {item.isPaid ? (
                            <span className="text-emerald-700">✓ ගෙවා ඇත</span>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>

              {/* Footer Notice */}
              <div className="pt-4 border-t border-amber-900/20 flex items-center justify-between text-xs text-gray-600 font-medium">
                <div>
                  <p>📞 සාගරමති පිරිවෙන් සංවර්ධන සභාව | දුරකථන: 027-3272215 / 076-3272215</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">මුද්‍රණය කළ දිනය: {new Date().toLocaleDateString("si-LK")}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-amber-900">ලියාපදිංචි අනුමැතිය සහිතයි</p>
                  <p className="text-[10px] text-gray-400">Sagaramati Pirivena Management System</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
