import React, { useState, useEffect } from "react";
import { PostCard, Post } from "./PostCard.tsx";
import { Search, Loader2, Filter, Store, ShoppingBag } from "lucide-react";
import { motion } from "motion/react";

interface FeedViewProps {
  onNavigateToPost: (username: string, slug: string) => void;
  onNavigate: (path: string) => void;
}

export function FeedView({ onNavigateToPost, onNavigate }: FeedViewProps) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [usersMap, setUsersMap] = useState<Record<string, { username: string; display_name: string }>>({});
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchFeed = async (query = "") => {
    setLoading(true);
    try {
      // Fetch posts
      const endpoint = query 
        ? `/api/search?q=${encodeURIComponent(query)}`
        : `/api/posts`;
      const res = await fetch(endpoint);
      const data = await res.json();
      
      if (Array.isArray(data)) {
        setPosts(data);
        
        // Let's resolve the user details for these posts
        // Fetch context to get simulated user details, or seed details
        const contextRes = await fetch("/api/context");
        const context = await contextRes.json();
        
        // Since we have a seed user "techcurator" and other registered users,
        // let's create a map of userId to username for correct card branding.
        const map: Record<string, { username: string; display_name: string }> = {
          "d3b07384-d113-4ec4-a14f-83679c53641b": {
            username: "techcurator",
            display_name: "Tech Curator"
          }
        };

        if (context.currentUser) {
          map[context.currentUser.id] = {
            username: context.currentUser.username,
            display_name: context.currentUser.display_name
          };
        }

        // Fetch other users as needed or default to placeholder
        setUsersMap(map);
      }
    } catch (err) {
      console.error("Error fetching feed:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeed();
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearch(val);
    fetchFeed(val);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 md:px-8 py-6">
      {/* Search Header Banner */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 md:p-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <h2 className="text-2xl md:text-3xl font-black tracking-tight text-[#1A1A1A]">
            DISCOVER <span className="text-[#CC0000]">CURATED GEAR</span>
          </h2>
          <p className="text-xs md:text-sm text-gray-500 font-medium font-sans">
            Explore authentic product reviews with direct shop and affiliate links by top curators.
          </p>
        </div>

        {/* Big Search Input */}
        <div className="relative flex-1 max-w-md w-full">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-gray-400">
            <Search size={18} />
          </div>
          <input
            type="text"
            placeholder="Search titles, products, tags..."
            value={search}
            onChange={handleSearchChange}
            className="w-full pl-11 pr-4 py-3 bg-gray-50 hover:bg-gray-100 focus:bg-white border-2 border-gray-200/80 focus:border-[#CC0000] rounded-xl text-sm font-bold text-[#1A1A1A] transition focus:outline-none placeholder-gray-400 shadow-sm"
          />
        </div>
      </div>

      {/* Main Feed Content */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 className="animate-spin text-[#CC0000]" size={36} />
          <span className="text-xs font-mono font-bold text-gray-500 uppercase tracking-widest">
            Loading products...
          </span>
        </div>
      ) : posts.length === 0 ? (
        <div className="bg-white border border-dashed border-gray-200 rounded-2xl text-center p-12 max-w-md mx-auto space-y-4 shadow-sm">
          <div className="bg-red-50 text-[#CC0000] p-4 rounded-full w-fit mx-auto">
            <ShoppingBag size={24} />
          </div>
          <div className="space-y-1">
            <h3 className="font-black text-[#1A1A1A] text-lg">No products yet</h3>
            <p className="text-xs text-gray-500 font-medium font-sans">
              We couldn't find any products matching your search. Try adding a new curation or exploring general tags.
            </p>
          </div>
          <button
            onClick={() => onNavigate("/create-post")}
            className="px-5 py-2.5 bg-[#1A1A1A] hover:bg-gray-800 text-white text-xs font-bold rounded-xl transition"
          >
            Create first post
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          {posts.map((post: any) => {
            const postUsername = post.username || "techcurator";
            return (
              <PostCard
                key={post.id}
                post={post}
                username={postUsername}
                onNavigateToPost={(slug) => onNavigateToPost(postUsername, slug)}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
export default FeedView;
