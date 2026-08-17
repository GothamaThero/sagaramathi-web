import React, { useState } from "react";
import { Link } from "react-router";
import { useAuth } from "../context/AuthContext";
import { API_BASE_URL, SERVER_URL } from "../libs/api";

export interface PostItem {
  id: number;
  content: string;
  mediaUrls: string[];
  authorName: string;
  authorAvatar?: string;
  userId: number;
  createdAt: string;
  likesCount: number;
  likeBreakdown: { like: number; sadhu: number; love: number };
  userReaction: "LIKE" | "SADHU" | "LOVE" | null;
  commentsCount: number;
  comments: {
    id: number;
    postId: number;
    userId: number;
    userName: string;
    content: string;
    createdAt: string;
  }[];
  isSaved?: boolean;
}

interface PostCardProps {
  post: PostItem;
  onPostUpdated: () => void;
}

export const PostCard: React.FC<PostCardProps> = ({ post, onPostUpdated }) => {
  const { user, token } = useAuth();
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(post.content);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(post.isSaved || false);

  const isOwner = user ? user.id === post.userId : false;
  const isAdmin = user ? user.role === "ADMIN" || user.role === "SUPER_ADMIN" : false;
  const canModify = isOwner || isAdmin;

  const formatTimeAgo = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const extractYoutubeId = (text: string): string | null => {
    if (!text) return null;
    const regExp = /(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?|shorts)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/;
    const match = text.match(regExp);
    return match ? match[1] : null;
  };

  const extractDirectVideoUrl = (text: string): string | null => {
    if (!text) return null;
    const match = text.match(/https?:\/\/[^\s]+\.(mp4|webm|ogg)($|\?[^\s]*)/i);
    return match ? match[0] : null;
  };

  const youtubeId = extractYoutubeId(post.content);
  const directVideoUrl = extractDirectVideoUrl(post.content);

  const handleReaction = async (reactionType: "LIKE" | "SADHU" | "LOVE") => {
    if (!user) {
      alert("Please log in to react to posts.");
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/posts/${post.id}/like`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ reactionType })
      });
      if (res.ok) {
        onPostUpdated();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      alert("Please log in to comment.");
      return;
    }
    if (!commentText.trim()) return;

    try {
      const res = await fetch(`${API_BASE_URL}/posts/${post.id}/comment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ content: commentText })
      });
      if (res.ok) {
        setCommentText("");
        onPostUpdated();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    if (!window.confirm("Are you sure you want to delete this comment?")) return;

    try {
      const res = await fetch(`${API_BASE_URL}/posts/comments/${commentId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        onPostUpdated();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpdatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE_URL}/posts/${post.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ content: editContent })
      });
      if (res.ok) {
        setIsEditing(false);
        onPostUpdated();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeletePost = async () => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;

    try {
      const res = await fetch(`${API_BASE_URL}/posts/${post.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        onPostUpdated();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleToggleSave = async () => {
    if (!user) {
      alert("Please log in to save posts.");
      return;
    }
    try {
      const res = await fetch(`${API_BASE_URL}/posts/${post.id}/save`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setSaved(data.isSaved);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleShare = () => {
    const shareUrl = window.location.href;
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-brand-1/10 p-4 mb-3 animate-fade-in space-y-3">
      {/* Post Author Header */}
      <div className="flex items-center justify-between">
        <Link to={`/profile/${post.userId}`} className="flex items-center gap-3 group">
          <div className="w-11 h-11 rounded-full bg-brand-1 text-white font-black flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
            {post.authorName.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-bold text-ink text-sm flex items-center gap-1.5 group-hover:text-brand-1 transition-colors">
              <span>{post.authorName}</span>
              {isAdmin && post.userId === user?.id && (
                <span className="text-[10px] bg-brand-1 text-white px-2 py-0.5 rounded-full font-bold">Admin</span>
              )}
            </p>
            <p className="text-[11px] text-gray-400 font-semibold">{formatTimeAgo(post.createdAt)} · Public</p>
          </div>
        </Link>

        {/* Edit / Delete & Bookmark Dropdown Action */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleToggleSave}
            title={saved ? "Unsave Post" : "Save Post"}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
              saved ? "text-amber-700 bg-amber-100" : "text-gray-500 hover:bg-gray-100 border border-gray-200"
            }`}
          >
            {saved ? "Saved" : "Save"}
          </button>

          {canModify && (
            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="px-2.5 py-1 text-xs font-bold text-gray-500 hover:bg-gray-100 rounded-lg"
              >
                Edit
              </button>
              <button
                onClick={handleDeletePost}
                className="px-2.5 py-1 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-lg"
              >
                Delete
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Post Edit Form or Content Text */}
      {isEditing ? (
        <form onSubmit={handleUpdatePost} className="space-y-3 pt-2">
          <textarea
            rows={3}
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            className="w-full p-3 text-sm border border-gray-300 rounded-xl outline-none focus:border-brand-1"
          />
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-4 py-1.5 bg-gray-100 text-xs font-bold rounded-xl"
            >
              Cancel
            </button>
            <button type="submit" className="px-4 py-1.5 bg-emerald-700 text-white text-xs font-bold rounded-xl">
              Save Edit
            </button>
          </div>
        </form>
      ) : (
        <div className="space-y-3">
          <p className="text-ink text-sm sm:text-base font-normal leading-relaxed whitespace-pre-line break-words">
            {post.content}
          </p>

          {/* YouTube Video Player Embed */}
          {youtubeId && (
            <div className="w-full aspect-video rounded-2xl overflow-hidden shadow-md border border-gray-200 bg-black">
              <iframe
                src={`https://www.youtube.com/embed/${youtubeId}?autoplay=0`}
                title="YouTube Video Player"
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          )}

          {/* Direct HTML5 Video Player */}
          {!youtubeId && directVideoUrl && (
            <div className="w-full rounded-2xl overflow-hidden shadow-md border border-gray-200 bg-black">
              <video src={directVideoUrl} controls className="w-full max-h-[450px]" />
            </div>
          )}
        </div>
      )}

      {/* Multi-Photo Gallery Grid */}
      {post.mediaUrls && post.mediaUrls.length > 0 && (
        <div
          className={`grid gap-2 rounded-2xl overflow-hidden border border-gray-200 ${
            post.mediaUrls.length === 1
              ? "grid-cols-1"
              : post.mediaUrls.length === 2
              ? "grid-cols-2"
              : "grid-cols-2 sm:grid-cols-3"
          }`}
        >
          {post.mediaUrls.map((url, idx) => (
            <div
              key={idx}
              onClick={() => setSelectedImage(`${SERVER_URL}${url}`)}
              className="relative max-h-96 overflow-hidden cursor-pointer group"
            >
              <img
                src={`${SERVER_URL}${url}`}
                alt="Post Media"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
          ))}
        </div>
      )}

      {/* Reaction Counts Display */}
      <div className="flex items-center justify-between text-xs text-gray-500 font-semibold pt-2 border-t border-gray-100">
        <div className="flex items-center gap-2">
          <span>{post.likesCount} Reactions</span>
        </div>
        <div className="flex gap-4">
          <span>{post.commentsCount} Comments</span>
        </div>
      </div>

      {/* Interactive Reactions & Action Bar */}
      <div className="grid grid-cols-4 gap-1 pt-2 border-t border-gray-100 text-xs font-bold text-gray-600">
        {/* Sadhu Reaction */}
        <button
          onClick={() => handleReaction("SADHU")}
          className={`flex items-center justify-center gap-1.5 py-2 rounded-xl transition-all ${
            post.userReaction === "SADHU"
              ? "bg-amber-100 text-amber-800 shadow-sm"
              : "hover:bg-gray-100"
          }`}
        >
          Sadhu!
        </button>

        {/* Like Reaction */}
        <button
          onClick={() => handleReaction("LIKE")}
          className={`flex items-center justify-center gap-1.5 py-2 rounded-xl transition-all ${
            post.userReaction === "LIKE"
              ? "bg-blue-100 text-blue-700 shadow-sm"
              : "hover:bg-gray-100"
          }`}
        >
          Like
        </button>

        {/* Comment Button */}
        <button
          onClick={() => setShowComments(!showComments)}
          className="flex items-center justify-center gap-1.5 py-2 hover:bg-gray-100 rounded-xl transition-colors"
        >
          Comment
        </button>

        {/* Share Button */}
        <button
          onClick={handleShare}
          className="flex items-center justify-center gap-1.5 py-2 hover:bg-gray-100 rounded-xl transition-colors"
        >
          {copied ? "Copied!" : "Share"}
        </button>
      </div>

      {/* Comments Drawer */}
      {showComments && (
        <div className="pt-3 border-t border-gray-100 space-y-3">
          {/* Write Comment Form */}
          <form onSubmit={handleAddComment} className="flex gap-2">
            <input
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Write a comment..."
              className="flex-1 px-4 py-2 bg-gray-100 rounded-full text-xs focus:bg-white border border-transparent focus:border-brand-1 outline-none"
            />
            <button
              type="submit"
              disabled={!commentText.trim()}
              className="px-4 py-2 bg-brand-1 text-white text-xs font-bold rounded-full shadow-sm disabled:opacity-40"
            >
              Comment
            </button>
          </form>

          {/* Comments List */}
          <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
            {post.comments.map((c) => (
              <div key={c.id} className="flex items-start justify-between bg-gray-50 p-3 rounded-2xl">
                <div>
                  <p className="text-xs font-bold text-ink">{c.userName}</p>
                  <p className="text-xs text-ink/90 mt-0.5">{c.content}</p>
                  <span className="text-[10px] text-gray-400 font-medium">{formatTimeAgo(c.createdAt)}</span>
                </div>
                {(user?.id === c.userId || isAdmin) && (
                  <button
                    onClick={() => handleDeleteComment(c.id)}
                    className="text-[11px] text-rose-500 hover:text-rose-700 font-bold ml-2"
                  >
                    Delete
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Lightbox Image Modal */}
      {selectedImage && (
        <div
          onClick={() => setSelectedImage(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 cursor-pointer animate-fade-in"
        >
          <img src={selectedImage} alt="Full view" className="max-w-full max-h-[90vh] object-contain rounded-2xl shadow-2xl" />
        </div>
      )}
    </div>
  );
};
