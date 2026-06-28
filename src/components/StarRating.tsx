import React from "react";

interface StarRatingProps {
  rating: number;
  count: number;
}

export function StarRating({ rating, count }: StarRatingProps) {
  const rounded = Math.round(rating);
  const stars = [];
  
  for (let i = 1; i <= 5; i++) {
    if (i <= rounded) {
      stars.push(<span key={i} className="text-[#E0A900] text-lg">★</span>);
    } else {
      stars.push(<span key={i} className="text-[#857371]/30 text-lg">☆</span>);
    }
  }

  return (
    <div className="flex items-center gap-1.5 font-mono text-xs font-medium text-[#1A1A1A]">
      <div className="flex gap-0.5">{stars}</div>
      <span className="bg-[#FFDAD6] text-[#410002] px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider">{rating.toFixed(1)}</span>
      <span className="text-[#534341] font-normal">({count.toLocaleString()} reviews)</span>
    </div>
  );
}
export default StarRating;
