import React, { useEffect, useState, useRef } from "react";
import { useAuth } from "../../context/AuthContext";
import { CreatePostBar } from "../../component/CreatePostBar";
import { PostCard, type PostItem } from "../../component/PostCard";
import { API_BASE_URL } from "../../libs/api";

const HomeScreen: React.FC = () => {
  const { token } = useAuth();
  const [posts, setPosts] = useState<PostItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [page, setPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const observerTarget = useRef<HTMLDivElement | null>(null);

  const fetchPosts = async (pageNum: number, isReset: boolean = false) => {
    try {
      if (isReset) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      const headers: any = {};
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch(`${API_BASE_URL}/posts?page=${pageNum}&limit=5`, { headers });
      if (res.ok) {
        const json = await res.json();
        const newPosts: PostItem[] = json.data || [];
        const pagination = json.pagination;

        if (isReset) {
          setPosts(newPosts);
          setPage(1);
        } else {
          setPosts((prev) => {
            const existingIds = new Set(prev.map((p) => p.id));
            const uniqueNew = newPosts.filter((p) => !existingIds.has(p.id));
            return [...prev, ...uniqueNew];
          });
          setPage(pageNum);
        }

        if (pagination) {
          setHasMore(pagination.hasMore);
        } else {
          setHasMore(newPosts.length === 5);
        }
      }
    } catch (e) {
      console.error("Error fetching newsfeed posts:", e);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchPosts(1, true);
  }, [token]);

  // Refresh current loaded batch without resetting scroll position
  const refreshFeed = async () => {
    try {
      const headers: any = {};
      if (token) headers["Authorization"] = `Bearer ${token}`;
      const currentLimit = Math.max(5, posts.length);
      const res = await fetch(`${API_BASE_URL}/posts?page=1&limit=${currentLimit}`, { headers });
      if (res.ok) {
        const json = await res.json();
        setPosts(json.data || []);
        if (json.pagination) {
          setHasMore(json.pagination.hasMore);
        }
      }
    } catch (e) {
      console.error("Error refreshing feed:", e);
    }
  };

  // Auto Load Infinite Scroll Observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading && !loadingMore) {
          fetchPosts(page + 1, false);
        }
      },
      { threshold: 0.1 }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [hasMore, loading, loadingMore, page, token]);

  return (
    <div className="min-h-screen bg-gray-100/70 pb-10">
      {/* Main Feed Container */}
      <div className="max-w-3xl mx-auto px-4 pt-4">
        {/* 1. Create Post Input Bar */}
        <CreatePostBar onPostCreated={() => fetchPosts(1, true)} />

        {/* 2. Newsfeed Posts List */}
        {loading ? (
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200 text-center text-gray-500 font-semibold text-sm">
            Loading Newsfeed posts...
          </div>
        ) : posts.length === 0 ? (
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200 text-center space-y-2">
            <h3 className="font-bold text-ink text-sm">No posts published yet</h3>
            <p className="text-xs text-subtle max-w-md mx-auto">
              Use the "What's on your mind?" box above to create the first post with photos or videos!
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} onPostUpdated={refreshFeed} />
            ))}
          </div>
        )}

        {/* 3. Auto Load Sentinel & Indicator */}
        {!loading && posts.length > 0 && (
          <div ref={observerTarget} className="py-6 text-center">
            {loadingMore ? (
              <div className="flex items-center justify-center gap-2 text-xs font-bold text-brand-1 bg-white py-3 px-6 rounded-2xl shadow-sm border border-brand-1/10 max-w-xs mx-auto animate-pulse">
                <svg className="animate-spin h-4 w-4 text-brand-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Loading more posts...
              </div>
            ) : hasMore ? (
              <div className="text-xs text-gray-400 font-medium">
                Scroll down for more posts...
              </div>
            ) : (
              <div className="text-xs font-semibold text-gray-400 bg-gray-50 py-2.5 px-5 rounded-full inline-block border border-gray-200/60">
                You've reached the end of the feed ✓
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default HomeScreen;
