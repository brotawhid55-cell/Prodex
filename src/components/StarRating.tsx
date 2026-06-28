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
      stars.push(<span key={i} className="text-yellow-400 text-lg">★</span>);
    } else {
      stars.push(<span key={i} className="text-gray-300 text-lg">☆</span>);
    }
  }

  return (
    <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-[#1A1A1A]">
      <div className="flex gap-0.5">{stars}</div>
      <span className="bg-yellow-100 px-1.5 py-0.5 rounded text-yellow-800 text-[10px] uppercase tracking-wider">{rating.toFixed(1)}</span>
      <span className="text-gray-500 font-normal">({count.toLocaleString()} reviews)</span>
    </div>
  );
}
export default StarRating;
