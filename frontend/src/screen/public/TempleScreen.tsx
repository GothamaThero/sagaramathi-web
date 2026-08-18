import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { API_BASE_URL } from "../../libs/api";

interface TempleBranch {
  id: number;
  name: string;
  category: string;
  address: string;
  phone1?: string;
  phone2?: string;
  whatsapp?: string;
  email?: string;
  history?: string;
  imageUrl?: string;
  order: number;
}

interface MonkItem {
  id: number;
  name: string;
  designation?: string;
  templeName?: string;
  photoUrl?: string;
  phone?: string;
  bio?: string;
  category: string;
  order: number;
}

const TempleScreen: React.FC = () => {
  const { user, token } = useAuth();
  const isAdmin = user?.role === "SUPER_ADMIN" || user?.role === "ADMIN";

  const [branches, setBranches] = useState<TempleBranch[]>([]);
  const [monks, setMonks] = useState<MonkItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Branch Modal State
  const [isBranchModalOpen, setIsBranchModalOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState<TempleBranch | null>(null);
  const [branchForm, setBranchForm] = useState({
    name: "",
    category: "BRANCH",
    address: "",
    phone1: "",
    phone2: "",
    whatsapp: "",
    email: "",
    history: "",
    order: "0"
  });
  const [branchPhotoFile, setBranchPhotoFile] = useState<File | null>(null);
  const [branchPhotoPreview, setBranchPhotoPreview] = useState<string>("");

  // Monk Modal State
  const [isMonkModalOpen, setIsMonkModalOpen] = useState(false);
  const [editingMonk, setEditingMonk] = useState<MonkItem | null>(null);
  const [monkForm, setMonkForm] = useState({
    name: "",
    designation: "",
    templeName: "",
    phone: "",
    bio: "",
    category: "RESIDENT",
    order: "0"
  });
  const [monkPhotoFile, setMonkPhotoFile] = useState<File | null>(null);
  const [monkPhotoPreview, setMonkPhotoPreview] = useState<string>("");

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchTempleData();
  }, []);

  const fetchTempleData = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/temple`);
      if (res.ok) {
        const json = await res.json();
        if (json.branches) setBranches(json.branches);
        if (json.monks) setMonks(json.monks);
      }
    } catch (e) {
      console.error("Failed to fetch temple data", e);
    } finally {
      setLoading(false);
    }
  };

  // Branch Modal Handlers
  const openAddBranchModal = () => {
    setEditingBranch(null);
    setBranchForm({
      name: "",
      category: "BRANCH",
      address: "",
      phone1: "",
      phone2: "",
      whatsapp: "",
      email: "",
      history: "",
      order: "0"
    });
    setBranchPhotoFile(null);
    setBranchPhotoPreview("");
    setIsBranchModalOpen(true);
  };

  const openEditBranchModal = (branch: TempleBranch) => {
    setEditingBranch(branch);
    setBranchForm({
      name: branch.name,
      category: branch.category || "BRANCH",
      address: branch.address,
      phone1: branch.phone1 || "",
      phone2: branch.phone2 || "",
      whatsapp: branch.whatsapp || "",
      email: branch.email || "",
      history: branch.history || "",
      order: String(branch.order || 0)
    });
    setBranchPhotoFile(null);
    setBranchPhotoPreview(branch.imageUrl ? `${API_BASE_URL.replace('/api', '')}${branch.imageUrl}` : "");
    setIsBranchModalOpen(true);
  };

  const handleSaveBranch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    if (!branchForm.name.trim() || !branchForm.address.trim()) {
      alert("Please enter temple name and address");
      return;
    }

    try {
      setSaving(true);
      const formData = new FormData();
      formData.append("name", branchForm.name);
      formData.append("category", branchForm.category);
      formData.append("address", branchForm.address);
      formData.append("phone1", branchForm.phone1);
      formData.append("phone2", branchForm.phone2);
      formData.append("whatsapp", branchForm.whatsapp);
      formData.append("email", branchForm.email);
      formData.append("history", branchForm.history);
      formData.append("order", branchForm.order);
      if (branchPhotoFile) {
        formData.append("photo", branchPhotoFile);
      }

      const url = editingBranch
        ? `${API_BASE_URL}/temple/branches/${editingBranch.id}`
        : `${API_BASE_URL}/temple/branches`;

      const method = editingBranch ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });

      if (res.ok) {
        alert(editingBranch ? "Temple details updated!" : "New temple added successfully!");
        setIsBranchModalOpen(false);
        fetchTempleData();
      } else {
        const err = await res.json();
        alert(err.message || "Failed to save temple");
      }
    } catch (e) {
      console.error("Error saving temple branch", e);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteBranch = async (branchId: number) => {
    if (!token || !window.confirm("Are you sure you want to delete this temple entry?")) return;

    try {
      const res = await fetch(`${API_BASE_URL}/temple/branches/${branchId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.ok) {
        alert("Temple removed");
        fetchTempleData();
      }
    } catch (e) {
      console.error("Error deleting temple branch", e);
    }
  };

  // Monk Modal Handlers
  const openAddMonkModal = () => {
    setEditingMonk(null);
    setMonkForm({
      name: "",
      designation: "",
      templeName: branches.length > 0 ? branches[0].name : "සාගරමති පිරිවෙන සහ ධනංජය රජමහා විහාරය",
      phone: "",
      bio: "",
      category: "RESIDENT",
      order: "0"
    });
    setMonkPhotoFile(null);
    setMonkPhotoPreview("");
    setIsMonkModalOpen(true);
  };

  const openEditMonkModal = (monk: MonkItem) => {
    setEditingMonk(monk);
    setMonkForm({
      name: monk.name,
      designation: monk.designation || "",
      templeName: monk.templeName || "",
      phone: monk.phone || "",
      bio: monk.bio || "",
      category: monk.category || "RESIDENT",
      order: String(monk.order || 0)
    });
    setMonkPhotoFile(null);
    setMonkPhotoPreview(monk.photoUrl ? `${API_BASE_URL.replace('/api', '')}${monk.photoUrl}` : "");
    setIsMonkModalOpen(true);
  };

  const handleSaveMonk = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    if (!monkForm.name.trim()) {
      alert("Please enter monk's name");
      return;
    }

    try {
      setSaving(true);
      const formData = new FormData();
      formData.append("name", monkForm.name);
      formData.append("designation", monkForm.designation);
      formData.append("templeName", monkForm.templeName);
      formData.append("phone", monkForm.phone);
      formData.append("bio", monkForm.bio);
      formData.append("category", monkForm.category);
      formData.append("order", monkForm.order);
      if (monkPhotoFile) {
        formData.append("photo", monkPhotoFile);
      }

      const url = editingMonk
        ? `${API_BASE_URL}/temple/monks/${editingMonk.id}`
        : `${API_BASE_URL}/temple/monks`;

      const method = editingMonk ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });

      if (res.ok) {
        alert(editingMonk ? "Monk details updated!" : "Resident monk added!");
        setIsMonkModalOpen(false);
        fetchTempleData();
      } else {
        const err = await res.json();
        alert(err.message || "Operation failed");
      }
    } catch (e) {
      console.error("Error saving monk", e);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteMonk = async (monkId: number) => {
    if (!token || !window.confirm("Are you sure you want to delete this resident monk entry?")) return;

    try {
      const res = await fetch(`${API_BASE_URL}/temple/monks/${monkId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.ok) {
        alert("Monk entry removed");
        fetchTempleData();
      }
    } catch (e) {
      console.error("Error deleting monk", e);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50/40 via-white to-gray-50 py-10 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto space-y-12">

        {/* Page Top Title Card */}
        <div className="bg-white border-2 border-amber-500/30 rounded-3xl p-8 shadow-xl text-center space-y-4 relative overflow-hidden">
          <div className="flex justify-center">
            <img src="/logo.png" alt="Sagaramati Temple Emblem" className="w-20 h-20 object-contain filter drop-shadow-md" />
          </div>
          <div>
            <span className="text-xs font-bold text-amber-800 uppercase tracking-widest bg-amber-100 px-4 py-1 rounded-full">
              අපගේ විහාරස්ථාන පද්ධතිය
            </span>
            <h1 className="text-3xl sm:text-4xl font-black text-brand-1 mt-2">
              Our Temples Network
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-gray-600 font-medium max-w-2xl mx-auto">
            සාගරමති පිරිවෙණට අනුබද්ධ විහාරස්ථාන පද්ධතිය සහ වැඩ සිටින පූජනීය මහා සංඝරත්නයේ තොරතුරු.
          </p>

          {/* Admin Add Temple Button */}
          {isAdmin && (
            <div className="pt-2 border-t border-gray-100 flex justify-center">
              <button
                onClick={openAddBranchModal}
                className="px-6 py-2.5 bg-brand-1 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-2"
              >
                + Add New Temple (අලුත් විහාරස්ථානයක් ඇතුළත් කරන්න)
              </button>
            </div>
          )}
        </div>

        {/* Temples List Section */}
        <div className="space-y-6">
          <div className="border-b-2 border-amber-300/60 pb-3 flex items-center justify-between">
            <h2 className="text-2xl sm:text-3xl font-black text-brand-1">
              අපගේ විහාරස්ථාන (Our Temples)
            </h2>
            <span className="text-xs font-bold text-amber-900 bg-amber-100 px-3 py-1 rounded-full">
              {branches.length} Temples
            </span>
          </div>

          {loading ? (
            <div className="bg-white p-8 rounded-3xl text-center text-gray-500 font-semibold text-sm">
              විහාරස්ථාන තොරතුරු ලෝඩ් වෙමින් පවතී...
            </div>
          ) : branches.length === 0 ? (
            <div className="bg-white p-8 rounded-3xl text-center text-gray-500 font-semibold text-sm border border-gray-200">
              තවම විහාරස්ථාන ඇතුළත් කර නොමැත.
            </div>
          ) : (
            <div className="space-y-8">
              {branches.map((branch) => (
                <div
                  key={branch.id}
                  className="bg-white border-2 border-amber-500/30 rounded-3xl p-8 sm:p-10 shadow-xl relative overflow-hidden space-y-6 group hover:shadow-2xl transition-all duration-300"
                >
                  {/* Category Badge & Top Row */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-amber-200/80 pb-4">
                    <div className="space-y-1">
                      <span
                        className={`inline-block text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider ${
                          branch.category === "MAIN"
                            ? "bg-amber-500 text-white shadow-sm"
                            : "bg-emerald-700 text-white shadow-sm"
                        }`}
                      >
                        {branch.category === "MAIN" ? "ප්‍රධාන විහාරස්ථානය (Main Temple)" : "ශාඛා විහාරස්ථානය (Branch Temple)"}
                      </span>
                      <h2 className="text-2xl sm:text-3xl font-black text-brand-1 font-serif mt-1">
                        {branch.name}
                      </h2>
                    </div>

                    {/* Admin Actions */}
                    {isAdmin && (
                      <div className="flex gap-2 shrink-0">
                        <button
                          onClick={() => openEditBranchModal(branch)}
                          className="px-4 py-1.5 bg-amber-100 hover:bg-amber-200 text-amber-950 text-xs font-bold rounded-xl shadow-sm transition-colors"
                        >
                          Edit Temple
                        </button>
                        <button
                          onClick={() => handleDeleteBranch(branch.id)}
                          className="px-4 py-1.5 bg-rose-100 hover:bg-rose-200 text-rose-800 text-xs font-bold rounded-xl shadow-sm transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Temple Image (if uploaded) */}
                  {branch.imageUrl && (
                    <div className="rounded-2xl overflow-hidden max-h-80 w-full border border-amber-200 shadow-md">
                      <img
                        src={`${API_BASE_URL.replace('/api', '')}${branch.imageUrl}`}
                        alt={branch.name}
                        className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
                      />
                    </div>
                  )}

                  {/* Contact Details Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-semibold text-gray-700">
                    <div className="p-4 bg-amber-50/70 rounded-2xl border border-amber-200 flex flex-col items-center text-center gap-1">
                      <span className="text-amber-800 font-bold uppercase text-[10px]">📍 ලිපිනය (Address)</span>
                      <span className="font-bold text-ink">{branch.address}</span>
                    </div>

                    {(branch.phone1 || branch.phone2) && (
                      <div className="p-4 bg-emerald-50/70 rounded-2xl border border-emerald-200 flex flex-col items-center text-center gap-1">
                        <span className="text-emerald-800 font-bold uppercase text-[10px]">📞 දුරකථන අංක (Phone)</span>
                        <span className="font-bold text-ink">
                          {branch.phone1} {branch.phone2 ? `/ ${branch.phone2}` : ""}
                        </span>
                      </div>
                    )}

                    {(branch.whatsapp || branch.email) && (
                      <div className="p-4 bg-rose-50/70 rounded-2xl border border-rose-200 flex flex-col items-center text-center gap-1">
                        <span className="text-rose-800 font-bold uppercase text-[10px]">💬 WhatsApp &amp; Email</span>
                        <span className="font-bold text-ink">
                          {branch.whatsapp || ""} {branch.email ? `| ${branch.email}` : ""}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* History / Description */}
                  {branch.history && (
                    <div className="p-5 bg-amber-50/40 rounded-2xl border border-amber-200/60 space-y-2">
                      <h4 className="font-bold text-xs text-amber-900 uppercase">විහාරස්ථානයේ විස්තරය / ඓතිහාසික පසුබිම</h4>
                      <p className="text-gray-700 leading-relaxed font-medium text-xs sm:text-sm whitespace-pre-line text-justify">
                        {branch.history}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Resident Monks Section */}
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b-2 border-amber-300/60 pb-4">
            <div>
              <h2 className="text-2xl sm:text-3xl font-black text-brand-1">
                වැඩ ඉන්න හිමිවරුන් (Resident Monks)
              </h2>
              <p className="text-xs text-subtle font-medium">
                අපගේ විහාරස්ථාන පද්ධතියේ වැඩ සිටින පූජනීය මහා සංඝරත්නය
              </p>
            </div>

            {isAdmin && (
              <button
                onClick={openAddMonkModal}
                className="px-5 py-2.5 bg-brand-1 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-2"
              >
                + Add Resident Monk (Admin)
              </button>
            )}
          </div>

          {loading ? (
            <div className="bg-white p-8 rounded-3xl text-center text-gray-500 font-semibold text-sm">
              හිමිවරුන්ගේ තොරතුරු ලෝඩ් වෙමින් පවතී...
            </div>
          ) : monks.length === 0 ? (
            <div className="bg-white p-8 rounded-3xl text-center text-gray-500 font-semibold text-sm border border-gray-200">
              තවම හිමිවරුන්ගේ විස්තර ඇතුළත් කර නොමැත.
            </div>
          ) : (
            /* Large Top-Photo Monk Cards Grid */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {monks.map((monk) => (
                <div
                  key={monk.id}
                  className="bg-white rounded-3xl border-2 border-amber-500/30 shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden flex flex-col justify-between group relative"
                >
                  {/* Top Photo & Badge Container */}
                  <div className="relative bg-gradient-to-b from-amber-100/60 via-amber-50/40 to-white pt-6 pb-2 px-4 flex flex-col items-center">
                    {/* Decorative Top Accent Bar */}
                    <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-amber-600 via-amber-500 to-amber-700" />

                    {/* Prominent Large Monk Portrait Photo (Perfectly Balanced) */}
                    {monk.photoUrl ? (
                      <div className="relative w-52 h-60 sm:w-60 sm:h-72 rounded-3xl overflow-hidden border-4 border-amber-400/90 shadow-xl group-hover:scale-[1.02] transition-transform duration-300 bg-gradient-to-b from-amber-100/60 to-amber-50 flex items-center justify-center p-1">
                        <img
                          src={`${API_BASE_URL.replace('/api', '')}${monk.photoUrl}`}
                          alt={monk.name}
                          className="w-full h-full object-contain drop-shadow-sm"
                        />
                      </div>
                    ) : (
                      <div className="w-52 h-60 sm:w-60 sm:h-72 rounded-3xl bg-gradient-to-br from-amber-100 to-amber-200 text-amber-900 font-black text-6xl flex items-center justify-center border-4 border-amber-400/90 shadow-inner">
                        ☸
                      </div>
                    )}

                    {/* Category Badge below photo */}
                    <div className="mt-3.5">
                      <span
                        className={`inline-block text-xs font-black px-4 py-1 rounded-full uppercase tracking-wider shadow-sm ${
                          monk.category === "CHIEF_NAYAKA"
                            ? "bg-amber-500 text-white"
                            : monk.category === "STUDENT"
                            ? "bg-sky-700 text-white"
                            : "bg-emerald-700 text-white"
                        }`}
                      >
                        {monk.category === "CHIEF_NAYAKA"
                          ? "ප්‍රධාන නායක හිමි"
                          : monk.category === "STUDENT"
                          ? "ශිෂ්‍ය හිමි"
                          : "නේවාසික හිමි"}
                      </span>
                    </div>
                  </div>

                  {/* Monk Name & Details Section below photo */}
                  <div className="p-6 pt-2 space-y-4 text-center">
                    {/* Full Monk Name */}
                    <h3 className="text-xl sm:text-2xl font-black text-brand-1 leading-snug break-words font-serif">
                      {monk.name}
                    </h3>

                    {/* Designation / Role */}
                    {monk.designation && (
                      <div>
                        <span className="text-xs font-bold text-amber-900 bg-amber-50 px-3.5 py-1 rounded-xl border border-amber-200/80 inline-block">
                          {monk.designation}
                        </span>
                      </div>
                    )}

                    {/* Current Temple Badge (දැනට වැඩසිටින විහාරස්ථානය) */}
                    {monk.templeName && (
                      <div className="bg-gradient-to-r from-amber-50 via-amber-100/50 to-amber-50 p-3 rounded-2xl border border-amber-300/60 text-xs font-bold text-amber-950 flex items-center justify-center gap-2 shadow-sm text-center">
                        <span className="text-base shrink-0">🛕</span>
                        <div className="min-w-0">
                          <span className="text-[10px] font-bold text-amber-800 uppercase block leading-none mb-0.5">
                            වැඩවෙසෙන විහාරස්ථානය
                          </span>
                          <span className="font-extrabold text-ink break-words leading-tight block">
                            {monk.templeName}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Phone Number */}
                    {monk.phone && (
                      <div className="flex justify-center">
                        <a
                          href={`tel:${monk.phone}`}
                          className="inline-flex items-center gap-2 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-4 py-1.5 rounded-xl border border-emerald-200 transition-colors"
                        >
                          <span>📞</span>
                          <span>{monk.phone}</span>
                        </a>
                      </div>
                    )}

                    {/* Bio / Description */}
                    {monk.bio && (
                      <div className="p-3.5 bg-gray-50/80 rounded-2xl border border-gray-100 text-left">
                        <p className="text-xs text-gray-700 leading-relaxed whitespace-pre-line break-words font-medium">
                          {monk.bio}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Admin Actions Bar */}
                  {isAdmin && (
                    <div className="bg-amber-50/80 px-6 py-3 border-t border-amber-200/70 flex justify-end gap-2">
                      <button
                        onClick={() => openEditMonkModal(monk)}
                        className="px-4 py-1.5 bg-amber-200 hover:bg-amber-300 text-amber-950 text-xs font-bold rounded-xl shadow-sm transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteMonk(monk.id)}
                        className="px-4 py-1.5 bg-rose-100 hover:bg-rose-200 text-rose-800 text-xs font-bold rounded-xl shadow-sm transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* Add / Edit Temple Branch Modal */}
      {isBranchModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden border border-brand-1/20 p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <h3 className="font-bold text-base text-ink">
                {editingBranch ? "Edit Temple Branch" : "Add New Temple Branch (අලුත් විහාරස්ථානයක්)"}
              </h3>
              <button onClick={() => setIsBranchModalOpen(false)} className="text-gray-400 font-bold hover:text-ink">✕</button>
            </div>

            <form onSubmit={handleSaveBranch} className="space-y-3 text-xs font-bold">
              <div>
                <label className="block text-gray-700 mb-1">Temple Name (විහාරස්ථානයේ නම) *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. සාගරමති පිරිවෙන සහ ධනංජය රජමහා විහාරය"
                  value={branchForm.name}
                  onChange={(e) => setBranchForm({ ...branchForm, name: e.target.value })}
                  className="w-full p-2.5 border rounded-xl font-medium outline-none focus:border-brand-1"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-gray-700 mb-1">Category (වර්ගය)</label>
                  <select
                    value={branchForm.category}
                    onChange={(e) => setBranchForm({ ...branchForm, category: e.target.value })}
                    className="w-full p-2.5 border rounded-xl font-medium outline-none focus:border-brand-1"
                  >
                    <option value="MAIN">ප්‍රධාන විහාරස්ථානය (Main)</option>
                    <option value="BRANCH">ශාඛා විහාරස්ථානය (Branch)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-700 mb-1">Display Order</label>
                  <input
                    type="number"
                    value={branchForm.order}
                    onChange={(e) => setBranchForm({ ...branchForm, order: e.target.value })}
                    className="w-full p-2.5 border rounded-xl font-medium outline-none focus:border-brand-1"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-700 mb-1">Address (ලිපිනය) *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. කන්දෙගම, අරලගංවිල, පොළොන්නරුව"
                  value={branchForm.address}
                  onChange={(e) => setBranchForm({ ...branchForm, address: e.target.value })}
                  className="w-full p-2.5 border rounded-xl font-medium outline-none focus:border-brand-1"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-gray-700 mb-1">Phone 1</label>
                  <input
                    type="text"
                    value={branchForm.phone1}
                    onChange={(e) => setBranchForm({ ...branchForm, phone1: e.target.value })}
                    className="w-full p-2.5 border rounded-xl font-medium outline-none focus:border-brand-1"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 mb-1">Phone 2</label>
                  <input
                    type="text"
                    value={branchForm.phone2}
                    onChange={(e) => setBranchForm({ ...branchForm, phone2: e.target.value })}
                    className="w-full p-2.5 border rounded-xl font-medium outline-none focus:border-brand-1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-gray-700 mb-1">WhatsApp</label>
                  <input
                    type="text"
                    value={branchForm.whatsapp}
                    onChange={(e) => setBranchForm({ ...branchForm, whatsapp: e.target.value })}
                    className="w-full p-2.5 border rounded-xl font-medium outline-none focus:border-brand-1"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 mb-1">Email</label>
                  <input
                    type="text"
                    value={branchForm.email}
                    onChange={(e) => setBranchForm({ ...branchForm, email: e.target.value })}
                    className="w-full p-2.5 border rounded-xl font-medium outline-none focus:border-brand-1"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-700 mb-1">Upload Temple Photo (ඡායාරූපය)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      const file = e.target.files[0];
                      setBranchPhotoFile(file);
                      setBranchPhotoPreview(URL.createObjectURL(file));
                    }
                  }}
                  className="w-full text-xs text-gray-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-amber-100 file:text-amber-900"
                />
              </div>

              {branchPhotoPreview && (
                <div className="flex justify-center py-1">
                  <img src={branchPhotoPreview} alt="Preview" className="h-28 rounded-2xl object-cover border-2 border-amber-400 shadow-md" />
                </div>
              )}

              <div>
                <label className="block text-gray-700 mb-1">History / Description (විස්තරය)</label>
                <textarea
                  rows={4}
                  value={branchForm.history}
                  onChange={(e) => setBranchForm({ ...branchForm, history: e.target.value })}
                  className="w-full p-2.5 border rounded-xl font-medium outline-none focus:border-brand-1"
                  placeholder="History or details about this temple..."
                />
              </div>

              <div className="flex gap-2 pt-2 justify-end">
                <button
                  type="button"
                  onClick={() => setIsBranchModalOpen(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2 bg-brand-1 hover:bg-emerald-800 text-white font-bold rounded-xl shadow-md disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Save Temple"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add/Edit Monk Modal */}
      {isMonkModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden border border-brand-1/20 p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <h3 className="font-bold text-base text-ink">
                {editingMonk ? "Edit Resident Monk" : "Add Resident Monk"}
              </h3>
              <button onClick={() => setIsMonkModalOpen(false)} className="text-gray-400 font-bold hover:text-ink">✕</button>
            </div>

            <form onSubmit={handleSaveMonk} className="space-y-3 text-xs font-bold">
              <div>
                <label className="block text-gray-700 mb-1">Monk's Name (නම) *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. පූජ්‍ය කන්දේගම දීපවංසාලංකාර හිමි"
                  value={monkForm.name}
                  onChange={(e) => setMonkForm({ ...monkForm, name: e.target.value })}
                  className="w-full p-2.5 border rounded-xl font-medium outline-none focus:border-brand-1"
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-1">Designation / Role (තනතුර)</label>
                <input
                  type="text"
                  placeholder="e.g. ප්‍රධාන නායක හිමි / සභාපති"
                  value={monkForm.designation}
                  onChange={(e) => setMonkForm({ ...monkForm, designation: e.target.value })}
                  className="w-full p-2.5 border rounded-xl font-medium outline-none focus:border-brand-1"
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-1">Current Temple (දැනට වැඩසිටින විහාරස්ථානය)</label>
                <input
                  type="text"
                  placeholder="Select or write temple name..."
                  value={monkForm.templeName}
                  onChange={(e) => setMonkForm({ ...monkForm, templeName: e.target.value })}
                  className="w-full p-2.5 border rounded-xl font-medium outline-none focus:border-brand-1"
                  list="temple-list"
                />
                <datalist id="temple-list">
                  {branches.map((b) => (
                    <option key={b.id} value={b.name} />
                  ))}
                </datalist>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-gray-700 mb-1">Status / Category (තත්ත්වය)</label>
                  <select
                    value={monkForm.category}
                    onChange={(e) => setMonkForm({ ...monkForm, category: e.target.value })}
                    className="w-full p-2.5 border rounded-xl font-medium outline-none focus:border-brand-1"
                  >
                    <option value="CHIEF_NAYAKA">ප්‍රධාන නායක හිමි</option>
                    <option value="RESIDENT">නේවාසික හිමි</option>
                    <option value="STUDENT">ශිෂ්‍ය හිමි</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-700 mb-1">Phone Number</label>
                  <input
                    type="text"
                    placeholder="07X XXXXXXX"
                    value={monkForm.phone}
                    onChange={(e) => setMonkForm({ ...monkForm, phone: e.target.value })}
                    className="w-full p-2.5 border rounded-xl font-medium outline-none focus:border-brand-1"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-700 mb-1">Display Order (අනුපිළිවෙල)</label>
                <input
                  type="number"
                  value={monkForm.order}
                  onChange={(e) => setMonkForm({ ...monkForm, order: e.target.value })}
                  className="w-full p-2.5 border rounded-xl font-medium outline-none focus:border-brand-1"
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-1">Upload Photo (ඡායාරූපය)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      const file = e.target.files[0];
                      setMonkPhotoFile(file);
                      setMonkPhotoPreview(URL.createObjectURL(file));
                    }
                  }}
                  className="w-full text-xs text-gray-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-amber-100 file:text-amber-900"
                />
              </div>

              {monkPhotoPreview && (
                <div className="flex justify-center py-1">
                  <img src={monkPhotoPreview} alt="Preview" className="w-24 h-24 rounded-2xl object-cover border-2 border-amber-400 shadow-md" />
                </div>
              )}

              <div>
                <label className="block text-gray-700 mb-1">Bio / Description (විස්තරය)</label>
                <textarea
                  rows={3}
                  value={monkForm.bio}
                  onChange={(e) => setMonkForm({ ...monkForm, bio: e.target.value })}
                  className="w-full p-2.5 border rounded-xl font-medium outline-none focus:border-brand-1"
                  placeholder="Short description..."
                />
              </div>

              <div className="flex gap-2 pt-2 justify-end">
                <button
                  type="button"
                  onClick={() => setIsMonkModalOpen(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl shadow-md disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Save Monk Entry"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TempleScreen;
