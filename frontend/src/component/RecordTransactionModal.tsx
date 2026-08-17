import React, { useState } from "react";
import { API_BASE_URL } from "../libs/api";

interface RecordTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  token: string;
}

export const RecordTransactionModal: React.FC<RecordTransactionModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  token
}) => {
  const [description, setDescription] = useState("");
  const [type, setType] = useState<"INCOME" | "EXPENSE" | "INVESTMENT">("EXPENSE");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) {
      setError("Please enter a description");
      return;
    }
    if (!amount || parseFloat(amount) <= 0) {
      setError("Please enter a valid amount");
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      const res = await fetch(`${API_BASE_URL}/finance/transactions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          description,
          type,
          amount: parseFloat(amount),
          date
        })
      });

      if (res.ok) {
        setDescription("");
        setAmount("");
        setType("EXPENSE");
        onSuccess();
        onClose();
      } else {
        const data = await res.json();
        setError(data.message || "Failed to save transaction");
      }
    } catch (err) {
      console.error(err);
      setError("Server error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-brand-1/20 overflow-hidden">
        {/* Modal Header */}
        <div className="bg-brand-1 px-6 py-4 flex items-center justify-between text-white">
          <h2 className="font-bold text-lg flex items-center gap-2">
            Record Transaction
          </h2>
          <button
            onClick={onClose}
            className="px-2 py-1 rounded bg-white/10 hover:bg-white/20 text-xs font-bold text-white transition-colors"
          >
            Close
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold rounded-xl">
              {error}
            </div>
          )}

          {/* Type Selector */}
          <div>
            <label className="block text-xs font-bold text-ink mb-2">Transaction Type</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setType("INCOME")}
                className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all border ${
                  type === "INCOME"
                    ? "bg-emerald-600 text-white border-emerald-600 shadow-md"
                    : "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                }`}
              >
                INCOME
              </button>
              <button
                type="button"
                onClick={() => setType("EXPENSE")}
                className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all border ${
                  type === "EXPENSE"
                    ? "bg-rose-600 text-white border-rose-600 shadow-md"
                    : "bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100"
                }`}
              >
                EXPENSE
              </button>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-ink mb-1">Description</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. for maintenance, temporary worker, meals..."
              className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:border-brand-1 focus:ring-2 focus:ring-brand-1/20 outline-none text-sm"
              required
            />
          </div>

          {/* Amount */}
          <div>
            <label className="block text-xs font-bold text-ink mb-1">Amount (LKR)</label>
            <div className="relative">
              <span className="absolute left-3.5 top-2.5 text-xs font-bold text-gray-500">LKR</span>
              <input
                type="number"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 focus:border-brand-1 focus:ring-2 focus:ring-brand-1/20 outline-none text-sm font-semibold"
                required
              />
            </div>
          </div>

          {/* Date */}
          <div>
            <label className="block text-xs font-bold text-ink mb-1">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:border-brand-1 focus:ring-2 focus:ring-brand-1/20 outline-none text-sm"
              required
            />
          </div>

          {/* Form Actions */}
          <div className="pt-3 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-ink text-sm font-bold rounded-xl transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-bold rounded-xl shadow-md transition-all disabled:opacity-50"
            >
              {submitting ? "Saving..." : "Save Transaction"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
