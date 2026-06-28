import React from "react";
import { ShoppingBag, PlusCircle, Settings, LogOut, LogIn, Store, UserPlus } from "lucide-react";

interface HeaderProps {
  currentPath: string;
  currentSubdomain: string | null;
  subdomainUser: any;
  currentUser: any;
  onNavigate: (path: string) => void;
  onLogout: () => void;
}

export function Header({
  currentPath,
  currentSubdomain,
  subdomainUser,
  currentUser,
  onNavigate,
  onLogout
}: HeaderProps) {
  const isStoreView = !!currentSubdomain;

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm px-4 py-4 md:px-8">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Branding / Logo */}
        <div 
          onClick={() => onNavigate("/")}
          className="flex items-center gap-2 cursor-pointer group"
        >
          <div className="bg-[#CC0000] p-2 rounded-xl text-white shadow-sm group-hover:scale-105 transition-transform duration-200">
            <ShoppingBag size={20} className="stroke-[2.5]" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-black tracking-tighter text-[#1A1A1A] leading-none uppercase">
              {isStoreView ? (
                <>
                  <span className="text-[#CC0000]">{subdomainUser?.display_name || currentSubdomain}</span>
                  <span className="text-xs font-mono font-bold lowercase text-gray-400 block tracking-normal mt-0.5">
                    powered by trodex
                  </span>
                </>
              ) : (
                <>
                  TRO<span className="text-[#CC0000]">DEX</span>
                </>
              )}
            </h1>
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-4">
          {/* If looking at a subdomain, link back to main feed */}
          {isStoreView && (
            <button
              onClick={() => {
                // Navigate back to Main Feed (by clearing subdomain)
                window.location.search = "";
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 border border-gray-200 hover:bg-gray-50 text-gray-700 font-bold text-xs rounded-xl transition"
            >
              <Store size={14} />
              <span>Explore Main Feed</span>
            </button>
          )}

          {currentUser ? (
            <>
              {/* Logged In Items */}
              <button
                onClick={() => onNavigate("/create-post")}
                className={`flex items-center gap-1.5 px-3.5 py-2 font-bold text-xs rounded-xl transition shadow-sm ${
                  currentPath === "/create-post"
                    ? "bg-[#CC0000] text-white"
                    : "bg-gray-50 hover:bg-gray-100 text-[#1A1A1A] border border-gray-200"
                }`}
              >
                <PlusCircle size={14} />
                <span>Create Post</span>
              </button>

              <button
                onClick={() => onNavigate("/settings")}
                className={`flex items-center gap-1.5 px-3.5 py-2 font-bold text-xs rounded-xl transition border ${
                  currentPath === "/settings"
                    ? "bg-[#1A1A1A] text-white border-[#1A1A1A]"
                    : "bg-white hover:bg-gray-50 text-gray-700 border-gray-200"
                }`}
              >
                <Settings size={14} />
                <span>Settings</span>
              </button>

              <div className="flex items-center gap-2 pl-2 border-l border-gray-200">
                <img
                  src={currentUser.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${currentUser.username}`}
                  alt={currentUser.display_name}
                  className="h-8 w-8 rounded-xl object-cover border border-gray-200 shadow-sm"
                />
                <div className="text-left">
                  <span className="block text-xs font-black text-[#1A1A1A] leading-none">
                    {currentUser.display_name}
                  </span>
                  <span className="text-[10px] font-mono text-gray-400 lowercase">
                    @{currentUser.username}
                  </span>
                </div>
                <button
                  onClick={onLogout}
                  title="Logout"
                  className="p-1.5 hover:bg-red-50 hover:text-[#CC0000] text-gray-400 rounded-lg transition ml-1"
                >
                  <LogOut size={16} />
                </button>
              </div>
            </>
          ) : (
            <>
              {/* Logged Out Items */}
              <button
                onClick={() => onNavigate("/login")}
                className="flex items-center gap-1.5 px-4 py-2 border border-gray-200 hover:bg-gray-50 text-gray-700 font-bold text-xs rounded-xl transition"
              >
                <LogIn size={14} />
                <span>Log In</span>
              </button>
              
              <button
                onClick={() => onNavigate("/register")}
                className="flex items-center gap-1.5 px-4 py-2 bg-[#CC0000] hover:bg-[#E60000] text-white font-bold text-xs rounded-xl transition shadow-md shadow-red-900/10"
              >
                <UserPlus size={14} />
                <span>Register</span>
              </button>
            </>
          )}
        </nav>

        {/* Mobile Header Right Profile Trigger */}
        <div className="md:hidden flex items-center gap-2">
          {currentUser ? (
            <img
              onClick={() => onNavigate("/settings")}
              src={currentUser.avatar_url}
              alt={currentUser.display_name}
              className="h-8 w-8 rounded-xl object-cover border border-gray-200 shadow cursor-pointer active:scale-95 transition-transform"
            />
          ) : (
            <button
              onClick={() => onNavigate("/login")}
              className="px-3 py-1.5 bg-[#CC0000] text-white text-xs font-bold rounded-lg"
            >
              Log In
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
export default Header;
