import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
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

export const MonthlyDanaReportScreen: React.FC = () => {
  const { month } = useParams();
  const { token } = useAuth();
  const navigate = useNavigate();
  const [danas, setDanas] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchDanas();
  }, [month, token]);

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
        // Sort by day ascending (1 to 31)
        const sorted = [...list].sort((a: any, b: any) => (parseInt(a.day, 10) || 0) - (parseInt(b.day, 10) || 0));
        setDanas(sorted);
      }
    } catch (e) {
      console.error("Failed to fetch danas for report", e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-10 text-center text-ink font-semibold">Loading Report...</div>;

  const totalMonthRevenue = danas.reduce((sum, dana) => {
    const danaPaid = (dana.payments || [])
      .filter((p: any) => p.status === "APPROVED")
      .reduce((pSum: number, p: any) => pSum + (parseFloat(p.amount) || 0), 0);
    return sum + danaPaid;
  }, 0);

  return (
    <div className="bg-slate-100 min-h-screen p-4 sm:p-8 print:p-0 print:bg-white text-ink">
      {/* Print Page Margin & Color Adjust Rules */}
      <style>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 12mm;
          }
          body {
            background: white !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }
      `}</style>

      {/* Control Bar (Hidden when printing) */}
      <div className="max-w-6xl mx-auto mb-6 bg-white p-4 rounded-2xl shadow-sm border border-brand-1/10 flex flex-wrap items-center justify-between gap-4 print:hidden">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-ink text-sm font-bold rounded-xl transition-all"
          >
            Back
          </button>
          <div>
            <h1 className="font-bold text-ink text-lg">
              {month === "ALL" ? "Comprehensive Sponsorships & Payments Report" : `${month} All Sponsorships & Payments Report`}
            </h1>
            <p className="text-xs text-subtle">Total Dana Count: {danas.length}</p>
          </div>
        </div>
        <button
          onClick={() => window.print()}
          className="px-6 py-2.5 bg-brand-1 hover:bg-brand-2 text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center gap-2"
        >
          Download PDF / Print
        </button>
      </div>

      {/* Main Printable Document */}
      <div
        className="max-w-6xl mx-auto bg-white p-8 sm:p-12 rounded-2xl shadow-md border-4 border-double border-brand-1/50 print:shadow-none print:border-4 print:border-double print:border-brand-1/70 print:p-8 print:w-full print:m-0"
      >
        {/* Header */}
        <div className="border-b-2 border-brand-1/30 pb-4 mb-6 text-center">
          {/* Top Logo & Flanking Buddhist Flags at Outer Ends */}
          <div className="flex items-center justify-between w-full mb-3 px-1">
            <BuddhistFlagSVG />
            <img
              src="/logo.png"
              alt="Sāgaramati Pirivena Logo"
              className="w-32 h-32 sm:w-40 sm:h-40 object-contain"
            />
            <BuddhistFlagSVG />
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-brand-1 mb-2">
            Sāgaramati Pirivena Development Council
          </h1>
          <p className="text-xs font-semibold text-gray-700 mt-1">
            Dhananjaya Rajamaha Viharaya, Kandegama, Polonnaruwa
          </p>
          <div className="mt-3 py-1.5 px-4 bg-brand-1/5 border border-brand-1/15 rounded-lg inline-block">
            <h2 className="text-base sm:text-lg font-bold text-ink">
              {month === "ALL" 
                ? "Comprehensive Sponsorships & Payments Report" 
                : `${month} All Sponsorships & Payments Detailed Report`}
            </h2>
          </div>
          <div className="flex justify-between items-center text-xs text-gray-500 mt-4 px-2">
            <p>Total Dana Count: <strong className="text-ink">{danas.length}</strong></p>
            <p>Issued Date: <strong className="text-ink">{new Date().toISOString().split("T")[0].replace(/-/g, ".")}</strong></p>
          </div>
        </div>

        {/* Data Table */}
        {danas.length === 0 ? (
          <p className="text-center text-gray-500 py-12">No Dana bookings found for the selected month.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-100 text-ink border-b border-gray-300 font-bold">
                  <th className="p-2.5 border-r border-gray-300 text-center w-12">Day</th>
                  <th className="p-2.5 border-r border-gray-300 w-1/4">Applicant Name & Address</th>
                  <th className="p-2.5 border-r border-gray-300 w-28">Phone / Whatsapp</th>
                  <th className="p-2.5 border-r border-gray-300 w-32">Meal & Purpose</th>
                  <th className="p-2.5 border-r border-gray-300">Payments History</th>
                  <th className="p-2.5 text-right w-24">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-300">
                {danas.map((dana) => {
                  const displayName = dana.name.trim();

                  const rawAddress = (dana.address && !dana.address.includes("N/A"))
                    ? dana.address
                    : (dana.user?.address && !dana.user?.address.includes("N/A"))
                    ? dana.user.address
                    : null;
                  const addressLines = rawAddress
                    ? rawAddress.split(",").map((s: string) => s.trim()).filter(Boolean)
                    : [];

                  const phone = (dana.phone && !dana.phone.includes("N/A")) ? dana.phone : dana.user?.phone;
                  const whatsapp = (dana.whatsapp && !dana.whatsapp.includes("N/A")) ? dana.whatsapp : dana.user?.whatsapp;

                  const approvedPayments = (dana.payments || []).filter((p: any) => p.status === "APPROVED");
                  const totalPaid = approvedPayments.reduce((sum: number, p: any) => sum + (parseFloat(p.amount) || 0), 0);

                  const mealText = dana.mealType === "MORNING" ? "Morning Meal" : dana.mealType === "NOON" ? "Midday Meal" : "Evening Refreshments";

                  return (
                    <tr key={dana.id} className="border-b border-gray-300 hover:bg-gray-50/50 align-top">
                      {/* Day Number */}
                      <td className="p-2.5 border-r border-gray-300 text-center font-bold text-brand-1">
                        {dana.day}
                      </td>

                      {/* Donor Name & Address */}
                      <td className="p-2.5 border-r border-gray-300">
                        <p className="font-bold text-ink text-sm mb-1">{displayName}</p>
                        {addressLines.length > 0 ? (
                          <div className="text-[11px] text-gray-600 space-y-0.5">
                            {addressLines.map((line: string, i: number) => (
                              <p key={i}>{line}{i < addressLines.length - 1 ? "," : "."}</p>
                            ))}
                          </div>
                        ) : (
                          <p className="text-[10px] text-gray-400 italic">No address provided</p>
                        )}
                      </td>

                      {/* Phone / Whatsapp */}
                      <td className="p-2.5 border-r border-gray-300 text-[11px] space-y-1">
                        {phone && <p><span className="font-semibold">Phone:</span> {phone}</p>}
                        {whatsapp && <p className="text-green-700 font-medium"><span className="font-semibold">WA:</span> {whatsapp}</p>}
                        {!phone && !whatsapp && <p className="text-gray-400 italic text-[10px]">-</p>}
                      </td>

                      {/* Meal & Purpose */}
                      <td className="p-2.5 border-r border-gray-300">
                        <span className="font-bold text-brand-1 text-[11px] block">{mealText}</span>
                        <span className="text-[11px] text-gray-600 block mt-0.5">{dana.purpose}</span>
                      </td>

                      {/* Detailed Payment History Breakdown */}
                      <td className="p-2.5 border-r border-gray-300">
                        {approvedPayments.length === 0 ? (
                          <span className="inline-block px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 rounded text-[10px] font-bold">
                            Pending (No Payments)
                          </span>
                        ) : (
                          <div className="space-y-1 text-[11px]">
                            {approvedPayments.map((p: any, idx: number) => {
                              const payDate = p.createdAt ? new Date(p.createdAt).toISOString().split("T")[0] : "";
                              return (
                                <div key={p.id || idx} className="flex justify-between items-center bg-gray-50 px-2 py-1 rounded border border-gray-200">
                                  <span>
                                    <strong className="text-ink">Year {p.year}:</strong> {payDate && <span className="text-gray-500 text-[10px]">({payDate})</span>}
                                  </span>
                                  <strong className="text-green-700">LKR {parseFloat(p.amount).toLocaleString()}</strong>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </td>

                      {/* Total Paid Amount */}
                      <td className="p-2.5 text-right font-bold text-sm text-green-700">
                        {totalPaid > 0 ? `LKR ${totalPaid.toLocaleString()}` : "LKR 0"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer Summary & Signatures */}
        <div className="mt-8 pt-4 border-t border-gray-300 space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-end gap-6 text-xs">
            <div className="p-3 bg-brand-1/5 rounded-xl border border-brand-1/20 space-y-1">
              <p className="font-bold text-brand-1 text-sm">Total Collection:</p>
              <p className="text-base font-black text-ink">LKR {totalMonthRevenue.toLocaleString()}</p>
            </div>

            <div className="flex gap-12 text-center font-bold">
              <div>
                <div className="w-32 border-b border-gray-400 mb-2"></div>
                <p>President</p>
              </div>
              <div>
                <div className="w-32 border-b border-gray-400 mb-2"></div>
                <p>Secretary</p>
              </div>
            </div>
          </div>

          <div className="pt-2 text-center text-xs text-brand-1 font-semibold tracking-wide">
            Sagaramati Monastic Development Council
          </div>
        </div>
      </div>
    </div>
  );
};
