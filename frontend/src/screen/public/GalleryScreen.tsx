import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { API_BASE_URL } from "../../libs/api";

interface GalleryItem {
  id: number;
  title?: string;
  type: "PHOTO" | "VIDEO";
  url: string;
  description?: string;
  album?: string;
  createdAt: string;
}

const getYouTubeEmbedUrl = (url: string): string | null => {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? `https://www.youtube.com/embed/${match[2]}` : null;
};

const GalleryScreen: React.FC = () => {
  const { user, token } = useAuth();
  const isAdmin = user?.role === "SUPER_ADMIN" || user?.role === "ADMIN";

  const [activeTab, setActiveTab] = useState<"PHOTO" | "VIDEO">("PHOTO");
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Lightbox modal for photo preview
  const [selectedPhoto, setSelectedPhoto] = useState<GalleryItem | null>(null);

  // Add/Edit Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<GalleryItem | null>(null);
  const [itemForm, setItemForm] = useState({
    title: "",
    type: "PHOTO" as "PHOTO" | "VIDEO",
    videoUrl: "",
    description: "",
    album: "GENERAL"
  });
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchGalleryItems();
  }, [activeTab]);

  const fetchGalleryItems = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/gallery?type=${activeTab}`);
      if (res.ok) {
        const json = await res.json();
        setItems(json.data || []);
      }
    } catch (e) {
      console.error("Error fetching gallery items", e);
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = (defaultType: "PHOTO" | "VIDEO") => {
    setEditingItem(null);
    setItemForm({ title: "", type: defaultType, videoUrl: "", description: "", album: "GENERAL" });
    setMediaFile(null);
    setFilePreview("");
    setIsModalOpen(true);
  };

  const openEditModal = (item: GalleryItem) => {
    setEditingItem(item);
    setItemForm({
      title: item.title || "",
      type: item.type,
      videoUrl: item.type === "VIDEO" && !item.url.startsWith("/uploads/") ? item.url : "",
      description: item.description || "",
      album: item.album || "GENERAL"
    });
    setMediaFile(null);
    setFilePreview(item.url.startsWith("/uploads/") ? `${API_BASE_URL.replace('/api', '')}${item.url}` : "");
    setIsModalOpen(true);
  };

  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    try {
      setSubmitting(true);
      const formData = new FormData();
      formData.append("title", itemForm.title);
      formData.append("type", itemForm.type);
      formData.append("description", itemForm.description);
      formData.append("album", itemForm.album);

      if (itemForm.type === "PHOTO") {
        if (mediaFile) {
          formData.append("photo", mediaFile);
        } else if (!editingItem) {
          alert("Please upload a photo file");
          setSubmitting(false);
          return;
        }
      } else {
        // VIDEO
        if (mediaFile) {
          formData.append("photo", mediaFile);
        }
        if (itemForm.videoUrl) {
          formData.append("videoUrl", itemForm.videoUrl);
        }

        if (!mediaFile && !itemForm.videoUrl.trim() && !editingItem) {
          alert("Please upload a video file OR enter a YouTube/video link.");
          setSubmitting(false);
          return;
        }
      }

      const url = editingItem
        ? `${API_BASE_URL}/gallery/${editingItem.id}`
        : `${API_BASE_URL}/gallery`;

      const method = editingItem ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });

      if (res.ok) {
        alert(editingItem ? "Gallery item updated!" : "Gallery item added successfully!");
        setIsModalOpen(false);
        fetchGalleryItems();
      } else {
        const err = await res.json();
        alert(err.message || "Failed to save gallery item");
      }
    } catch (e) {
      console.error("Error saving gallery item", e);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteItem = async (id: number) => {
    if (!token || !window.confirm("Are you sure you want to delete this gallery item?")) return;

    try {
      const res = await fetch(`${API_BASE_URL}/gallery/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.ok) {
        alert("Gallery item deleted");
        fetchGalleryItems();
      }
    } catch (e) {
      console.error("Error deleting gallery item", e);
    }
  };

  const handleShareToFeed = async (item: GalleryItem) => {
    if (!user) {
      alert("Please log in first to share items to the newsfeed.");
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/gallery/${item.id}/share`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.ok) {
        alert("Item shared to Newsfeed! You can view it on the Home screen.");
      } else {
        const err = await res.json();
        alert(err.message || "Failed to share item");
      }
    } catch (e) {
      console.error("Error sharing item", e);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50/40 via-white to-gray-50 py-10 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto space-y-8">

        {/* Page Header */}
        <div className="bg-white border-2 border-amber-500/30 rounded-3xl p-8 shadow-xl text-center space-y-4 relative overflow-hidden">
          <span className="text-xs font-bold text-brand-1 uppercase tracking-widest bg-brand-1/10 px-4 py-1 rounded-full">
            ඡායාරූප සහ වීඩියෝ එකතුව
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-brand-1 tracking-tight">
            සාගරමති ගැලරිය (Gallery)
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 font-medium max-w-2xl mx-auto">
            සාගරමති පිරිවෙනේ සහ ධනංජය රජමහා විහාරයේ පැවැත්වුණු පින්කම්, උත්සව සහ විශේෂ අවස්ථාවන්හි ඡායාරූප සහ වීඩියෝ එකතුව.
          </p>

          {/* Tabs & Add Button Row */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-gray-100">
            {/* Tabs */}
            <div className="flex bg-amber-100/70 p-1.5 rounded-2xl gap-1">
              <button
                onClick={() => setActiveTab("PHOTO")}
                className={`px-6 py-2 rounded-xl text-xs sm:text-sm font-black transition-all ${
                  activeTab === "PHOTO"
                    ? "bg-brand-1 text-white shadow-md"
                    : "text-amber-950 hover:text-brand-1"
                }`}
              >
                📸 ඡායාරූප (Photos)
              </button>
              <button
                onClick={() => setActiveTab("VIDEO")}
                className={`px-6 py-2 rounded-xl text-xs sm:text-sm font-black transition-all ${
                  activeTab === "VIDEO"
                    ? "bg-brand-1 text-white shadow-md"
                    : "text-amber-950 hover:text-brand-1"
                }`}
              >
                🎥 වීඩියෝ (Videos)
              </button>
            </div>

            {/* Admin Add Button */}
            {isAdmin && (
              <button
                onClick={() => openAddModal(activeTab)}
                className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-2"
              >
                + Add {activeTab === "PHOTO" ? "Photo" : "Video"} (Admin)
              </button>
            )}
          </div>
        </div>

        {/* Content Display Grid */}
        {loading ? (
          <div className="bg-white p-12 rounded-3xl text-center text-gray-500 font-semibold text-sm shadow-sm border border-gray-200">
            ලෝඩ් වෙමින් පවතී... (Loading Gallery...)
          </div>
        ) : items.length === 0 ? (
          <div className="bg-white p-12 rounded-3xl text-center text-gray-500 font-semibold text-sm shadow-sm border border-gray-200 space-y-2">
            <h3 className="font-bold text-ink text-base">තවම {activeTab === "PHOTO" ? "ඡායාරූප" : "වීඩියෝ"} එකතු කර නොමැත</h3>
            {isAdmin && (
              <p className="text-xs text-subtle">
                ඉහත "+ Add" බොත්තම භාවිතයෙන් ප්‍රථම {activeTab === "PHOTO" ? "ඡායාරූපය" : "වීඩියෝව"} එකතු කරන්න!
              </p>
            )}
          </div>
        ) : activeTab === "PHOTO" ? (
          /* Photos Grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {items.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-3xl border border-amber-500/20 shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden flex flex-col justify-between group"
              >
                <div
                  className="relative cursor-pointer overflow-hidden aspect-square"
                  onClick={() => setSelectedPhoto(item)}
                >
                  <img
                    src={`${API_BASE_URL.replace('/api', '')}${item.url}`}
                    alt={item.title || "Gallery Photo"}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white font-bold text-xs bg-gradient-to-t from-black/60 via-transparent to-transparent p-4">
                    🔍 Click to Enlarge
                  </div>
                </div>

                <div className="p-4 space-y-2">
                  {item.title && <h4 className="font-bold text-ink text-sm leading-snug">{item.title}</h4>}
                  {item.description && <p className="text-xs text-gray-600 line-clamp-2">{item.description}</p>}
                </div>

                {/* Footer Buttons: Share & Admin Actions */}
                <div className="px-4 py-3 bg-amber-50/50 border-t border-amber-100 flex items-center justify-between text-xs">
                  <button
                    onClick={() => handleShareToFeed(item)}
                    className="px-3 py-1 bg-brand-1/10 hover:bg-brand-1/20 text-brand-1 font-bold rounded-lg transition-colors flex items-center gap-1"
                  >
                    ↗️ Share to Feed
                  </button>

                  {isAdmin && (
                    <div className="flex gap-1">
                      <button
                        onClick={() => openEditModal(item)}
                        className="px-2.5 py-1 bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold rounded-lg"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteItem(item.id)}
                        className="px-2.5 py-1 bg-rose-100 hover:bg-rose-200 text-rose-800 font-bold rounded-lg"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Videos Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {items.map((item) => {
              const embedUrl = getYouTubeEmbedUrl(item.url);
              const videoSrc = item.url.startsWith("/") ? `${API_BASE_URL.replace('/api', '')}${item.url}` : item.url;
              return (
                <div
                  key={item.id}
                  className="bg-white rounded-3xl border-2 border-amber-500/20 shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden flex flex-col justify-between"
                >
                  <div className="aspect-video bg-black relative flex items-center justify-center">
                    {embedUrl ? (
                      <iframe
                        src={embedUrl}
                        title={item.title || "Gallery Video"}
                        className="w-full h-full border-0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    ) : (
                      <video src={videoSrc} controls className="w-full h-full object-contain" />
                    )}
                  </div>

                  <div className="p-6 space-y-2">
                    {item.title && <h3 className="font-bold text-ink text-base">{item.title}</h3>}
                    {item.description && (
                      <p className="text-xs text-gray-600 whitespace-pre-line">{item.description}</p>
                    )}
                  </div>

                  {/* Actions Row */}
                  <div className="px-6 py-3 bg-amber-50/50 border-t border-amber-100 flex items-center justify-between text-xs">
                    <button
                      onClick={() => handleShareToFeed(item)}
                      className="px-4 py-1.5 bg-brand-1 text-white font-bold rounded-xl shadow-sm hover:bg-emerald-800 transition-colors"
                    >
                      ↗️ Share to Feed
                    </button>

                    {isAdmin && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => openEditModal(item)}
                          className="px-3 py-1.5 bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold rounded-xl"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteItem(item.id)}
                          className="px-3 py-1.5 bg-rose-100 hover:bg-rose-200 text-rose-800 font-bold rounded-xl"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>

      {/* Lightbox Modal for Photo */}
      {selectedPhoto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-fade-in">
          <div className="relative max-w-4xl w-full bg-black rounded-3xl overflow-hidden shadow-2xl border border-white/10 flex flex-col items-center">
            <button
              onClick={() => setSelectedPhoto(null)}
              className="absolute top-4 right-4 z-10 w-10 h-10 bg-white/20 hover:bg-white/40 text-white font-bold rounded-full flex items-center justify-center text-lg"
            >
              ✕
            </button>
            <img
              src={`${API_BASE_URL.replace('/api', '')}${selectedPhoto.url}`}
              alt={selectedPhoto.title || "Large Preview"}
              className="max-h-[75vh] w-auto object-contain"
            />
            {selectedPhoto.title && (
              <div className="p-4 text-center text-white space-y-1">
                <h3 className="font-bold text-base">{selectedPhoto.title}</h3>
                {selectedPhoto.description && <p className="text-xs text-gray-300">{selectedPhoto.description}</p>}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add / Edit Gallery Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden border border-brand-1/20 p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <h3 className="font-bold text-base text-ink">
                {editingItem ? "Edit Gallery Item" : `Add New ${itemForm.type === "PHOTO" ? "Photo" : "Video"}`}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 font-bold hover:text-ink">✕</button>
            </div>

            <form onSubmit={handleSaveItem} className="space-y-3 text-xs font-bold">
              <div>
                <label className="block text-gray-700 mb-1">Title (මාතෘකාව)</label>
                <input
                  type="text"
                  placeholder="e.g. පිරිවෙන් වාර්ෂික පින්කම"
                  value={itemForm.title}
                  onChange={(e) => setItemForm({ ...itemForm, title: e.target.value })}
                  className="w-full p-2.5 border rounded-xl font-medium outline-none focus:border-brand-1"
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-1">Media Type</label>
                <select
                  value={itemForm.type}
                  onChange={(e) => setItemForm({ ...itemForm, type: e.target.value as "PHOTO" | "VIDEO" })}
                  className="w-full p-2.5 border rounded-xl font-medium outline-none focus:border-brand-1"
                >
                  <option value="PHOTO">Photo (ඡායාරූපය)</option>
                  <option value="VIDEO">Video (වීඩියෝ)</option>
                </select>
              </div>

              {itemForm.type === "PHOTO" ? (
                <div>
                  <label className="block text-gray-700 mb-1">Upload Photo (ඡායාරූපය)</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        const file = e.target.files[0];
                        setMediaFile(file);
                        setFilePreview(URL.createObjectURL(file));
                      }
                    }}
                    className="w-full text-xs text-gray-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-amber-100 file:text-amber-900"
                  />
                  {filePreview && (
                    <div className="mt-2 flex justify-center">
                      <img src={filePreview} alt="Preview" className="h-28 rounded-xl object-cover border" />
                    </div>
                  )}
                </div>
              ) : (
                /* VIDEO Options: File Upload OR Video Link */
                <div className="space-y-3 p-3.5 bg-amber-50/60 rounded-2xl border border-amber-200">
                  <div>
                    <label className="block text-gray-700 mb-1">
                      Upload Video File (වීඩියෝ ෆයිල් එකක් Upload කරන්න)
                    </label>
                    <input
                      type="file"
                      accept="video/*"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          const file = e.target.files[0];
                          setMediaFile(file);
                          setFilePreview(URL.createObjectURL(file));
                        }
                      }}
                      className="w-full text-xs text-gray-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-amber-100 file:text-amber-900"
                    />
                    {mediaFile && (
                      <div className="mt-2 text-xs text-emerald-800 font-bold bg-emerald-50 p-2 rounded-xl border border-emerald-200">
                        Selected Video File: {mediaFile.name} ({(mediaFile.size / (1024 * 1024)).toFixed(2)} MB)
                      </div>
                    )}
                  </div>

                  <div className="text-center text-[10px] font-black text-amber-900 uppercase tracking-widest">
                    — හෝ (OR) —
                  </div>

                  <div>
                    <label className="block text-gray-700 mb-1">
                      YouTube / Video Link (YouTube හෝ වීඩියෝ ලින්ක් එක)
                    </label>
                    <input
                      type="text"
                      placeholder="https://www.youtube.com/watch?v=... හෝ වීඩියෝ ලින්ක් එක"
                      value={itemForm.videoUrl}
                      onChange={(e) => setItemForm({ ...itemForm, videoUrl: e.target.value })}
                      className="w-full p-2.5 border rounded-xl font-medium outline-none focus:border-brand-1 bg-white"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-gray-700 mb-1">Description (විස්තරය)</label>
                <textarea
                  rows={3}
                  value={itemForm.description}
                  onChange={(e) => setItemForm({ ...itemForm, description: e.target.value })}
                  className="w-full p-2.5 border rounded-xl font-medium outline-none focus:border-brand-1"
                  placeholder="Short description..."
                />
              </div>

              <div className="flex gap-2 pt-2 justify-end">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2 bg-brand-1 hover:bg-emerald-800 text-white font-bold rounded-xl shadow-md disabled:opacity-50"
                >
                  {submitting ? "Saving..." : "Save Gallery Item"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default GalleryScreen;
