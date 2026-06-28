import React, { useState, useEffect } from "react";
import { StarRating } from "./StarRating.tsx";
import { ArrowLeft, ShoppingBag, Loader2, AlertCircle, Share2, Globe, Heart } from "lucide-react";
import { motion } from "motion/react";

interface PostViewProps {
  subdomain: string;
  slug: string;
  onNavigateBack: () => void;
}

export function PostView({ subdomain, slug, onNavigateBack }: PostViewProps) {
  const [post, setPost] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    const fetchPost = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/posts?username=${subdomain}`);
        const data = await res.json();
        if (Array.isArray(data)) {
          const matched = data.find((p) => p.slug.toLowerCase() === slug.toLowerCase());
          setPost(matched || null);
        }
      } catch (err) {
        console.error("Error fetching single post details:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, [subdomain, slug]);

  const copyPageLink = () => {
    const pageUrl = window.location.href;
    navigator.clipboard.writeText(pageUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-3 max-w-7xl mx-auto">
        <Loader2 className="animate-spin text-[#CC0000]" size={40} />
        <span className="text-xs font-mono font-bold text-gray-500 uppercase tracking-wider">
          Fetching review details...
        </span>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <div className="bg-red-50 text-[#CC0000] p-4 rounded-full w-fit mx-auto">
          <AlertCircle size={32} />
        </div>
        <div>
          <h3 className="text-xl font-black text-[#1A1A1A] uppercase">Product Review Not Found</h3>
          <p className="text-xs text-gray-500 font-medium font-sans mt-1 leading-relaxed">
            The curated post with slug <code className="font-mono bg-gray-100 px-1 py-0.5 rounded">"{slug}"</code> was not found under @{subdomain}'s profile.
          </p>
        </div>
        <button
          onClick={onNavigateBack}
          className="flex items-center gap-1.5 px-5 py-2.5 bg-[#1A1A1A] hover:bg-gray-800 text-white text-xs font-bold rounded-xl transition mx-auto"
        >
          <ArrowLeft size={14} />
          <span>Back to Store</span>
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-8 py-6 space-y-6">
      {/* Back Link */}
      <button
        onClick={onNavigateBack}
        className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#1A1A1A] hover:text-[#CC0000] transition group active:scale-95 bg-white px-4 py-2 rounded-xl border border-gray-100 shadow-sm"
      >
        <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
        <span>Back to @{subdomain}'s Store</span>
      </button>

      {/* Main Single Product Layout */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden grid grid-cols-1 md:grid-cols-2 gap-8 p-6 md:p-8">
        {/* Left Column: Image Area */}
        <div className="space-y-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative rounded-2xl overflow-hidden shadow-md border border-gray-100 bg-gray-50 h-[300px] sm:h-[400px] md:h-[480px]"
          >
            <img
              src={post.image_url}
              alt={post.title}
              className="w-full h-full object-cover"
            />
            
            {/* Quick badges */}
            <div className="absolute top-4 left-4 flex gap-2">
              <span className="bg-red-600 text-white font-mono font-bold text-[10px] uppercase tracking-widest px-3 py-1 rounded-full shadow-md">
                @{subdomain}
              </span>
              <span className="bg-[#1A1A1A] text-white font-mono font-bold text-[10px] uppercase tracking-widest px-3 py-1 rounded-full shadow-md flex items-center gap-1">
                <Globe size={10} />
                trodex verified
              </span>
            </div>
          </motion.div>

          <div className="flex justify-between items-center px-2">
            <button
              onClick={() => setLiked(!liked)}
              className={`flex items-center gap-1.5 text-xs font-bold transition px-3.5 py-2 rounded-xl border ${
                liked 
                  ? "bg-red-50 border-red-200 text-[#CC0000]" 
                  : "bg-white hover:bg-gray-50 text-gray-500 border-gray-100"
              }`}
            >
              <Heart size={14} className={liked ? "fill-[#CC0000] stroke-[#CC0000]" : ""} />
              <span>{liked ? "Saved to Favorites" : "Save to Favorites"}</span>
            </button>

            <button
              onClick={copyPageLink}
              className={`flex items-center gap-1.5 text-xs font-bold transition px-3.5 py-2 rounded-xl border ${
                copiedLink 
                  ? "bg-green-50 border-green-200 text-green-600" 
                  : "bg-white hover:bg-gray-50 text-gray-500 border-gray-100"
              }`}
            >
              <Share2 size={14} />
              <span>{copiedLink ? "Link Copied!" : "Copy Page Link"}</span>
            </button>
          </div>
        </div>

        {/* Right Column: Review details */}
        <div className="flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            {/* Star Rating Area */}
            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 flex flex-wrap items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-gray-400">Aggregate Rating</span>
                <StarRating rating={post.rating} count={post.review_count} />
              </div>
              <div className="text-right">
                <span className="block text-xs font-mono font-bold text-[#1A1A1A]">★★★★★ {post.rating.toFixed(1)}</span>
                <span className="text-[10px] text-gray-400 font-sans">{post.review_count.toLocaleString()} rating logs</span>
              </div>
            </div>

            {/* Title */}
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-[#1A1A1A] tracking-tight leading-tight uppercase">
              {post.title}
            </h1>

            {/* Meta description */}
            <p className="text-sm font-semibold text-red-700 font-sans italic bg-red-50/50 p-3 rounded-xl border border-red-100/50">
              "{post.meta_description}"
            </p>

            <div className="space-y-2 pt-2">
              <span className="text-xs font-mono font-black uppercase tracking-wider text-gray-400 block">
                Curation Review Summary
              </span>
              <p className="text-sm sm:text-base text-gray-700 leading-relaxed font-medium font-sans whitespace-pre-line">
                {post.about}
              </p>
            </div>
          </div>

          {/* Call to Action Footer Area */}
          <div className="pt-6 border-t border-gray-100 space-y-3">
            <a
              href={post.shop_url}
              target="_blank"
              referrerPolicy="no-referrer"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 py-4 bg-[#CC0000] hover:bg-[#E60000] text-white font-black text-sm uppercase tracking-wider rounded-xl transition shadow-xl shadow-red-900/10 active:scale-[0.98]"
            >
              <ShoppingBag size={18} className="stroke-[2.5]" />
              <span>Shop Now on Store</span>
            </a>
            <span className="block text-center text-[10px] font-mono text-gray-400">
              * Affiliate link may earn commission for @{subdomain}. Direct verification verified by Trodex.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
export default PostView;
