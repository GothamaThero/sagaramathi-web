import React, { useState } from "react";
import { API_BASE_URL, SERVER_URL } from "../libs/api";

interface PaymentItem {
  id: number;
  danaBookingId: number;
  year: string;
  payerName: string;
  payerPhone: string;
  amount: string;
  receiptUrl: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  punyanumodanaSent: boolean;
  createdAt: string;
}

interface AdminPaymentModalProps {
  dana: any;
  token: string | null;
  onClose: () => void;
  onRefresh: () => void;
}

export const AdminPaymentModal: React.FC<AdminPaymentModalProps> = ({
  dana,
  token,
  onClose,
  onRefresh,
}) => {
  const [payments, setPayments] = useState<PaymentItem[]>(dana.payments || []);

  // Form State
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [editingPayment, setEditingPayment] = useState<PaymentItem | null>(null);

  const [formYear, setFormYear] = useState<string>(new Date().getFullYear().toString());
  const [formPayerName, setFormPayerName] = useState<string>("");
  const [formPayerPhone, setFormPayerPhone] = useState<string>("");
  const [formAmount, setFormAmount] = useState<string>("");
  const [formStatus, setFormStatus] = useState<"APPROVED" | "PENDING" | "REJECTED">("APPROVED");
  const [formPunyanumodana, setFormPunyanumodana] = useState<boolean>(false);
  const [receiptFile, setReceiptFile] = useState<File | null>(null);

  const [submitting, setSubmitting] = useState<boolean>(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // Open Form for Adding New Payment
  const handleOpenAdd = () => {
    setEditingPayment(null);
    setFormYear(new Date().getFullYear().toString());
    setFormPayerName(dana.name || "");
    setFormPayerPhone(dana.phone || "");
    setFormAmount("");
    setFormStatus("APPROVED");
    setFormPunyanumodana(false);
    setReceiptFile(null);
    setIsFormOpen(true);
  };

  // Open Form for Editing Existing Payment
  const handleOpenEdit = (payment: PaymentItem) => {
    setEditingPayment(payment);
    setFormYear(payment.year || new Date().getFullYear().toString());
    setFormPayerName(payment.payerName || "");
    setFormPayerPhone(payment.payerPhone || "");
    setFormAmount(payment.amount || "");
    setFormStatus(payment.status || "APPROVED");
    setFormPunyanumodana(payment.punyanumodanaSent || false);
    setReceiptFile(null);
    setIsFormOpen(true);
  };

  // Save (Create or Update) Payment
  const handleSavePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formPayerName || !formAmount) {
      alert("Please enter name and amount.");
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("danaBookingId", dana.id.toString());
      formData.append("year", formYear);
      formData.append("payerName", formPayerName);
      formData.append("payerPhone", formPayerPhone || "N/A");
      formData.append("amount", formAmount);
      formData.append("status", formStatus);
      formData.append("punyanumodanaSent", formPunyanumodana.toString());
      if (receiptFile) {
        formData.append("receipt", receiptFile);
      }

      const url = editingPayment
        ? `${API_BASE_URL}/payments/${editingPayment.id}`
        : `${API_BASE_URL}/payments`;

      const method = editingPayment ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (res.ok) {
        setIsFormOpen(false);
        setEditingPayment(null);
        setReceiptFile(null);
        onRefresh();
      } else {
        const errorJson = await res.json();
        alert(`Action failed: ${errorJson.message || "An error occurred"}`);
      }
    } catch (error) {
      console.error("Error saving payment:", error);
      alert("Error saving payment.");
    } finally {
      setSubmitting(false);
    }
  };

  // Delete Payment
  const handleDeletePayment = async (id: number) => {
    if (!window.confirm("Are you sure you want to permanently delete this payment record?")) {
      return;
    }

    setDeletingId(id);
    try {
      const res = await fetch(`${API_BASE_URL}/payments/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        setPayments(payments.filter((p) => p.id !== id));
        onRefresh();
      } else {
        alert("Failed to delete payment.");
      }
    } catch (error) {
      console.error("Error deleting payment:", error);
      alert("Error deleting payment.");
    } finally {
      setDeletingId(null);
    }
  };

  // Quick Status Approve / Reject
  const handleQuickStatus = async (id: number, action: "approve" | "reject") => {
    try {
      const res = await fetch(`${API_BASE_URL}/payments/${id}/${action}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.ok) {
        onRefresh();
      }
    } catch (error) {
      console.error(`Error ${action} payment:`, error);
    }
  };

  // Quick Punyanumodana Toggle
  const handleTogglePunyanumodana = async (id: number) => {
    try {
      const res = await fetch(`${API_BASE_URL}/payments/${id}/punyanumodana`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.ok) {
        onRefresh();
      }
    } catch (error) {
      console.error("Error toggling punyanumodana:", error);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/60 backdrop-blur-sm transition-all duration-300">
      <div className="bg-surface rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border border-brand-1/10">
        
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-brand-1/10 flex items-center justify-between bg-surface-2/40">
          <div>
            <h3 className="font-black text-xl text-ink flex items-center gap-2">
              Dana Payments
            </h3>
            <p className="text-xs font-medium text-subtle mt-0.5">
              {dana.name} • {dana.month} Day {dana.day} ({dana.mealType === 'MORNING' ? 'Morning Meal (Heel Dana)' : dana.mealType === 'NOON' ? 'Midday Meal (Dawal Dana)' : 'Evening Refreshments'})
            </p>
          </div>
          <button
            onClick={onClose}
            className="px-3 py-1 rounded-lg bg-surface-2 hover:bg-surface-3 text-subtle hover:text-ink transition-colors font-bold text-xs"
          >
            Close
          </button>
        </div>

        {/* Action Toolbar */}
        <div className="px-6 py-3 bg-brand-1/5 border-b border-brand-1/10 flex justify-between items-center">
          <span className="text-xs font-bold text-subtle uppercase tracking-wider">
            Payment Records ({payments.length})
          </span>
          <button
            onClick={handleOpenAdd}
            className="px-4 py-2 bg-brand-1 hover:bg-brand-2 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-1.5 active:scale-95"
          >
            + Add New Payment
          </button>
        </div>

        {/* Payments List Body */}
        <div className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-4">
          {payments.length === 0 ? (
            <div className="py-12 text-center flex flex-col items-center">
              <p className="text-sm font-bold text-ink">No payments recorded for this Dana.</p>
              <p className="text-xs text-subtle mt-1">Use the "+ Add New Payment" button above to add a payment.</p>
            </div>
          ) : (
            payments.map((payment) => (
              <div
                key={payment.id}
                className="p-5 rounded-2xl border border-brand-1/10 bg-surface hover:bg-surface-2/40 transition-all shadow-sm flex flex-col gap-3"
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className="px-3 py-1.5 rounded-lg bg-brand-1/10 text-brand-1 font-black text-base border border-brand-1/15">
                      {payment.year}
                    </div>
                    <div>
                      <h4 className="font-bold text-ink text-base">{payment.payerName}</h4>
                      <p className="text-xs font-medium text-subtle">{payment.payerPhone}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span
                      className={`px-3 py-1 rounded-md text-[11px] font-black uppercase tracking-wider border ${
                        payment.status === "APPROVED"
                          ? "bg-green-50 text-green-700 border-green-200"
                          : payment.status === "REJECTED"
                          ? "bg-red-50 text-red-700 border-red-200"
                          : "bg-amber-50 text-amber-700 border-amber-200"
                      }`}
                    >
                      {payment.status}
                    </span>
                    <button
                      onClick={() => handleTogglePunyanumodana(payment.id)}
                      className={`text-[10px] font-bold px-2 py-0.5 rounded transition-all ${
                        payment.punyanumodanaSent
                          ? "text-green-700 bg-green-100 hover:bg-green-200"
                          : "text-amber-700 bg-amber-100 hover:bg-amber-200"
                      }`}
                    >
                      {payment.punyanumodanaSent ? "Merit Blessings Sent" : "Merit Blessings Pending"}
                    </button>
                  </div>
                </div>

                <div className="flex flex-wrap justify-between items-center pt-2 border-t border-brand-1/5 gap-2">
                  <div className="flex items-center gap-4">
                    <span className="font-black text-lg text-green-600">
                      LKR {payment.amount}
                    </span>
                    {payment.receiptUrl ? (
                      <a
                        href={`${SERVER_URL}${payment.receiptUrl}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs font-bold text-brand-1 hover:underline bg-brand-1/10 px-3 py-1 rounded-lg flex items-center gap-1"
                      >
                        View Receipt
                      </a>
                    ) : (
                      <span className="text-xs text-subtle italic">No receipt (Cash)</span>
                    )}
                  </div>

                  {/* Action Buttons for CRUD */}
                  <div className="flex items-center gap-2">
                    {payment.status !== "APPROVED" && (
                      <button
                        onClick={() => handleQuickStatus(payment.id, "approve")}
                        className="px-2.5 py-1 bg-green-500/10 text-green-600 hover:bg-green-500/20 text-xs font-bold rounded-lg border border-green-500/20"
                        title="Approve"
                      >
                        Approve
                      </button>
                    )}
                    {payment.status !== "REJECTED" && (
                      <button
                        onClick={() => handleQuickStatus(payment.id, "reject")}
                        className="px-2.5 py-1 bg-red-500/10 text-red-600 hover:bg-red-500/20 text-xs font-bold rounded-lg border border-red-500/20"
                        title="Reject"
                      >
                        Reject
                      </button>
                    )}
                    <button
                      onClick={() => handleOpenEdit(payment)}
                      className="px-3 py-1 bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200 text-xs font-bold rounded-lg transition-colors flex items-center gap-1"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeletePayment(payment.id)}
                      disabled={deletingId === payment.id}
                      className="px-3 py-1 bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 text-xs font-bold rounded-lg transition-colors flex items-center gap-1 disabled:opacity-50"
                    >
                      {deletingId === payment.id ? "..." : "Delete"}
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>



        {/* Sub-Modal: Add / Edit Payment Form */}
        {isFormOpen && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-ink/70 backdrop-blur-md">
            <div className="bg-surface rounded-3xl p-6 max-w-md w-full shadow-2xl relative border border-brand-1/20 animate-in fade-in zoom-in-95 duration-200">
              <button
                onClick={() => setIsFormOpen(false)}
                className="absolute top-4 right-4 px-2 py-1 rounded bg-surface-2 text-xs font-bold text-subtle transition-colors"
              >
                Close
              </button>

              <h3 className="text-xl font-bold text-ink mb-5 flex items-center gap-2">
                {editingPayment ? "Edit Payment Details" : "Add New Payment"}
              </h3>

              <form onSubmit={handleSavePayment} className="space-y-4">
                <div>
                  <label className="form-label text-xs">Payment Year</label>
                  <input
                    type="number"
                    required
                    value={formYear}
                    onChange={(e) => setFormYear(e.target.value)}
                    className="form-input text-sm hover:border-brand-1/30"
                  />
                </div>

                <div>
                  <label className="form-label text-xs">Payer Name</label>
                  <input
                    type="text"
                    required
                    value={formPayerName}
                    onChange={(e) => setFormPayerName(e.target.value)}
                    className="form-input text-sm hover:border-brand-1/30"
                    placeholder="e.g. Mr. Sumanasiri"
                  />
                </div>

                <div>
                  <label className="form-label text-xs">Phone Number</label>
                  <input
                    type="tel"
                    value={formPayerPhone}
                    onChange={(e) => setFormPayerPhone(e.target.value)}
                    className="form-input text-sm hover:border-brand-1/30"
                    placeholder="0771234567"
                  />
                </div>

                <div>
                  <label className="form-label text-xs">Amount (LKR)</label>
                  <input
                    type="number"
                    required
                    value={formAmount}
                    onChange={(e) => setFormAmount(e.target.value)}
                    className="form-input text-sm hover:border-brand-1/30"
                    placeholder="5000"
                  />
                </div>

                <div>
                  <label className="form-label text-xs">Status</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as any)}
                    className="form-input text-sm bg-surface"
                  >
                    <option value="APPROVED">APPROVED</option>
                    <option value="PENDING">PENDING</option>
                    <option value="REJECTED">REJECTED</option>
                  </select>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="punyanumodanaCheck"
                    checked={formPunyanumodana}
                    onChange={(e) => setFormPunyanumodana(e.target.checked)}
                    className="w-4 h-4 text-brand-1 rounded focus:ring-brand-1 border-gray-300"
                  />
                  <label htmlFor="punyanumodanaCheck" className="text-xs font-semibold text-ink cursor-pointer">
                    Merit Blessings Sent (Punyanumodana)
                  </label>
                </div>

                <div>
                  <label className="form-label text-xs">Receipt Image (Optional)</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setReceiptFile(e.target.files[0]);
                      }
                    }}
                    className="form-input p-2 text-xs text-subtle file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-brand-1/10 file:text-brand-1"
                  />
                </div>

                <div className="flex gap-3 pt-3">
                  <button
                    type="button"
                    onClick={() => setIsFormOpen(false)}
                    className="flex-1 py-3 bg-surface-2 hover:bg-surface-3 text-muted font-bold text-xs rounded-xl transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 py-3 bg-brand-1 hover:bg-brand-2 text-white font-bold text-xs rounded-xl shadow-lg transition-all disabled:opacity-50"
                  >
                    {submitting ? "Saving..." : "Save Payment"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
