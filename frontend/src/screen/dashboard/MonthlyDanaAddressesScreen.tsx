import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import { useAuth } from "../../context/AuthContext";
import { API_BASE_URL } from "../../libs/api";
import { isSameMonth } from "../../libs/month";

export const MonthlyDanaAddressesScreen: React.FC = () => {
  const { month } = useParams();
  const { token } = useAuth();
  const navigate = useNavigate();
  const [danas, setDanas] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedMonth, setSelectedMonth] = useState<string>(month || "August");

  const monthOptions = [
    "ALL", "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const fetchDanas = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/dana/admin/all`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        let list = data;
        if (selectedMonth && selectedMonth !== "ALL" && selectedMonth !== "All Months") {
          list = data.filter((d: any) => isSameMonth(d.month, selectedMonth));
        }
        const sorted = [...list].sort((a: any, b: any) => (parseInt(a.day, 10) || 0) - (parseInt(b.day, 10) || 0));
        setDanas(sorted);
      }
    } catch (e) {
      console.error("Failed to fetch danas for address labels", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDanas();
  }, [selectedMonth, token]);

  const handlePrint = () => {
    window.print();
  };


  return (
    <div className="bg-slate-100 min-h-screen p-4 sm:p-8 print:p-0 print:bg-white text-gray-900">
      {/* Print Page Styles */}
      <style>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 10mm;
          }
          body {
            background: white !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .print-hidden {
            display: none !important;
          }
          .address-card {
            break-inside: avoid;
            page-break-inside: avoid;
          }
        }
      `}</style>

      {/* Control Bar (Hidden when printing) */}
      <div className="max-w-5xl mx-auto mb-6 bg-white p-4 rounded-2xl shadow-sm border border-gray-200 flex flex-wrap items-center justify-between gap-4 print-hidden">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold rounded-xl transition-all"
          >
            ආපසු (Back)
          </button>
          <div>
            <h1 className="font-bold text-gray-900 text-lg">
              තැපැල් ලිපින ලැයිස්තුව (Postal Address Labels)
            </h1>
            <p className="text-xs text-gray-500">
              තෝරාගත් මාසය: <span className="font-semibold text-brand-1">{selectedMonth}</span> (සම්පූර්ණ ගණන: {danas.length})
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="bg-gray-50 text-gray-800 text-xs px-3 py-2 rounded-xl border border-gray-300 font-bold focus:outline-none focus:border-brand-1"
          >
            {monthOptions.map((m) => (
              <option key={m} value={m}>{m === "ALL" ? "සියලුම මාස" : m}</option>
            ))}
          </select>
          <button
            onClick={handlePrint}
            className="px-5 py-2 bg-brand-1 hover:bg-brand-2 text-white text-xs font-bold rounded-xl shadow-md transition-all"
          >
            Print / PDF ලෙස සුරකින්න
          </button>
        </div>
      </div>

      {/* Printable Address Label Cards Container */}
      <div className="max-w-5xl mx-auto bg-white p-6 sm:p-10 rounded-2xl shadow-md print:shadow-none print:p-0">
        {/* Document Title Header for Print */}
        <div className="text-center mb-6 border-b pb-4">
          <h2 className="text-xl font-bold text-gray-900">සාගරමතී පිරිවෙන - දායක තැපැල් ලිපින ලැයිස්තුව</h2>
          <p className="text-sm font-semibold text-gray-600 mt-1">
            අදාළ මාසය: {selectedMonth === "ALL" ? "සියලුම මාස" : selectedMonth}
          </p>
        </div>

        {loading ? (
          <div className="p-12 text-center text-gray-500 font-bold">ලිපින ලැයිස්තුව සූදානම් කරමින් පවතී...</div>
        ) : danas.length === 0 ? (
          <div className="p-12 text-center text-gray-500">මෙම මාසය සඳහා දායකයින් කිසිවෙකු නොමැත.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 print:grid-cols-2 print:gap-6">
            {danas.map((dana) => (
              <div
                key={dana.id}
                className="address-card border border-gray-300 rounded-lg p-6 bg-white shadow-sm print:shadow-none font-serif leading-relaxed"
              >
                {/* Donor Name (Bold) */}
                <div className="text-base font-bold text-gray-900 mb-1 tracking-wide">
                  {dana.name}{dana.name?.endsWith(",") ? "" : ","}
                </div>

                {/* Postal Address */}
                <div className="text-sm font-normal text-gray-800 whitespace-pre-line leading-relaxed">
                  {dana.address || "ලිපිනය ලබා දී නොමැත"}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
