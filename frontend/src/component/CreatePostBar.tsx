import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { API_BASE_URL } from "../libs/api";

interface CreatePostBarProps {
  onPostCreated: () => void;
}

export const CreatePostBar: React.FC<CreatePostBarProps> = ({ onPostCreated }) => {
  const { user, token } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [content, setContent] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files).slice(0, 4);
      setFiles(selectedFiles);
      setPreviews(selectedFiles.map(f => URL.createObjectURL(f)));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() && files.length === 0) {
      alert("Please write text or attach a photo to publish a post.");
      return;
    }

    if (!token) {
      alert("Please log in first to create a post.");
      return;
    }

    try {
      setSubmitting(true);
      const formData = new FormData();
      formData.append("content", content);
      files.forEach(f => formData.append("photos", f));

      const res = await fetch(`${API_BASE_URL}/posts`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });

      const data = await res.json();

      if (res.ok) {
        setContent("");
        setFiles([]);
        setPreviews([]);
        setIsModalOpen(false);
        onPostCreated();
      } else {
        alert(data.message || "Failed to publish post.");
      }
    } catch (e) {
      console.error("Error creating post", e);
      alert("Server error. Please try again later.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-brand-1/10 p-4 mb-3">
      {/* Input Row */}
      <div className="flex items-center gap-3 border-b border-gray-100 pb-3">
        <div className="w-10 h-10 rounded-full bg-brand-1 text-white font-bold flex items-center justify-center shrink-0 shadow-inner">
          {user ? user.name.charAt(0).toUpperCase() : "S"}
        </div>
        <button
          onClick={() => {
            if (!user) {
              alert("Please log in first to create a post.");
              return;
            }
            setIsModalOpen(true);
          }}
          className="flex-1 bg-gray-100 hover:bg-gray-200/80 text-gray-500 text-left px-5 py-2.5 rounded-full text-xs sm:text-sm font-medium transition-colors"
        >
          {user ? `What's on your mind, ${user.name}?` : "What's on your mind?"}
        </button>
      </div>

      {/* Quick Action Buttons */}
      <div className="flex items-center justify-between pt-3 px-2 text-xs font-bold text-gray-600">
        <button
          onClick={() => {
            if (!user) {
              alert("Please log in first.");
              return;
            }
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 hover:bg-gray-100 px-3 py-1.5 rounded-xl transition-colors text-emerald-600"
        >
          Photo / Video
        </button>
        <button
          onClick={() => {
            if (!user) {
              alert("Please log in first.");
              return;
            }
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 hover:bg-gray-100 px-3 py-1.5 rounded-xl transition-colors text-amber-600"
        >
          Announcement & News
        </button>
        <button
          onClick={() => {
            if (!user) {
              alert("Please log in first.");
              return;
            }
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 hover:bg-gray-100 px-3 py-1.5 rounded-xl transition-colors text-rose-500"
        >
          Merit & Dana
        </button>
      </div>

      {/* Create Post Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden border border-brand-1/20">
            {/* Modal Header */}
            <div className="bg-brand-1 px-6 py-4 flex items-center justify-between text-white">
              <h3 className="font-bold text-sm sm:text-base flex items-center gap-2">
                Create Post
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-white hover:text-gray-200">✕</button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* User Info */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-brand-1 text-white font-bold flex items-center justify-center">
                  {user?.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-bold text-ink text-sm">{user?.name}</p>
                  <span className="text-[10px] bg-brand-1/10 text-brand-1 px-2 py-0.5 rounded-full font-bold uppercase">
                    Public Post
                  </span>
                </div>
              </div>

              {/* Text Area */}
              <textarea
                rows={4}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write your news or announcement here..."
                className="w-full p-3 text-sm border border-gray-200 rounded-xl focus:border-brand-1 outline-none resize-none"
              />

              {/* Image Attachments */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Attach Photos (Max 4)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileChange}
                  className="w-full text-xs text-gray-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-brand-1/10 file:text-brand-1 hover:file:bg-brand-1/20"
                />
              </div>

              {/* Previews Grid */}
              {previews.length > 0 && (
                <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto p-1">
                  {previews.map((src, idx) => (
                    <img key={idx} src={src} alt="Preview" className="w-full h-24 object-cover rounded-xl border border-gray-200" />
                  ))}
                </div>
              )}

              {/* Modal Actions */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 bg-gray-100 text-ink text-xs font-bold rounded-xl hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-md disabled:opacity-50"
                >
                  {submitting ? "Publishing..." : "Publish Post"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
