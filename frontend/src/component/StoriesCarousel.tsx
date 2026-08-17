import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { API_BASE_URL, SERVER_URL } from "../libs/api";

interface StoryItem {
  id: number;
  title?: string;
  imageUrl: string;
  authorName: string;
  createdAt: string;
}

export const StoriesCarousel: React.FC = () => {
  const { user, token } = useAuth();
  const [stories, setStories] = useState<StoryItem[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStory, setSelectedStory] = useState<StoryItem | null>(null);
  const [title, setTitle] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>("");
  const [uploading, setUploading] = useState(false);

  const fetchStories = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/posts/stories/all`);
      if (res.ok) {
        const json = await res.json();
        setStories(json.data);
      }
    } catch (e) {
      console.error("Error fetching stories:", e);
    }
  };

  useEffect(() => {
    fetchStories();
  }, []);


  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      setFile(selected);
      setPreview(URL.createObjectURL(selected));
    }
  };

  const handleCreateStory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append("photo", file);
      if (title) formData.append("title", title);

      const res = await fetch(`${API_BASE_URL}/posts/stories`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });

      if (res.ok) {
        setIsModalOpen(false);
        setFile(null);
        setPreview("");
        setTitle("");
        fetchStories();
      }
    } catch (e) {
      console.error("Failed to create story", e);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="w-full mb-3">
      {/* Horizontal Carousel */}
      <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar scroll-smooth">
        {/* Create Story Card */}
        <div
          onClick={() => {
            if (!user) {
              alert("Please log in first to add a Story.");
              return;
            }
            setIsModalOpen(true);
          }}
          className="relative min-w-[110px] w-[110px] h-[170px] sm:min-w-[125px] sm:w-[125px] sm:h-[190px] bg-white rounded-2xl shadow-md border border-gray-200 overflow-hidden cursor-pointer group shrink-0 transition-transform hover:scale-[1.02]"
        >
          <div className="h-[65%] bg-brand-1/10 flex items-center justify-center overflow-hidden relative">
            <img
              src="/logo.png"
              alt="Avatar"
              className="w-12 h-12 object-contain group-hover:scale-110 transition-transform"
            />
          </div>
          <div className="h-[35%] bg-white flex flex-col items-center justify-end pb-2 px-1 relative">
            <div className="absolute -top-4 w-8 h-8 rounded-full bg-brand-1 text-white flex items-center justify-center text-xl font-bold border-2 border-white shadow-md">
              +
            </div>
            <span className="text-[11px] font-bold text-ink text-center line-clamp-1 mt-2">
              Create Story
            </span>
          </div>
        </div>

        {/* Existing Stories */}
        {stories.map((story) => (
          <div
            key={story.id}
            onClick={() => setSelectedStory(story)}
            className="relative min-w-[110px] w-[110px] h-[170px] sm:min-w-[125px] sm:w-[125px] sm:h-[190px] rounded-2xl shadow-md overflow-hidden cursor-pointer group shrink-0 transition-transform hover:scale-[1.02] border border-gray-200/60"
          >
            <img
              src={`${SERVER_URL}${story.imageUrl}`}
              alt={story.title || "Story"}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/70" />
            <div className="absolute top-2 left-2 w-8 h-8 rounded-full bg-brand-1/90 border-2 border-white flex items-center justify-center text-white text-xs font-black shadow-md">
              {story.authorName.charAt(0).toUpperCase()}
            </div>
            <span className="absolute bottom-2 left-2 right-2 text-xs font-bold text-white shadow-text truncate">
              {story.authorName}
            </span>
          </div>
        ))}
      </div>

      {/* Upload Story Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden border border-brand-1/20">
            <div className="bg-brand-1 px-5 py-3.5 flex items-center justify-between text-white">
              <h3 className="font-bold text-sm">Add Photo Story</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-white hover:text-gray-200">✕</button>
            </div>
            <form onSubmit={handleCreateStory} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Select Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="w-full text-xs text-gray-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-brand-1/10 file:text-brand-1 hover:file:bg-brand-1/20"
                  required
                />
              </div>

              {preview && (
                <div className="h-48 rounded-xl overflow-hidden border border-gray-200 relative">
                  <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Title / Description</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Today's merit program..."
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs focus:border-brand-1 outline-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2 bg-gray-100 text-ink text-xs font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading || !file}
                  className="flex-1 py-2 bg-brand-1 text-white text-xs font-bold rounded-xl shadow-md disabled:opacity-50"
                >
                  {uploading ? "Publishing..." : "Publish"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Story Full Screen Viewer Modal */}
      {selectedStory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-fade-in">
          <button
            onClick={() => setSelectedStory(null)}
            className="absolute top-4 right-4 text-white text-2xl font-bold bg-white/20 hover:bg-white/40 w-10 h-10 rounded-full flex items-center justify-center z-10"
          >
            ✕
          </button>
          <div className="relative w-full max-w-sm h-[80vh] rounded-2xl overflow-hidden shadow-2xl border border-white/20 flex flex-col justify-between">
            <img
              src={`${SERVER_URL}${selectedStory.imageUrl}`}
              alt="Story"
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/80" />
            <div className="relative p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-brand-1 text-white font-bold flex items-center justify-center border-2 border-white shadow-md">
                {selectedStory.authorName.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-white font-bold text-sm">{selectedStory.authorName}</p>
                <p className="text-white/70 text-[10px]">Sagaramathi Pirivena Story</p>
              </div>
            </div>
            {selectedStory.title && (
              <div className="relative p-4 text-center">
                <p className="text-white font-black text-sm bg-black/50 py-2 px-4 rounded-xl backdrop-blur-sm border border-white/20">
                  {selectedStory.title}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
