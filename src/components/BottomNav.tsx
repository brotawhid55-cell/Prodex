import React from "react";
import { Home, User, Plus } from "lucide-react";

interface BottomNavProps {
  currentPath: string;
  isLoggedIn: boolean;
  onNavigate: (path: string) => void;
  onProfileClick: () => void;
}

export function BottomNav({ currentPath, isLoggedIn, onNavigate, onProfileClick }: BottomNavProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-gray-100 py-3.5 px-6 md:hidden shadow-xl">
      <div className="flex justify-around items-center max-w-md mx-auto relative">
        {/* Home Link */}
        <button
          onClick={() => onNavigate("/")}
          className={`flex flex-col items-center gap-1.5 transition-colors ${
            currentPath === "/" ? "text-[#CC0000]" : "text-gray-500 hover:text-[#1A1A1A]"
          }`}
        >
          <Home size={22} className={currentPath === "/" ? "stroke-[2.5]" : "stroke-[2]"} />
          <span className="text-[10px] font-bold uppercase tracking-wider">Home</span>
        </button>

        {/* Big Plus Icon in the middle for Add Post */}
        <button
          onClick={() => onNavigate("/create-post")}
          className={`flex flex-col items-center justify-center -mt-6 bg-[#CC0000] text-white p-3.5 rounded-full shadow-lg shadow-red-950/20 border-4 border-[#F5F0EB] hover:bg-[#E60000] active:scale-95 transition-all ${
            currentPath === "/create-post" ? "scale-105" : ""
          }`}
          title="Add Post"
        >
          <Plus size={24} className="stroke-[3]" />
        </button>

        {/* Profile Link */}
        <button
          onClick={onProfileClick}
          className={`flex flex-col items-center gap-1.5 transition-colors ${
            currentPath === "/profile" || currentPath === "/settings" ? "text-[#CC0000]" : "text-gray-500 hover:text-[#1A1A1A]"
          }`}
        >
          <User size={22} className={currentPath === "/profile" || currentPath === "/settings" ? "stroke-[2.5]" : "stroke-[2]"} />
          <span className="text-[10px] font-bold uppercase tracking-wider">Profile</span>
        </button>
      </div>
    </div>
  );
}
export default BottomNav;
