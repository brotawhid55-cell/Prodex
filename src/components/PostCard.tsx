import React, { useState } from "react";
import { StarRating } from "./StarRating.tsx";
import { motion, AnimatePresence } from "motion/react";
import { ExternalLink, Info, ShoppingBag } from "lucide-react";

export interface Post {
  id: string;
  user_id: string;
  title: string;
  meta_description: string;
  image_url: string;
  about: string;
  rating: number;
  review_count: number;
  shop_url: string;
  slug: string;
  created_at: string;
}

interface PostCardProps {
  post: Post;
  username: string;
  onNavigateToPost?: (slug: string) => void;
  key?: React.Key;
}

export function PostCard({ post, username, onNavigateToPost }: PostCardProps) {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <motion.div
        layout
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -15 }}
        whileHover={{ y: -4, transition: { duration: 0.15 } }}
        className="relative group overflow-hidden bg-white rounded-2xl shadow-sm border border-gray-100 border-l-[3px] border-l-[#CC0000] flex flex-col justify-between h-[360px] md:h-[400px]"
        style={{
          backgroundImage: `url(${post.image_url})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {/* Dark gradient overlay for extreme legibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/10 group-hover:from-black/95 transition-colors duration-200" />

        {/* Content Container (absolutely positioned over bg) */}
        <div className="relative z-10 p-4 md:p-5 flex flex-col justify-between h-full w-full text-white">
          {/* Top Info Overlay */}
          <div className="flex justify-between items-center w-full bg-black/40 backdrop-blur-xs px-3 py-2 rounded-xl border border-white/10 shadow-sm">
            <span className="text-[10px] md:text-xs font-mono font-bold tracking-wider uppercase bg-[#CC0000] text-white px-2.5 py-0.5 rounded-full shadow-sm">
              @{username}
            </span>
            <div className="flex items-center gap-1 font-mono text-xs font-bold text-white">
              <span className="text-yellow-400 text-base">★</span>
              <span className="text-white font-bold text-xs">{post.rating.toFixed(1)}</span>
              <span className="text-gray-300 font-normal text-[10px]">({post.review_count.toLocaleString()} reviews)</span>
            </div>
          </div>

          {/* Bottom Info & Buttons */}
          <div className="space-y-3 mt-auto">
            <h3 
              onClick={() => onNavigateToPost?.(post.slug)}
              className="text-lg md:text-xl font-black tracking-tight leading-tight cursor-pointer hover:text-red-400 line-clamp-2 transition-colors"
            >
              {post.title}
            </h3>
            
            <p className="text-xs text-gray-300 font-medium line-clamp-2 font-sans">
              {post.meta_description}
            </p>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowModal(true);
                }}
                className="flex items-center justify-center gap-1.5 px-3 py-2.5 bg-[#1A1A1A] hover:bg-[#2A2A2A] text-white font-bold text-xs rounded-xl transition shadow"
              >
                <Info size={14} />
                <span>About</span>
              </button>
              
              <a
                href={post.shop_url}
                target="_blank"
                referrerPolicy="no-referrer"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="flex items-center justify-center gap-1.5 px-3 py-2.5 bg-[#CC0000] hover:bg-[#E60000] text-white font-bold text-xs rounded-xl transition shadow"
              >
                <ShoppingBag size={14} />
                <span>Shop Now</span>
              </a>
            </div>
          </div>
        </div>
      </motion.div>

      {/* About Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-gray-100 flex flex-col"
            >
              {/* Modal Banner Image */}
              <div 
                className="h-48 w-full relative"
                style={{
                  backgroundImage: `url(${post.image_url})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <span className="text-[10px] font-mono font-bold tracking-widest uppercase bg-red-600 px-2 py-0.5 rounded-full">
                    Review by @{username}
                  </span>
                  <h4 className="text-xl font-black mt-1 tracking-tight">{post.title}</h4>
                </div>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-4">
                <div className="flex justify-between items-center bg-gray-50 p-3 rounded-xl border border-gray-100">
                  <StarRating rating={post.rating} count={post.review_count} />
                  <span className="text-xs font-mono font-bold text-gray-500">
                    Added {new Date(post.created_at).toLocaleDateString()}
                  </span>
                </div>

                <div className="space-y-2">
                  <h5 className="text-xs font-bold uppercase tracking-wider text-gray-400">Review Summary</h5>
                  <p className="text-sm text-[#1A1A1A] leading-relaxed font-medium">
                    {post.about}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <button
                    onClick={() => {
                      setShowModal(false);
                      onNavigateToPost?.(post.slug);
                    }}
                    className="flex items-center justify-center gap-1.5 px-4 py-3 border border-gray-200 hover:bg-gray-50 text-gray-800 font-bold text-xs rounded-xl transition"
                  >
                    <span>Full Review Page</span>
                    <ExternalLink size={14} />
                  </button>

                  <a
                    href={post.shop_url}
                    target="_blank"
                    referrerPolicy="no-referrer"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-1.5 px-4 py-3 bg-[#CC0000] hover:bg-[#E60000] text-white font-bold text-xs rounded-xl transition shadow-lg shadow-red-900/10"
                  >
                    <ShoppingBag size={14} />
                    <span>Shop Affiliate Link</span>
                  </a>
                </div>
              </div>

              {/* Close Bar */}
              <div className="bg-gray-50 px-6 py-3 flex justify-end border-t border-gray-100">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-1.5 bg-[#1A1A1A] hover:bg-gray-800 text-white text-xs font-bold rounded-lg transition"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
export default PostCard;
