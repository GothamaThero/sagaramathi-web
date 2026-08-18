import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { API_BASE_URL } from "../../libs/api";

interface ContactInfo {
  name: string;
  address: string;
  phone1: string;
  phone2: string;
  whatsapp: string;
  email: string;
  bank_name: string;
  bank_acc_number: string;
  bank_acc_name: string;
  map_link: string;
}

const ContactScreen: React.FC = () => {
  const { user, token } = useAuth();
  const isAdmin = user?.role === "SUPER_ADMIN" || user?.role === "ADMIN";

  const [templeInfo, setTempleInfo] = useState<ContactInfo>({
    name: "Sāgaramati Pirivena & Dhananjaya Rajamaha Viharaya",
    address: "Kandegama, Aralaganwila, Polonnaruwa",
    phone1: "027-3272215",
    phone2: "076-3272215",
    whatsapp: "076-3272215",
    email: "psagaramathi@yahoo.com",
    bank_name: "People's Bank - Aralaganwila Branch",
    bank_acc_number: "253200150044402",
    bank_acc_name: "Sāgaramati Piriven Development Society",
    map_link: "https://maps.google.com/?q=Sagaramati+Pirivena+Kandegama"
  });

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editForm, setEditForm] = useState<ContactInfo>(templeInfo);
  const [saving, setSaving] = useState(false);

  const [messageForm, setMessageForm] = useState({
    name: "",
    phone: "",
    email: "",
    message: ""
  });
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    fetchTempleInfo();
  }, []);

  const fetchTempleInfo = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/temple`);
      if (res.ok) {
        const json = await res.json();
        if (json.info) {
          const updated: ContactInfo = {
            name: json.info.name || templeInfo.name,
            address: json.info.address || templeInfo.address,
            phone1: json.info.phone1 || templeInfo.phone1,
            phone2: json.info.phone2 || templeInfo.phone2,
            whatsapp: json.info.whatsapp || templeInfo.whatsapp,
            email: json.info.email || templeInfo.email,
            bank_name: json.info.bank_name || templeInfo.bank_name,
            bank_acc_number: json.info.bank_acc_number || templeInfo.bank_acc_number,
            bank_acc_name: json.info.bank_acc_name || templeInfo.bank_acc_name,
            map_link: json.info.map_link || templeInfo.map_link
          };
          setTempleInfo(updated);
          setEditForm(updated);
        }
      }
    } catch (e) {
      console.error("Error fetching temple info for contact page", e);
    }
  };

  const handleSaveContactInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    try {
      setSaving(true);
      const res = await fetch(`${API_BASE_URL}/temple/info`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(editForm)
      });

      if (res.ok) {
        alert("Contact and bank details updated successfully!");
        setTempleInfo(editForm);
        setIsEditOpen(false);
      } else {
        alert("Failed to update details.");
      }
    } catch (e) {
      console.error("Error saving contact info", e);
    } finally {
      setSaving(false);
    }
  };

  const handleMessageSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageForm.name.trim() || !messageForm.phone.trim() || !messageForm.message.trim()) {
      alert("Please fill in your name, phone number, and message.");
      return;
    }
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50/40 via-white to-gray-50 py-12 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto space-y-10">

        {/* Page Header */}
        <div className="bg-white border-2 border-amber-500/30 rounded-3xl p-8 sm:p-10 shadow-lg text-center space-y-3 relative overflow-hidden">
          <span className="text-xs font-bold text-amber-800 uppercase tracking-widest bg-amber-100 px-4 py-1 rounded-full">
            Contact Us
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-brand-1 tracking-tight">
            Contact Information
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 font-medium max-w-xl mx-auto">
            Get in touch with Sāgaramati Pirivena &amp; Dhananjaya Rajamaha Viharaya using the phone numbers or inquiry form below.
          </p>

          {/* Admin Edit Button */}
          {isAdmin && (
            <div className="pt-3 border-t border-gray-100 flex justify-center">
              <button
                onClick={() => {
                  setEditForm(templeInfo);
                  setIsEditOpen(true);
                }}
                className="px-6 py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shadow-md transition-colors"
              >
                ✏️ Edit Contact &amp; Bank Details (Admin Only)
              </button>
            </div>
          )}
        </div>

        {/* Contact Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-xs sm:text-sm">
          {/* Address Card */}
          <div className="bg-white p-6 rounded-3xl border-2 border-amber-500/20 shadow-md flex flex-col justify-between space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 font-black text-xl flex items-center justify-center">
              📍
            </div>
            <div>
              <h3 className="font-bold text-ink text-base">Address</h3>
              <p className="text-gray-600 font-medium leading-relaxed mt-1">{templeInfo.address}</p>
            </div>
          </div>

          {/* Phone Numbers Card */}
          <div className="bg-white p-6 rounded-3xl border-2 border-emerald-600/20 shadow-md flex flex-col justify-between space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 font-black text-xl flex items-center justify-center">
              📞
            </div>
            <div>
              <h3 className="font-bold text-ink text-base">Phone Numbers</h3>
              <p className="text-gray-600 font-medium leading-relaxed mt-1">
                {templeInfo.phone1} <br />
                {templeInfo.phone2}
              </p>
            </div>
          </div>

          {/* WhatsApp Card */}
          <div className="bg-white p-6 rounded-3xl border-2 border-emerald-500/20 shadow-md flex flex-col justify-between space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 font-black text-xl flex items-center justify-center">
              💬
            </div>
            <div>
              <h3 className="font-bold text-ink text-base">WhatsApp</h3>
              <p className="text-gray-600 font-medium mt-1 mb-2">{templeInfo.whatsapp}</p>
              <a
                href={`https://wa.me/94${templeInfo.whatsapp.replace(/\D/g, "").replace(/^0/, "")}`}
                target="_blank"
                rel="noreferrer"
                className="inline-block px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-sm transition-colors"
              >
                Chat on WhatsApp
              </a>
            </div>
          </div>

          {/* Email Card */}
          <div className="bg-white p-6 rounded-3xl border-2 border-amber-500/20 shadow-md flex flex-col justify-between space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 font-black text-xl flex items-center justify-center">
              ✉️
            </div>
            <div>
              <h3 className="font-bold text-ink text-base">Email Address</h3>
              <p className="text-gray-600 font-medium break-all mt-1">{templeInfo.email}</p>
            </div>
          </div>
        </div>

        {/* Bank Account Details Card for Devotees & Sponsoring */}
        <div className="bg-gradient-to-r from-amber-500/10 via-white to-emerald-600/10 border-2 border-amber-500/40 rounded-3xl p-8 shadow-xl space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-brand-1 text-white font-black flex items-center justify-center">
              🏦
            </div>
            <div>
              <h3 className="text-xl font-black text-brand-1">Bank Account Details (For Sponsorships &amp; Donations)</h3>
              <p className="text-xs text-subtle font-medium">Bank transfer details for Dana offerings &amp; monastery development funds</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 text-xs font-bold">
            <div className="bg-white p-4 rounded-2xl border border-amber-200 shadow-sm space-y-1">
              <span className="text-amber-800 text-[10px] uppercase font-bold">Bank &amp; Branch</span>
              <p className="text-ink text-sm">{templeInfo.bank_name}</p>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-emerald-200 shadow-sm space-y-1">
              <span className="text-emerald-800 text-[10px] uppercase font-bold">Account Number</span>
              <p className="text-brand-1 text-base font-black tracking-wider">{templeInfo.bank_acc_number}</p>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-amber-200 shadow-sm space-y-1">
              <span className="text-amber-800 text-[10px] uppercase font-bold">Account Name</span>
              <p className="text-ink text-sm">{templeInfo.bank_acc_name}</p>
            </div>
          </div>
        </div>

        {/* Message Form & Google Map Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Send Message Form */}
          <div className="bg-white p-8 rounded-3xl border-2 border-brand-1/20 shadow-xl space-y-5">
            <div>
              <h2 className="text-2xl font-black text-brand-1">Send a Message</h2>
              <p className="text-xs text-subtle">Fill in the form below to send an inquiry or message.</p>
            </div>

            {submitted ? (
              <div className="bg-emerald-50 text-emerald-800 p-6 rounded-2xl border border-emerald-200 text-center space-y-2">
                <h4 className="font-bold text-base">Message Sent Successfully! ✓</h4>
                <p className="text-xs">We will get back to you shortly. Thank you.</p>
                <button
                  onClick={() => {
                    setSubmitted(false);
                    setMessageForm({ name: "", phone: "", email: "", message: "" });
                  }}
                  className="mt-2 px-4 py-1.5 bg-emerald-600 text-white font-bold text-xs rounded-xl"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleMessageSubmit} className="space-y-4 text-xs font-bold">
                <div>
                  <label className="block text-gray-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={messageForm.name}
                    onChange={(e) => setMessageForm({ ...messageForm, name: e.target.value })}
                    className="w-full p-3 border border-gray-200 rounded-xl outline-none focus:border-brand-1"
                    placeholder="e.g. Sunil Perera"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-gray-700 mb-1">Phone Number *</label>
                    <input
                      type="text"
                      required
                      value={messageForm.phone}
                      onChange={(e) => setMessageForm({ ...messageForm, phone: e.target.value })}
                      className="w-full p-3 border border-gray-200 rounded-xl outline-none focus:border-brand-1"
                      placeholder="07X XXXXXXX"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 mb-1">Email Address</label>
                    <input
                      type="email"
                      value={messageForm.email}
                      onChange={(e) => setMessageForm({ ...messageForm, email: e.target.value })}
                      className="w-full p-3 border border-gray-200 rounded-xl outline-none focus:border-brand-1"
                      placeholder="example@mail.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-gray-700 mb-1">Message *</label>
                  <textarea
                    rows={4}
                    required
                    value={messageForm.message}
                    onChange={(e) => setMessageForm({ ...messageForm, message: e.target.value })}
                    className="w-full p-3 border border-gray-200 rounded-xl outline-none focus:border-brand-1 resize-none"
                    placeholder="Type your message here..."
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-brand-1 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-md transition-colors"
                >
                  Send Message
                </button>
              </form>
            )}
          </div>

          {/* Location Map & Directions */}
          <div className="bg-white p-8 rounded-3xl border-2 border-brand-1/20 shadow-xl space-y-5 flex flex-col justify-between">
            <div className="space-y-2">
              <h2 className="text-2xl font-black text-brand-1">Location &amp; Directions</h2>
              <p className="text-xs text-subtle">
                {templeInfo.address}
              </p>
            </div>

            <div className="bg-amber-50 rounded-2xl border-2 border-amber-300/60 p-6 text-center space-y-4 my-auto">
              <div className="w-16 h-16 rounded-full bg-amber-500/20 text-amber-900 font-black text-3xl flex items-center justify-center mx-auto">
                🗺️
              </div>
              <h4 className="font-bold text-ink text-base">Google Maps Navigation</h4>
              <p className="text-xs text-gray-600">
                Located via Polonnaruwa - Aralaganwila at Kandegama Dhananjaya Rajamaha Viharaya.
              </p>
              <a
                href={templeInfo.map_link}
                target="_blank"
                rel="noreferrer"
                className="inline-block px-6 py-3 bg-brand-1 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-md transition-colors"
              >
                Open Google Maps Navigation 🗺️
              </a>
            </div>
          </div>
        </div>

      </div>

      {/* Admin Edit Modal */}
      {isEditOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden border border-brand-1/20 p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <h3 className="font-bold text-base text-ink">Edit Contact &amp; Bank Information (Admin Only)</h3>
              <button onClick={() => setIsEditOpen(false)} className="text-gray-400 font-bold hover:text-ink">✕</button>
            </div>

            <form onSubmit={handleSaveContactInfo} className="space-y-4 text-xs font-bold">
              {/* Contact Details Section */}
              <div className="space-y-2 border-b border-gray-100 pb-3">
                <h4 className="font-black text-amber-900 text-xs uppercase">1. Contact Information</h4>
                <div>
                  <label className="block text-gray-700 mb-1">Address</label>
                  <input
                    type="text"
                    value={editForm.address}
                    onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                    className="w-full p-2.5 border rounded-xl font-medium outline-none focus:border-brand-1"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-gray-700 mb-1">Phone 1</label>
                    <input
                      type="text"
                      value={editForm.phone1}
                      onChange={(e) => setEditForm({ ...editForm, phone1: e.target.value })}
                      className="w-full p-2.5 border rounded-xl font-medium outline-none focus:border-brand-1"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 mb-1">Phone 2</label>
                    <input
                      type="text"
                      value={editForm.phone2}
                      onChange={(e) => setEditForm({ ...editForm, phone2: e.target.value })}
                      className="w-full p-2.5 border rounded-xl font-medium outline-none focus:border-brand-1"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-gray-700 mb-1">WhatsApp</label>
                    <input
                      type="text"
                      value={editForm.whatsapp}
                      onChange={(e) => setEditForm({ ...editForm, whatsapp: e.target.value })}
                      className="w-full p-2.5 border rounded-xl font-medium outline-none focus:border-brand-1"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 mb-1">Email</label>
                    <input
                      type="text"
                      value={editForm.email}
                      onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                      className="w-full p-2.5 border rounded-xl font-medium outline-none focus:border-brand-1"
                    />
                  </div>
                </div>
              </div>

              {/* Bank Details Section */}
              <div className="space-y-2 border-b border-gray-100 pb-3">
                <h4 className="font-black text-amber-900 text-xs uppercase">2. Bank Account Details</h4>
                <div>
                  <label className="block text-gray-700 mb-1">Bank &amp; Branch</label>
                  <input
                    type="text"
                    value={editForm.bank_name}
                    onChange={(e) => setEditForm({ ...editForm, bank_name: e.target.value })}
                    className="w-full p-2.5 border rounded-xl font-medium outline-none focus:border-brand-1"
                    placeholder="e.g. People's Bank - Aralaganwila Branch"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-gray-700 mb-1">Account Number</label>
                    <input
                      type="text"
                      value={editForm.bank_acc_number}
                      onChange={(e) => setEditForm({ ...editForm, bank_acc_number: e.target.value })}
                      className="w-full p-2.5 border rounded-xl font-medium outline-none focus:border-brand-1"
                      placeholder="253200150044402"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 mb-1">Account Name</label>
                    <input
                      type="text"
                      value={editForm.bank_acc_name}
                      onChange={(e) => setEditForm({ ...editForm, bank_acc_name: e.target.value })}
                      className="w-full p-2.5 border rounded-xl font-medium outline-none focus:border-brand-1"
                      placeholder="Sagaramathi Piriven Development Society"
                    />
                  </div>
                </div>
              </div>

              {/* Google Maps Section */}
              <div className="space-y-2">
                <h4 className="font-black text-amber-900 text-xs uppercase">3. Google Maps Link</h4>
                <div>
                  <label className="block text-gray-700 mb-1">Google Maps URL</label>
                  <input
                    type="text"
                    value={editForm.map_link}
                    onChange={(e) => setEditForm({ ...editForm, map_link: e.target.value })}
                    className="w-full p-2.5 border rounded-xl font-medium outline-none focus:border-brand-1"
                    placeholder="https://maps.google.com/?q=..."
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-3 justify-end">
                <button
                  type="button"
                  onClick={() => setIsEditOpen(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2 bg-brand-1 hover:bg-emerald-800 text-white font-bold rounded-xl shadow-md disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Save All Details"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContactScreen;
