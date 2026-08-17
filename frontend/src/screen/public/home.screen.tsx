import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { CreatePostBar } from "../../component/CreatePostBar";
import { PostCard, type PostItem } from "../../component/PostCard";
import { API_BASE_URL } from "../../libs/api";

const HomeScreen: React.FC = () => {
  const { token } = useAuth();
  const [posts, setPosts] = useState<PostItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchPosts();
  }, [token]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const headers: any = {};
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch(`${API_BASE_URL}/posts`, { headers });
      if (res.ok) {
        const json = await res.json();
        setPosts(json.data);
      }
    } catch (e) {
      console.error("Error fetching newsfeed posts:", e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100/70 pb-10">
      {/* Main Feed Container */}
      <div className="max-w-3xl mx-auto px-4 pt-4">
        {/* 1. Create Post Input Bar */}
        <CreatePostBar onPostCreated={fetchPosts} />

        {/* 3. Newsfeed Posts List */}
        {loading ? (
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200 text-center text-gray-500 font-semibold text-sm">
            Loading Feed...
          </div>
        ) : posts.length === 0 ? (
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200 text-center space-y-2">
            <h3 className="font-bold text-ink text-sm">No posts published yet</h3>
            <p className="text-xs text-subtle max-w-md mx-auto">
              Use the "What's on your mind?" bar above to create the first post with photos or videos!
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} onPostUpdated={fetchPosts} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HomeScreen;
