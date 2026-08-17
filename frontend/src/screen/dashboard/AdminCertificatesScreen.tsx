import React, { useEffect, useState } from "react";
import { Link } from "react-router";
import { useAuth } from "../../context/AuthContext";
import { EditDanaModal } from "../../component/EditDanaModal";
import { API_BASE_URL } from "../../libs/api";

export const AdminCertificatesScreen: React.FC = () => {
  const { token } = useAuth();
  const [approvedDanas, setApprovedDanas] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [editingDana, setEditingDana] = useState<any | null>(null);

  useEffect(() => {
    fetchApprovedDanas();
  }, [token]);

  const fetchApprovedDanas = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/dana/admin/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        const approved = data.filter((d: any) => d.status === "APPROVED");
        setApprovedDanas(approved);
      }
    } catch (e) {
      console.error("Error fetching certificates", e);
    } finally {
      setLoading(false);
    }
  };

  const filteredCertificates = approvedDanas.filter((d) => {
    const nameMatch = d.name?.toLowerCase().includes(searchQuery.toLowerCase());
    const monthMatch = d.month?.toLowerCase().includes(searchQuery.toLowerCase());
    const dayMatch = d.day?.toString().includes(searchQuery);
    const purposeMatch = d.purpose?.toLowerCase().includes(searchQuery.toLowerCase());
    return nameMatch || monthMatch || dayMatch || purposeMatch;
  });

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Screen Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-brand-1/10">
        <div>
          <h1 className="text-2xl font-black text-ink flex items-center gap-2">
            Certificates Management
            <span className="px-3 py-1 bg-amber-100 text-amber-900 text-xs font-bold rounded-full border border-amber-300">
              Total: {approvedDanas.length}
            </span>
          </h1>
          <p className="text-xs text-subtle mt-1">
            View, edit, and print official merit certificates for approved Dana offerings.
          </p>
        </div>
        <div className="w-full sm:w-auto flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <Link
            to="/admin/templates"
            className="px-4 py-2.5 bg-brand-1 hover:bg-brand-2 text-white font-bold text-xs rounded-xl shadow-sm transition-all text-center whitespace-nowrap"
          >
            Edit Certificate & Letter Templates
          </Link>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by donor name, month, or purpose..."
            className="w-full sm:w-72 px-4 py-2.5 rounded-xl border border-gray-300 focus:border-brand-1 focus:ring-2 focus:ring-brand-1/20 outline-none text-xs"
          />
        </div>
      </div>

      {/* Certificates List */}
      <div className="bg-white rounded-2xl shadow-sm border border-brand-1/10 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-subtle text-sm">Loading certificates...</div>
        ) : filteredCertificates.length === 0 ? (
          <div className="p-12 text-center text-subtle text-sm">
            {searchQuery ? "No certificates matching your search." : "No approved certificates found."}
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredCertificates.map((dana) => {
              const mealName =
                dana.mealType === "MORNING"
                  ? "Morning Meal (Heel Dana)"
                  : dana.mealType === "NOON"
                  ? "Midday Meal (Dawal Dana)"
                  : "Evening Refreshments (Gilampasa)";

              return (
                <div
                  key={dana.id}
                  className="p-6 hover:bg-gray-50/80 transition-colors flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
                >
                  <div className="space-y-1 max-w-2xl">
                    <div className="flex items-center gap-3">
                      <h3 className="font-bold text-lg text-ink">{dana.name}</h3>
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-emerald-100 text-emerald-800 border border-emerald-300">
                        APPROVED
                      </span>
                      <span className="text-xs font-bold text-brand-1">Ref #{dana.id}</span>
                    </div>

                    <p className="text-xs font-semibold text-gray-600">
                      Date: <strong className="text-ink">{dana.month} Day {dana.day}</strong> • Meal: <strong className="text-brand-1">{mealName}</strong>
                    </p>

                    {dana.purpose && (
                      <p className="text-xs text-subtle italic">
                        Purpose: "{dana.purpose}"
                      </p>
                    )}

                    {dana.address && !dana.address.includes("N/A") && (
                      <p className="text-xs text-gray-500">
                        Address: {dana.address} | Phone: {dana.phone}
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-3 shrink-0">
                    <Link
                      to={`/certificate/${dana.id}`}
                      className="px-4 py-2 bg-brand-1 hover:bg-brand-2 text-white text-xs font-bold rounded-xl shadow-sm transition-all"
                    >
                      View / Print Certificate
                    </Link>

                    <Link
                      to={`/admin/monthly-letters/${dana.month}?id=${dana.id}`}
                      className="px-4 py-2 bg-amber-700 hover:bg-amber-800 text-white text-xs font-bold rounded-xl shadow-sm transition-all"
                    >
                      View / Print Letter
                    </Link>

                    <button
                      onClick={() => setEditingDana(dana)}
                      className="px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-800 text-xs font-bold rounded-xl border border-blue-200 transition-all"
                    >
                      Edit Certificate
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Edit Dana / Certificate Modal */}
      {editingDana && (
        <EditDanaModal
          dana={editingDana}
          token={token}
          onClose={() => setEditingDana(null)}
          onSuccess={() => {
            setEditingDana(null);
            fetchApprovedDanas();
          }}
        />
      )}
    </div>
  );
};
