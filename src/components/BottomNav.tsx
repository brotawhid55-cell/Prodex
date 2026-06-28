import React from "react";
import { Home, User, Plus, Search } from "lucide-react";

interface BottomNavProps {
  currentPath: string;
  isLoggedIn: boolean;
  onNavigate: (path: string) => void;
  onProfileClick: () => void;
}

export function BottomNav({ currentPath, isLoggedIn, onNavigate, onProfileClick }: BottomNavProps) {
  // Items configuration for Material 3 Bottom Nav Bar
  const isHomeActive = currentPath === "/";
  const isSearchActive = false; // Search triggers focus on feed or navigates home
  const isProfileActive = currentPath === "/profile" || currentPath === "/settings";

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-[#F5DDDB] border-t border-[#857371]/20 h-20 md:hidden shadow-lg px-2">
      <div className="flex justify-around items-center h-full max-w-md mx-auto relative">
        {/* Home Item */}
        <button
          onClick={() => onNavigate("/")}
          className="flex flex-col items-center justify-center gap-1 w-16 h-full transition-all group"
        >
          <div className={`px-5 py-1 rounded-full transition-all ${
            isHomeActive 
              ? "bg-[#FFDAD6] text-[#CC0000]" 
              : "text-[#534341] hover:bg-[#534341]/8"
          }`}>
            <Home size={22} className={isHomeActive ? "stroke-[2.5]" : "stroke-[2]"} />
          </div>
          <span className={`text-[11px] font-medium tracking-tight ${
            isHomeActive ? "text-[#CC0000] font-bold" : "text-[#534341]"
          }`}>
            Home
          </span>
        </button>

        {/* Search Item */}
        <button
          onClick={() => {
            onNavigate("/");
            // Allow time for navigation and scroll to search
            setTimeout(() => {
              const el = document.getElementById("search-input");
              if (el) {
                el.scrollIntoView({ behavior: "smooth" });
                el.focus();
              }
            }, 100);
          }}
          className="flex flex-col items-center justify-center gap-1 w-16 h-full transition-all group"
        >
          <div className={`px-5 py-1 rounded-full transition-all text-[#534341] hover:bg-[#534341]/8`}>
            <Search size={22} className="stroke-[2]" />
          </div>
          <span className="text-[11px] font-medium tracking-tight text-[#534341]">
            Search
          </span>
        </button>

        {/* Center Add: Material 3 FAB Style */}
        <button
          onClick={() => onNavigate("/create-post")}
          className={`flex items-center justify-center -mt-6 bg-[#CC0000] text-[#FFFFFF] w-12 h-12 rounded-2xl shadow-md hover:bg-[#CC0000]/92 active:scale-95 transition-all border-4 border-[#FFF8F7]`}
          title="New Post"
        >
          <Plus size={24} className="stroke-[3]" />
        </button>

        {/* Profile Item */}
        <button
          onClick={onProfileClick}
          className="flex flex-col items-center justify-center gap-1 w-16 h-full transition-all group"
        >
          <div className={`px-5 py-1 rounded-full transition-all ${
            isProfileActive 
              ? "bg-[#FFDAD6] text-[#CC0000]" 
              : "text-[#534341] hover:bg-[#534341]/8"
          }`}>
            <User size={22} className={isProfileActive ? "stroke-[2.5]" : "stroke-[2]"} />
          </div>
          <span className={`text-[11px] font-medium tracking-tight ${
            isProfileActive ? "text-[#CC0000] font-bold" : "text-[#534341]"
          }`}>
            Profile
          </span>
        </button>
      </div>
    </div>
  );
}

export default BottomNav;
