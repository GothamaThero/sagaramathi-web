import { useEffect, useState } from "react";
import { Link } from "react-router";
import { useAuth } from "../../context/AuthContext";
import { EditDanaModal } from "../../component/EditDanaModal";

export const UserDashboard = () => {
  const { user, token } = useAuth();
  const [danas, setDanas] = useState<any[]>([]);
  const [editingDana, setEditingDana] = useState<any | null>(null);

  // Payment History Modal State
  const [historyModalDanaId, setHistoryModalDanaId] = useState<number | null>(null);

  // Payment Modal State
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedDanaId, setSelectedDanaId] = useState<number | null>(null);
  const [paymentForm, setPaymentForm] = useState({
    year: new Date().getFullYear().toString(),
    payerName: "",
    payerPhone: "",
    amount: "",
  });
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [paymentLoading, setPaymentLoading] = useState(false);

  const fetchMyDanas = async () => {
    try {
      const response = await fetch("http://localhost:3000/api/dana/me", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setDanas(data);
      }
    } catch (error) {
      console.error("Failed to fetch my danas", error);
    }
  };

  useEffect(() => {
    fetchMyDanas();
  }, []);

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDanaId || !receiptFile) {
      alert("කරුණාකර රිසිට් පත ඇතුළත් කරන්න.");
      return;
    }

    setPaymentLoading(true);
    const data = new FormData();
    data.append("danaBookingId", selectedDanaId.toString());
    data.append("year", paymentForm.year);
    data.append("payerName", paymentForm.payerName);
    data.append("payerPhone", paymentForm.payerPhone);
    data.append("amount", paymentForm.amount);
    data.append("receipt", receiptFile);

    try {
      const response = await fetch("http://localhost:3000/api/payments", {
        method: "POST",
        body: data,
      });

      if (response.ok) {
        alert("ගෙවීම් තහවුරු කිරීම සාර්ථකයි!");
        setShowPaymentModal(false);
        setReceiptFile(null);
        setPaymentForm({
          year: new Date().getFullYear().toString(),
          payerName: "",
          payerPhone: "",
          amount: "",
        });
        fetchMyDanas();
      } else {
        alert("ගෙවීම් තහවුරු කිරීම අසාර්ථකයි.");
      }
    } catch (error) {
      console.error("Payment error:", error);
      alert("ගෙවීම් තහවුරු කිරීම අසාර්ථකයි.");
    } finally {
      setPaymentLoading(false);
    }
  };

  const handleTogglePunyanumodana = async (paymentId: number) => {
    try {
      const response = await fetch(`http://localhost:3000/api/payments/${paymentId}/punyanumodana`, {
        method: "PATCH",
      });
      if (response.ok) {
        fetchMyDanas();
      } else {
        console.error("Failed to toggle status");
      }
    } catch (error) {
      console.error("Error toggling status:", error);
    }
  };

  const months = [
    "ජනවාරි", "පෙබරවාරි", "මාර්තු", "අප්‍රේල්", "මැයි", "ජූනි",
    "ජූලි", "අගෝස්තු", "සැප්තැම්බර්", "ඔක්තෝබර්", "නොවැම්බර්", "දෙසැම්බර්"
  ];

  const groupedDanas = months.reduce((acc, month) => {
    const monthDanas = danas.filter((d) => d.month === month);
    monthDanas.sort((a, b) => parseInt(a.day) - parseInt(b.day));
    if (monthDanas.length > 0) {
      acc.push({ month, danas: monthDanas });
    }
    return acc;
  }, [] as { month: string; danas: any[] }[]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 relative">
      {/* Payment History Modal */}
      {historyModalDanaId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-ink/60 backdrop-blur-md transition-all duration-300">
          <div className="bg-surface rounded-[2rem] p-6 sm:p-10 max-w-xl w-full shadow-2xl relative max-h-[90vh] flex flex-col border border-white/20">
            
            <div className="flex items-center justify-between mb-8 pb-6 border-b border-brand-1/10">
              <h2 className="text-2xl font-black text-ink flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-brand-1/10 flex items-center justify-center text-xl">📜</div>
                සියලු ගෙවීම් ඉතිහාසය
              </h2>
              <button 
                onClick={() => setHistoryModalDanaId(null)}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-surface-2 hover:bg-surface-3 hover:rotate-90 text-subtle hover:text-ink transition-all duration-300"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-5 overflow-y-auto pr-2 custom-scrollbar flex-1 pb-4">
              {danas.find(d => d.id === historyModalDanaId)?.payments?.map((payment: any) => (
                <div key={payment.id} className="group bg-surface hover:bg-surface-2 rounded-2xl p-5 border border-brand-1/10 shadow-sm hover:shadow-md transition-all duration-300">
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-3">
                      <div className="px-4 py-2 h-12 rounded-xl bg-brand-1/10 flex items-center justify-center font-black text-brand-1 text-xl">
                        {payment.year}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-subtle uppercase tracking-wider">වර්ෂය</span>
                        <span className="text-sm font-semibold text-ink">වාර්ෂික ගෙවීම</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold text-subtle uppercase tracking-wider block mb-0.5">මුදල</span>
                      <span className="font-black text-xl text-green-600">රු. {payment.amount}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-x-6 gap-y-2 bg-white/50 rounded-xl p-3 border border-brand-1/5 mb-4">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-subtle opacity-70">👤</span>
                      <span className="font-medium text-ink/80">{payment.payerName}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-subtle opacity-70">📞</span>
                      <span className="font-medium text-ink/80">{payment.payerPhone}</span>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row justify-between items-center gap-3 pt-4 border-t border-brand-1/5">
                    <a 
                      href={`http://localhost:3000${payment.receiptUrl}`} 
                      target="_blank" 
                      rel="noreferrer" 
                      className="flex items-center gap-2 text-sm font-bold text-brand-1 hover:text-brand-2 bg-brand-1/5 hover:bg-brand-1/10 px-4 py-2 rounded-lg transition-colors w-full sm:w-auto justify-center"
                    >
                      <span>📄</span> රිසිට් පත බලන්න
                    </a>
                    
                    <button 
                      onClick={() => handleTogglePunyanumodana(payment.id)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold cursor-pointer transition-all w-full sm:w-auto justify-center shadow-sm hover:shadow-md hover:-translate-y-0.5 ${
                        payment.punyanumodanaSent 
                          ? 'bg-green-50 text-green-700 border border-green-200 hover:bg-green-100' 
                          : 'bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100'
                      }`}
                      title="ක්ලික් කර වෙනස් කරන්න"
                    >
                      {payment.punyanumodanaSent ? (
                        <><span className="text-green-500">✓</span> පුණ්‍යානුමෝදනා යවා ඇත</>
                      ) : (
                        <><span className="text-amber-500">⏳</span> පුණ්‍යානුමෝදනා යවා නැත</>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-6 pt-6 border-t border-brand-1/10">
              <button
                onClick={() => {
                  setHistoryModalDanaId(null);
                  setSelectedDanaId(historyModalDanaId);
                  setShowPaymentModal(true);
                }}
                className="w-full py-4 bg-brand-1 text-white text-lg font-bold rounded-xl shadow-lg shadow-brand-1/25 hover:shadow-xl hover:bg-brand-2 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
              >
                <span>➕</span> අලුත් ගෙවීමක් එක් කරන්න
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/40 backdrop-blur-sm">
          <div className="bg-surface rounded-3xl p-8 max-w-lg w-full shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button 
              onClick={() => setShowPaymentModal(false)}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-surface-2 hover:bg-surface-3 text-subtle transition-colors"
            >
              ✕
            </button>
            <h2 className="text-2xl font-bold text-ink mb-6 flex items-center gap-2">
              <span className="text-brand-1">💳</span> මුදල් ගෙවූ බව තහවුරු කරන්න
            </h2>
            
            <form onSubmit={handlePaymentSubmit} className="space-y-5">
              <div>
                <label className="form-label">ගෙවන අවුරුද්ද</label>
                <input
                  type="number"
                  required
                  value={paymentForm.year}
                  onChange={(e) => setPaymentForm({ ...paymentForm, year: e.target.value })}
                  className="form-input hover:border-brand-1/30"
                />
              </div>
              <div>
                <label className="form-label">ගෙවන්නාගේ නම</label>
                <input
                  type="text"
                  required
                  value={paymentForm.payerName}
                  onChange={(e) => setPaymentForm({ ...paymentForm, payerName: e.target.value })}
                  className="form-input hover:border-brand-1/30"
                />
              </div>
              <div>
                <label className="form-label">දුරකථන අංකය</label>
                <input
                  type="tel"
                  required
                  value={paymentForm.payerPhone}
                  onChange={(e) => setPaymentForm({ ...paymentForm, payerPhone: e.target.value })}
                  className="form-input hover:border-brand-1/30"
                />
              </div>
              <div>
                <label className="form-label">තැම්පත් කළ මුදල (රු.)</label>
                <input
                  type="number"
                  required
                  value={paymentForm.amount}
                  onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                  className="form-input hover:border-brand-1/30"
                />
              </div>
              <div>
                <label className="form-label">රිසිට් පත (ඡායාරූපයක්)</label>
                <input
                  type="file"
                  accept="image/*"
                  required
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setReceiptFile(e.target.files[0]);
                    }
                  }}
                  className="form-input p-2 text-sm text-subtle file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-brand-1/10 file:text-brand-1 hover:file:bg-brand-1/20"
                />
              </div>
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={paymentLoading}
                  className="w-full py-4 bg-brand-1 hover:bg-brand-2 text-white font-bold rounded-xl shadow-lg transition-all disabled:opacity-50"
                >
                  {paymentLoading ? "තහවුරු කරමින් පවතී..." : "තහවුරු කරන්න"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-4">
        <div>
          <h1 className="text-3xl font-black text-brand-1 mb-2 flex items-center gap-3">
            <span className="text-2xl">👤</span> මගේ ගිණුම (My Dashboard)
          </h1>
          <p className="text-subtle font-medium">ආයුබෝවන්, {user?.name}</p>
        </div>
        <Link to="/dana" className="bg-brand-1 hover:bg-brand-2 text-white font-bold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center gap-2">
          <span>+</span> අලුතින් දානයක් වෙන් කරන්න
        </Link>
      </div>

      <div className="mb-8">
        <h2 className="text-2xl font-bold text-ink flex items-center gap-3">
          <span className="text-brand-1">📅</span> දැනට වෙන් කර ඇති දාන
        </h2>
        <p className="text-sm text-subtle mt-2">පහතින් දැක්වෙන්නේ මේ දක්වා ඔබ වෙන් කරවා ගෙන ඇති දාන විස්තරයි.</p>
      </div>

      {danas.length === 0 ? (
        <div className="bg-surface border border-brand-1/10 rounded-3xl p-16 text-center shadow-sm">
          <div className="text-5xl mb-4 opacity-50">📋</div>
          <p className="text-lg text-ink font-bold mb-2">තවමත් කිසිදු දානයක් වෙන් කර නොමැත.</p>
          <p className="text-subtle text-sm">ඉහත බොත්තම භාවිතයෙන් නව දානයක් වෙන් කරවා ගන්න.</p>
        </div>
      ) : (
        <div className="space-y-12">
          {groupedDanas.map((group) => (
            <div key={group.month}>
              <h3 className="text-xl font-bold text-ink mb-6 border-b border-brand-1/10 pb-3 flex items-center gap-2">
                <span className="text-brand-1">🔸</span> {group.month} මාසය
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {group.danas.map((dana) => (
                  <div key={dana.id} className="bg-surface border border-brand-1/10 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col hover:-translate-y-1 relative overflow-hidden group">
                    {/* Status Indicator Bar */}
                    <div className={`absolute top-0 left-0 w-full h-1.5 ${
                      dana.status === 'APPROVED' ? 'bg-green-500' :
                      dana.status === 'REJECTED' ? 'bg-red-500' : 'bg-amber-500'
                    }`} />
                    
                    <div className="flex items-center justify-between mb-4 mt-2">
                      <div className="bg-brand-1/10 text-brand-1 px-3 py-1.5 rounded-lg text-sm font-bold border border-brand-1/20 flex items-center gap-2">
                        <span>🗓️</span> {dana.month} {dana.day}
                      </div>
                      <span className={`px-2.5 py-1 rounded-md text-[11px] font-black tracking-wider uppercase border ${
                        dana.status === 'APPROVED' ? 'bg-green-50 text-green-700 border-green-200' :
                        dana.status === 'REJECTED' ? 'bg-red-50 text-red-700 border-red-200' :
                        'bg-amber-50 text-amber-700 border-amber-200'
                      }`}>
                        {dana.status}
                      </span>
                    </div>
                    
                    <h3 className="font-bold text-xl text-ink mb-1">{dana.name}</h3>
                    
                    <div className="inline-block mt-1 mb-4">
                      <span className="text-xs font-bold text-brand-2 bg-brand-2/10 px-2 py-1 rounded-md border border-brand-2/20">
                        {dana.mealType === 'MORNING' ? 'හීල් දානය' : dana.mealType === 'NOON' ? 'දවල් දානය' : 'ගිලන්පස'}
                      </span>
                    </div>

                    <div className="bg-surface-2 rounded-xl p-4 border border-brand-1/5 mb-5 mt-auto">
                      <p className="text-xs font-bold text-subtle mb-1.5 uppercase tracking-wider">අරමුණ:</p>
                      <p className="text-sm text-ink font-medium leading-relaxed">{dana.purpose}</p>
                    </div>

                    {/* Actions */}
                    <div className="pt-4 border-t border-brand-1/10 flex flex-col gap-3">
                      {dana.status === "APPROVED" && (
                        <Link to={`/certificate/${dana.id}`} className="w-full flex items-center justify-center gap-2 bg-brand-3/10 hover:bg-brand-3/20 text-brand-3 py-2.5 rounded-xl text-sm font-bold transition-colors">
                          <span>📜</span> Certificate
                        </Link>
                      )}
                      
                      <div className="flex gap-2">
                        <button onClick={() => setEditingDana(dana)} className="flex-1 bg-surface-2 hover:bg-surface-3 border border-brand-1/10 text-ink py-2.5 rounded-xl text-sm font-bold transition-colors flex items-center justify-center gap-2">
                          <span>✏️</span> වෙනස් කරන්න
                        </button>
                      </div>

                      {/* Payment Section - Only if Approved */}
                      {dana.status === "APPROVED" && (
                        <div className="mt-2 pt-3 border-t border-brand-1/5">
                          {dana.payments && dana.payments.length > 0 ? (
                            <div className="flex flex-col h-full">
                              <h4 className="text-[10px] font-bold text-subtle uppercase tracking-wider mb-2">අවසන් ගෙවීම</h4>
                              <div className="bg-green-500/5 rounded-xl p-3 border border-green-500/10 text-sm mb-2">
                                <div className="flex justify-between items-center mb-1.5">
                                  <span className="font-bold text-ink">{dana.payments[dana.payments.length - 1].year}</span>
                                  <span className="font-bold text-green-600">රු. {dana.payments[dana.payments.length - 1].amount}</span>
                                </div>
                                <div className="flex justify-between items-center text-[11px]">
                                  <a href={`http://localhost:3000${dana.payments[dana.payments.length - 1].receiptUrl}`} target="_blank" rel="noreferrer" className="text-brand-1 hover:underline font-bold">
                                    📄 රිසිට් පත
                                  </a>
                                  <span 
                                    className={`px-1.5 py-0.5 rounded font-medium ${dana.payments[dana.payments.length - 1].punyanumodanaSent ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}
                                  >
                                    {dana.payments[dana.payments.length - 1].punyanumodanaSent ? 'පුණ්‍යානුමෝදනා යවා ඇත' : 'පුණ්‍යානුමෝදනා යවා නැත'}
                                  </span>
                                </div>
                              </div>
                              
                              <div className="flex gap-2">
                                {dana.payments.length > 1 && (
                                  <button
                                    onClick={() => setHistoryModalDanaId(dana.id)}
                                    className="flex-1 py-2 text-xs font-bold text-brand-4 bg-brand-4/10 hover:bg-brand-4/20 rounded-xl transition-colors"
                                  >
                                    සියලු ගෙවීම් ({dana.payments.length})
                                  </button>
                                )}
                                <button
                                  onClick={() => {
                                    setSelectedDanaId(dana.id);
                                    setShowPaymentModal(true);
                                  }}
                                  className="flex-1 py-2 text-[11px] font-bold text-brand-1 bg-brand-1/5 hover:bg-brand-1/10 rounded-xl transition-colors"
                                >
                                  + තව ගෙවීමක්
                                </button>
                              </div>
                            </div>
                          ) : (
                            <button
                              onClick={() => {
                                setSelectedDanaId(dana.id);
                                setShowPaymentModal(true);
                              }}
                              className="w-full py-2.5 bg-brand-1 text-white text-sm font-bold rounded-xl shadow-md shadow-brand-1/20 hover:bg-brand-2 transition-all flex items-center justify-center gap-2"
                            >
                              <span>💳</span> මුදල් ගෙවූ බව තහවුරු කරන්න
                            </button>
                          )}
                        </div>
                      )}

                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {editingDana && (
        <EditDanaModal 
          dana={editingDana} 
          token={token} 
          onClose={() => setEditingDana(null)} 
          onSuccess={() => { setEditingDana(null); fetchMyDanas(); }} 
        />
      )}
    </div>
  );
};

