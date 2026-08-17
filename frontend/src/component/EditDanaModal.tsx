import React, { useState } from "react";
import { API_BASE_URL } from "../libs/api";

interface EditDanaModalProps {
  dana: any;
  onClose: () => void;
  onSuccess: () => void;
  token: string | null;
}

export const EditDanaModal: React.FC<EditDanaModalProps> = ({ dana, onClose, onSuccess, token }) => {
  const [formData, setFormData] = useState({
    name: dana.name || "",
    phone: dana.phone || "",
    whatsapp: dana.whatsapp || "",
    address: dana.address || "",
    month: dana.month || "",
    day: dana.day || "",
    mealType: dana.mealType || "NOON",
    purpose: dana.purpose || "",
  });
  const [loading, setLoading] = useState(false);

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  const days = Array.from({ length: 31 }, (_, i) => i + 1);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/dana/${dana.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      if (response.ok) {
        alert("Dana updated successfully");
        onSuccess();
      } else {
        alert("Failed to update");
      }
    } catch (error) {
      console.error("Update error:", error);
      alert("Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-ink/40 backdrop-blur-sm">
      <div className="bg-surface rounded-3xl p-8 max-w-2xl w-full shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <button onClick={onClose} className="absolute top-4 right-4 text-subtle text-xs font-bold px-2 py-1 bg-surface-2 rounded-lg">Close</button>
        <h2 className="text-2xl font-bold mb-6">Update Dana Booking</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><label className="form-label">Name</label><input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="form-input" /></div>
            <div><label className="form-label">Phone</label><input type="tel" required value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="form-input" /></div>
            <div><label className="form-label">WhatsApp</label><input type="tel" required value={formData.whatsapp} onChange={e => setFormData({...formData, whatsapp: e.target.value})} className="form-input" /></div>
            <div><label className="form-label">Address</label><input type="text" required value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className="form-input" /></div>
            <div>
              <label className="form-label">Month</label>
              <select required value={formData.month} onChange={e => setFormData({...formData, month: e.target.value})} className="form-input">
                {months.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <div>
              <label className="form-label">Day</label>
              <select required value={formData.day} onChange={e => setFormData({...formData, day: e.target.value})} className="form-input">
                {days.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
          </div>
          <div><label className="form-label">Purpose</label><textarea required rows={3} value={formData.purpose} onChange={e => setFormData({...formData, purpose: e.target.value})} className="form-input" /></div>
          <button type="submit" disabled={loading} className="btn-primary w-full mt-4">{loading ? "Updating..." : "Update Dana"}</button>
        </form>
      </div>
    </div>
  );
};
