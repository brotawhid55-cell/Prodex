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

  const rounded = Math.round(post.rating);
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    if (i <= rounded) {
      stars.push(<span key={i} className="text-[#E0A900]">★</span>);
    } else {
      stars.push(<span key={i} className="text-[#857371]/30">★</span>);
    }
  }

  return (
    <>
      <motion.div
        layout
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -15 }}
        whileHover={{ y: -4, transition: { duration: 0.15 } }}
        className="bg-[#FFF8F7] border border-[#857371]/20 rounded-[12px] shadow-sm flex flex-col overflow-hidden relative group h-[440px] md:h-[460px] justify-between"
      >
        {/* Top Image Container */}
        <div className="h-44 md:h-48 w-full overflow-hidden relative bg-gray-100">
          <img 
            src={post.image_url} 
            alt={post.title} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            referrerPolicy="no-referrer"
          />
          <span className="absolute top-3 left-3 text-[11px] font-mono font-bold tracking-wide bg-[#FFDAD6] text-[#410002] px-2.5 py-1 rounded-full shadow-sm">
            @{username}
          </span>
        </div>

        {/* Content Body Container */}
        <div className="p-4 flex-1 flex flex-col justify-between">
          <div className="space-y-2">
            {/* Rating / reviews row */}
            <div className="flex items-center gap-1 font-mono text-xs font-bold text-[#1A1A1A]">
              <div className="flex gap-0.5 text-sm">{stars}</div>
              <span className="text-[#1A1A1A] font-bold text-xs ml-1">{post.rating.toFixed(1)}</span>
              <span className="text-[#534341] font-normal text-[10px]">({post.review_count.toLocaleString()})</span>
            </div>

            {/* Title */}
            <h3 
              onClick={() => onNavigateToPost?.(post.slug)}
              className="text-base md:text-lg font-bold tracking-tight text-[#1A1A1A] leading-snug cursor-pointer hover:text-[#CC0000] line-clamp-2 transition-colors duration-150"
            >
              {post.title}
            </h3>
            
            {/* Description */}
            <p className="text-xs text-[#534341] font-normal line-clamp-2 leading-relaxed">
              {post.meta_description}
            </p>
          </div>

          {/* Action Buttons (Material 3 Style) */}
          <div className="grid grid-cols-2 gap-2 pt-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowModal(true);
              }}
              className="flex items-center justify-center gap-1.5 h-10 rounded-full border border-[#857371] hover:bg-[#CC0000]/8 active:bg-[#CC0000]/12 text-[#CC0000] font-bold text-xs transition duration-150"
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
              className="flex items-center justify-center gap-1.5 h-10 rounded-full bg-[#CC0000] hover:bg-[#CC0000]/92 active:bg-[#CC0000]/88 text-[#FFFFFF] font-bold text-xs transition duration-150 shadow"
            >
              <ShoppingBag size={14} />
              <span>Shop Now</span>
            </a>
          </div>
        </div>
      </motion.div>

      {/* About Modal (Redesigned with Material 3 Extra Large shape and Surface style) */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#FFF8F7] rounded-[28px] max-w-lg w-full overflow-hidden shadow-2xl border border-[#857371]/20 flex flex-col"
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
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <span className="text-[11px] font-mono font-bold tracking-wider uppercase bg-[#FFDAD6] text-[#410002] px-2.5 py-1 rounded-full shadow">
                    Review by @{username}
                  </span>
                  <h4 className="text-xl font-bold mt-2 tracking-tight">{post.title}</h4>
                </div>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-4">
                <div className="flex justify-between items-center bg-[#F5DDDB] p-3 rounded-[12px] border border-[#857371]/10">
                  <StarRating rating={post.rating} count={post.review_count} />
                  <span className="text-xs font-mono font-medium text-[#534341]">
                    Added {new Date(post.created_at).toLocaleDateString()}
                  </span>
                </div>

                <div className="space-y-2">
                  <h5 className="text-[11px] font-bold uppercase tracking-wider text-[#857371]">Review Summary</h5>
                  <p className="text-sm text-[#1A1A1A] leading-relaxed font-normal">
                    {post.about}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <button
                    onClick={() => {
                      setShowModal(false);
                      onNavigateToPost?.(post.slug);
                    }}
                    className="flex items-center justify-center gap-1.5 h-10 rounded-full border border-[#857371] hover:bg-[#CC0000]/8 active:bg-[#CC0000]/12 text-[#CC0000] font-bold text-xs transition duration-150"
                  >
                    <span>Full Review Page</span>
                    <ExternalLink size={14} />
                  </button>

                  <a
                    href={post.shop_url}
                    target="_blank"
                    referrerPolicy="no-referrer"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-1.5 h-10 rounded-full bg-[#CC0000] hover:bg-[#CC0000]/92 active:bg-[#CC0000]/88 text-[#FFFFFF] font-bold text-xs transition duration-150 shadow"
                  >
                    <ShoppingBag size={14} />
                    <span>Shop Affiliate Link</span>
                  </a>
                </div>
              </div>

              {/* Close Bar */}
              <div className="bg-[#F5DDDB]/50 px-6 py-4 flex justify-end border-t border-[#857371]/10">
                <button
                  onClick={() => setShowModal(false)}
                  className="h-10 px-6 bg-[#1A1A1A] hover:bg-[#1A1A1A]/88 text-[#FFFFFF] text-xs font-bold rounded-full transition"
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
