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
        const contextRes = await fetch("/api/context");
        const context = await contextRes.json();
        
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
    <div className="space-y-6 max-w-4xl mx-auto px-4 py-6">
      {/* Search Header Banner (Material 3 Style) */}
      <div className="bg-[#FFF8F7] rounded-[28px] border border-[#857371]/10 p-6 md:p-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-md">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-[#1A1A1A]">
            DISCOVER <span className="text-[#CC0000]">CURATED GEAR</span>
          </h2>
          <p className="text-xs md:text-sm text-[#534341] font-normal leading-relaxed">
            Explore authentic product reviews with direct shop and affiliate links by top curators.
          </p>
        </div>

        {/* Big Search Input (Material 3 Search Bar) */}
        <div className="relative flex-1 max-w-md w-full">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-[#534341]">
            <Search size={18} />
          </div>
          <input
            id="search-input"
            type="text"
            placeholder="Search titles, products, tags..."
            value={search}
            onChange={handleSearchChange}
            className="w-full h-14 pl-12 pr-4 bg-[#F5DDDB] hover:bg-[#F5DDDB]/90 focus:bg-[#FFF8F7] border border-[#857371]/30 focus:border-[#CC0000] rounded-full text-sm font-medium text-[#1A1A1A] transition focus:outline-none placeholder-[#534341] shadow-sm"
          />
        </div>
      </div>

      {/* Main Feed Content */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 className="animate-spin text-[#CC0000]" size={36} />
          <span className="text-xs font-mono font-bold text-[#534341] uppercase tracking-widest">
            Loading products...
          </span>
        </div>
      ) : posts.length === 0 ? (
        <div className="bg-[#FFF8F7] border border-dashed border-[#857371]/30 rounded-[28px] text-center p-12 max-w-md mx-auto space-y-4 shadow-sm">
          <div className="bg-[#FFDAD6] text-[#410002] p-4 rounded-full w-fit mx-auto">
            <ShoppingBag size={24} />
          </div>
          <div className="space-y-1">
            <h3 className="font-bold text-[#1A1A1A] text-lg">No products yet</h3>
            <p className="text-xs text-[#534341] font-normal">
              We couldn't find any products matching your search. Try adding a new curation or exploring general tags.
            </p>
          </div>
          <button
            onClick={() => onNavigate("/create-post")}
            className="h-10 px-6 rounded-full bg-[#CC0000] hover:bg-[#CC0000]/92 active:bg-[#CC0000]/88 text-[#FFFFFF] text-xs font-semibold transition shadow"
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
