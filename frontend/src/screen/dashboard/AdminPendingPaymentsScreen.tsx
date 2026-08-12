import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";

export const AdminPendingPaymentsScreen: React.FC = () => {
  const { token } = useAuth();
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchAdminPayments();
  }, []);

  const fetchAdminPayments = async () => {
    try {
      setLoading(true);
      const response = await fetch("http://localhost:3000/api/dana/admin/all", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        const allPayments = data.flatMap((dana: any) => 
          dana.payments.map((p: any) => ({
            ...p,
            danaName: dana.name,
            danaMonth: dana.month,
            danaDay: dana.day
          }))
        );
        setPayments(allPayments.filter((p: any) => p.status === 'PENDING'));
      }
    } catch (error) {
      console.error("Failed to fetch admin payments", error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: number) => {
    try {
      const res = await fetch(`http://localhost:3000/api/payments/${id}/approve`, { method: "PATCH", headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) fetchAdminPayments();
    } catch (error) { console.error("Failed to approve payment", error); }
  };

  const handleReject = async (id: number) => {
    try {
      const res = await fetch(`http://localhost:3000/api/payments/${id}/reject`, { method: "PATCH", headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) fetchAdminPayments();
    } catch (error) { console.error("Failed to reject payment", error); }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-ink flex items-center gap-2">
            <span className="text-brand-1">💳</span> අනුමත නොකළ ගෙවීම් (Pending Payments)
          </h1>
        </div>
      </div>

      <div className="space-y-8">
        {loading ? (
          <div className="bg-surface border border-brand-1/10 rounded-2xl overflow-hidden shadow-sm py-20 flex flex-col items-center gap-3 text-subtle">
            <span className="text-sm">දත්ත ලෝඩ් වෙමින්...</span>
          </div>
        ) : payments.length === 0 ? (
          <div className="bg-surface border border-brand-1/10 rounded-2xl overflow-hidden shadow-sm py-20 flex flex-col items-center gap-3 text-subtle">
            <p className="text-sm">අනුමත කිරීමට ගෙවීම් නොමැත</p>
          </div>
        ) : (
          <div className="bg-surface border border-brand-1/10 rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-brand-1/10 bg-surface-2/50">
                    <th className="px-5 py-3 text-left font-semibold text-subtle uppercase tracking-wider text-xs">දානය (Dana)</th>
                    <th className="px-5 py-3 text-left font-semibold text-subtle uppercase tracking-wider text-xs">ගෙවන්නා (Payer)</th>
                    <th className="px-5 py-3 text-left font-semibold text-subtle uppercase tracking-wider text-xs">මුදල (Amount)</th>
                    <th className="px-5 py-3 text-left font-semibold text-subtle uppercase tracking-wider text-xs">රිසිට් පත (Receipt)</th>
                    <th className="px-5 py-3 text-right font-semibold text-subtle uppercase tracking-wider text-xs">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-1/5">
                  {payments.map((payment) => (
                    <tr key={payment.id} className="hover:bg-brand-1/[0.01] transition-colors">
                      <td className="px-5 py-4 font-semibold text-ink whitespace-nowrap">
                        {payment.danaName} ({payment.danaMonth} {payment.danaDay})
                      </td>
                      <td className="px-5 py-4 text-ink">
                        <div className="font-semibold">{payment.payerName}</div>
                        <div className="text-xs text-subtle mt-0.5">{payment.payerPhone}</div>
                      </td>
                      <td className="px-5 py-4 font-bold text-green-600">
                        රු. {payment.amount}
                      </td>
                      <td className="px-5 py-4">
                        <a 
                          href={`http://localhost:3000${payment.receiptUrl}`} 
                          target="_blank" 
                          rel="noreferrer"
                          className="text-brand-1 hover:underline text-xs font-bold"
                        >
                          View Receipt
                        </a>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleApprove(payment.id)}
                            className="px-3 py-1 bg-white border border-green-200 text-green-600 hover:bg-green-50 hover:border-green-300 rounded text-xs font-semibold transition-colors"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleReject(payment.id)}
                            className="px-3 py-1 bg-white border border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 rounded text-xs font-semibold transition-colors"
                          >
                            Reject
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
