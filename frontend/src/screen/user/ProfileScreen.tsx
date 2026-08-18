import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router";
import { useAuth } from "../../context/AuthContext";
import { PostCard, type PostItem } from "../../component/PostCard";
import { API_BASE_URL } from "../../libs/api";

interface UserProfileData {
  id: number;
  name: string;
  email: string;
  phone?: string;
  whatsapp?: string;
  address?: string;
  city?: string;
  designation?: string;
  bio?: string;
  avatar?: string;
  coverImage?: string;
  role: string;
  createdAt: string;
  posts?: PostItem[];
}

export const ProfileScreen: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const { user: currentUser, token } = useAuth();
  
  const [profileUser, setProfileUser] = useState<UserProfileData | null>(null);
  const [userPosts, setUserPosts] = useState<PostItem[]>([]);
  const [savedPosts, setSavedPosts] = useState<PostItem[]>([]);
  const [activeTab, setActiveTab] = useState<"about" | "posts" | "saved" | "edit">("about");
  const [loading, setLoading] = useState(true);

  // Edit form state
  const [editForm, setEditForm] = useState({
    name: "",
    designation: "",
    city: "",
    bio: "",
    phone: "",
    whatsapp: "",
    address: ""
  });
  const [passwords, setPasswords] = useState({ currentPassword: "", newPassword: "" });
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);
  const [updating, setUpdating] = useState(false);

  const isOwnProfile = !id || (currentUser && parseInt(id, 10) === currentUser.id);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      if (isOwnProfile) {
        // Fetch logged in user's profile
        const res = await fetch(`${API_BASE_URL}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const json = await res.json();
          setProfileUser(json.data);
          setEditForm({
            name: json.data.name || "",
            designation: json.data.designation || "",
            city: json.data.city || "",
            bio: json.data.bio || "",
            phone: json.data.phone || "",
            whatsapp: json.data.whatsapp || "",
            address: json.data.address || ""
          });
        }
      } else {
        // Fetch public profile by ID
        const res = await fetch(`${API_BASE_URL}/auth/user/${id}`);
        if (res.ok) {
          const json = await res.json();
          setProfileUser(json.data);
        }
      }

      // Fetch all posts to filter user's posts & saved posts
      const postsRes = await fetch(`${API_BASE_URL}/posts?limit=all`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      if (postsRes.ok) {
        const json = await postsRes.json();
        const targetId = isOwnProfile ? currentUser?.id : parseInt(id || "0", 10);
        const filteredUserPosts = json.data.filter((p: PostItem) => p.userId === targetId);
        setUserPosts(filteredUserPosts);

        if (isOwnProfile) {
          const filteredSavedPosts = json.data.filter((p: PostItem) => p.isSaved);
          setSavedPosts(filteredSavedPosts);
        }
      }
    } catch (e) {
      console.error("Failed to load profile", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfileData();
  }, [id, token]);


  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setUpdating(true);
      setMessage(null);

      const payload: any = { ...editForm };
      if (passwords.newPassword) {
        payload.currentPassword = passwords.currentPassword;
        payload.newPassword = passwords.newPassword;
      }

      const res = await fetch(`${API_BASE_URL}/auth/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (res.ok) {
        setMessage({ text: "Profile updated successfully!", type: "success" });
        setPasswords({ currentPassword: "", newPassword: "" });
        fetchProfileData();
      } else {
        setMessage({ text: data.message || "Failed to update profile", type: "error" });
      }
    } catch (e) {
      setMessage({ text: "Server connection failed", type: "error" });
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center text-gray-500 font-semibold">
        Loading Profile...
      </div>
    );
  }

  if (!profileUser) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center space-y-4">
        <h2 className="text-2xl font-bold text-gray-700">User Profile Not Found</h2>
        <Link to="/" className="inline-block px-6 py-2 bg-brand-1 text-white font-bold rounded-xl">
          Go to Home Page
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 pb-20 space-y-6 animate-fade-in">
      {/* Profile Header Card */}
      <div className="bg-white rounded-3xl shadow-sm border border-brand-1/10 overflow-hidden relative">
        {/* Cover Photo Banner */}
        <div className="h-44 sm:h-56 bg-gradient-to-r from-brand-1 via-brand-2 to-amber-700 relative">
          <div className="absolute inset-0 bg-black/10" />
        </div>

        {/* User Info Bar */}
        <div className="px-6 pb-6 pt-0 relative flex flex-col sm:flex-row items-center sm:items-end justify-between gap-4 -mt-16 sm:-mt-20">
          <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
            {/* Avatar */}
            <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-full bg-brand-1 text-white font-black text-4xl sm:text-5xl flex items-center justify-center border-4 border-white shadow-xl shrink-0">
              {profileUser.name.charAt(0).toUpperCase()}
            </div>

            {/* Name & Details */}
            <div className="space-y-1 sm:mb-2">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <h1 className="text-2xl sm:text-3xl font-black text-ink">{profileUser.name}</h1>
                <span className="text-xs px-3 py-1 bg-brand-1/10 text-brand-1 font-bold rounded-full uppercase">
                  {profileUser.role}
                </span>
              </div>
              {profileUser.designation && (
                <p className="text-sm font-semibold text-brand-1">{profileUser.designation}</p>
              )}
              {profileUser.city && (
                <p className="text-xs text-gray-500 font-medium">{profileUser.city}</p>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 sm:mb-2 w-full sm:w-auto">
            {isOwnProfile ? (
              <button
                onClick={() => setActiveTab("edit")}
                className="flex-1 sm:flex-none px-5 py-2.5 bg-brand-1 hover:bg-brand-2 text-white font-bold text-xs rounded-xl shadow-md transition-colors"
              >
                Edit Profile
              </button>
            ) : (
              profileUser.whatsapp && (
                <a
                  href={`https://wa.me/${profileUser.whatsapp.replace(/\D/g, "")}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 sm:flex-none px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-colors text-center"
                >
                  Contact via WhatsApp
                </a>
              )
            )}
          </div>
        </div>

        {/* Profile Tabs Navigation */}
        <div className="flex border-t border-gray-100 px-6 font-bold text-xs sm:text-sm text-gray-500 overflow-x-auto">
          <button
            onClick={() => setActiveTab("about")}
            className={`py-3.5 px-4 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === "about" ? "border-brand-1 text-brand-1 font-bold" : "border-transparent hover:text-ink"
            }`}
          >
            About Profile
          </button>
          <button
            onClick={() => setActiveTab("posts")}
            className={`py-3.5 px-4 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === "posts" || activeTab === "saved" ? "border-brand-1 text-brand-1 font-bold" : "border-transparent hover:text-ink"
            }`}
          >
            Posts ({userPosts.length}) {isOwnProfile && `& Saved Posts (${savedPosts.length})`}
          </button>
          {isOwnProfile && (
            <button
              onClick={() => setActiveTab("edit")}
              className={`py-3.5 px-4 border-b-2 transition-colors whitespace-nowrap ${
                activeTab === "edit" ? "border-brand-1 text-brand-1 font-bold" : "border-transparent hover:text-ink"
              }`}
            >
              Profile Settings
            </button>
          )}
        </div>
      </div>

      {/* Tab Content 1: About Details */}
      {activeTab === "about" && (
        <div className="bg-white rounded-3xl shadow-sm border border-brand-1/10 p-6 space-y-6">
          <h3 className="font-bold text-base text-ink flex items-center gap-2 border-b border-gray-100 pb-3">
            Personal Details
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 space-y-1">
              <span className="text-gray-400 font-bold text-[10px] uppercase">Full Name</span>
              <p className="font-bold text-ink">{profileUser.name}</p>
            </div>

            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 space-y-1">
              <span className="text-gray-400 font-bold text-[10px] uppercase">Email Address</span>
              <p className="font-bold text-ink">{profileUser.email}</p>
            </div>

            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 space-y-1">
              <span className="text-gray-400 font-bold text-[10px] uppercase">Designation / Role</span>
              <p className="font-bold text-ink">{profileUser.designation || "Member"}</p>
            </div>

            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 space-y-1">
              <span className="text-gray-400 font-bold text-[10px] uppercase">City</span>
              <p className="font-bold text-ink">{profileUser.city || "Not Specified"}</p>
            </div>

            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 space-y-1">
              <span className="text-gray-400 font-bold text-[10px] uppercase">Phone Number</span>
              <p className="font-bold text-ink">{profileUser.phone || "Not Specified"}</p>
            </div>

            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 space-y-1">
              <span className="text-gray-400 font-bold text-[10px] uppercase">WhatsApp Number</span>
              <p className="font-bold text-ink">{profileUser.whatsapp || "Not Specified"}</p>
            </div>
          </div>

          {profileUser.bio && (
            <div className="p-4 bg-amber-50/50 rounded-2xl border border-amber-200/60 space-y-1">
              <span className="text-amber-800 font-bold text-[10px] uppercase">Bio</span>
              <p className="text-ink text-xs sm:text-sm whitespace-pre-line leading-relaxed">{profileUser.bio}</p>
            </div>
          )}

          {profileUser.address && (
            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 space-y-1">
              <span className="text-gray-400 font-bold text-[10px] uppercase">Address</span>
              <p className="font-bold text-ink">{profileUser.address}</p>
            </div>
          )}
        </div>
      )}

      {/* Combined Tab Content: User Posts & Saved Posts */}
      {(activeTab === "posts" || activeTab === "saved") && (
        <div className="space-y-8">
          {/* Section 1: User's Published Posts */}
          <div className="space-y-4">
            <h3 className="text-base font-bold text-ink flex items-center gap-2 px-1 border-l-4 border-brand-1 pl-3">
              Published Posts ({userPosts.length})
            </h3>
            {userPosts.length === 0 ? (
              <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-200 text-center text-gray-500 font-semibold text-xs">
                No posts published by this user yet.
              </div>
            ) : (
              userPosts.map((post) => (
                <PostCard key={post.id} post={post} onPostUpdated={fetchProfileData} />
              ))
            )}
          </div>

          {/* Section 2: Saved Posts (Own profile only) */}
          {isOwnProfile && (
            <div className="space-y-4 pt-4 border-t border-brand-1/10">
              <h3 className="text-base font-bold text-ink flex items-center gap-2 px-1 border-l-4 border-brand-2 pl-3">
                Saved Posts ({savedPosts.length})
              </h3>
              {savedPosts.length === 0 ? (
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-200 text-center text-gray-500 font-semibold text-xs">
                  No saved posts.
                </div>
              ) : (
                savedPosts.map((post) => (
                  <PostCard key={post.id} post={post} onPostUpdated={fetchProfileData} />
                ))
              )}
            </div>
          )}
        </div>
      )}

      {/* Tab Content 4: Edit Profile Form */}
      {activeTab === "edit" && isOwnProfile && (
        <div className="bg-white rounded-3xl shadow-sm border border-brand-1/10 p-6 space-y-6">
          <h3 className="font-bold text-base text-ink flex items-center gap-2 border-b border-gray-100 pb-3">
            Edit Profile Settings
          </h3>

          {message && (
            <div
              className={`p-4 rounded-2xl text-xs font-bold ${
                message.type === "success" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-rose-50 text-rose-700 border border-rose-200"
              }`}
            >
              {message.text}
            </div>
          )}

          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs focus:border-brand-1 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Designation / Role</label>
                <input
                  type="text"
                  value={editForm.designation}
                  placeholder="e.g. Dayaka Sabha Member..."
                  onChange={(e) => setEditForm({ ...editForm, designation: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs focus:border-brand-1 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">City</label>
                <input
                  type="text"
                  value={editForm.city}
                  placeholder="e.g. Kandy..."
                  onChange={(e) => setEditForm({ ...editForm, city: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs focus:border-brand-1 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Phone Number</label>
                <input
                  type="text"
                  value={editForm.phone}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs focus:border-brand-1 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">WhatsApp Number</label>
                <input
                  type="text"
                  value={editForm.whatsapp}
                  onChange={(e) => setEditForm({ ...editForm, whatsapp: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs focus:border-brand-1 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Address</label>
                <input
                  type="text"
                  value={editForm.address}
                  onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs focus:border-brand-1 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Bio</label>
              <textarea
                rows={3}
                value={editForm.bio}
                placeholder="Write a short description about yourself..."
                onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                className="w-full p-3 rounded-xl border border-gray-200 text-xs focus:border-brand-1 outline-none resize-none"
              />
            </div>

            <div className="border-t border-gray-100 pt-4 space-y-4">
              <h4 className="font-bold text-xs text-ink uppercase tracking-wider">Change Password</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Current Password</label>
                  <input
                    type="password"
                    value={passwords.currentPassword}
                    onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs focus:border-brand-1 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">New Password</label>
                  <input
                    type="password"
                    value={passwords.newPassword}
                    onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs focus:border-brand-1 outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={updating}
                className="px-8 py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-md disabled:opacity-50"
              >
                {updating ? "Updating..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default ProfileScreen;
