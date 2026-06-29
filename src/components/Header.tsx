import React from "react";
import { ShoppingBag, PlusCircle, Settings, LogOut, LogIn, ArrowLeft, UserPlus } from "lucide-react";

interface HeaderProps {
  currentPath: string;
  currentSubdomain: string | null;
  subdomainUser: any;
  currentUser: any;
  onNavigate: (path: string) => void;
  onLogout: () => void;
  onClearSubdomain: () => void;
}

export function Header({
  currentPath,
  currentSubdomain,
  subdomainUser,
  currentUser,
  onNavigate,
  onLogout,
  onClearSubdomain,
}: HeaderProps) {
  const isStoreView = !!currentSubdomain;

  return (
    <header className="sticky top-0 z-30 bg-[#FFF8F7] border-b border-[#857371]/30 px-4 md:px-8 h-16 flex items-center shadow-sm">
      <div className="w-full max-w-7xl mx-auto flex items-center justify-between">

        {/* Logo */}
        <div
          onClick={isStoreView ? onClearSubdomain : () => onNavigate("/")}
          className="flex items-center gap-2 cursor-pointer select-none"
        >
          <div className="bg-[#CC0000] p-2 rounded-xl text-white shadow-sm">
            <ShoppingBag size={18} className="stroke-[2.5]" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold tracking-tight text-[#1A1A1A] leading-none uppercase">
              {isStoreView ? (
                <>
                  <span className="text-[#CC0000]">{subdomainUser?.display_name || currentSubdomain}</span>
                  <span className="text-[11px] font-medium lowercase text-[#534341] block tracking-normal mt-0.5">
                    powered by trodex
                  </span>
                </>
              ) : (
                <>
                  <span className="text-[#CC0000] font-black">TRO</span>
                  <span className="text-[#1A1A1A] font-light">DEX</span>
                </>
              )}
            </h1>
          </div>
        </div>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-3">

          {/* Back to Feed — always show when in subdomain mode */}
          {isStoreView && (
            <button
              onClick={onClearSubdomain}
              className="flex items-center gap-2 h-10 px-4 border border-[#857371] hover:bg-[#CC0000]/8 text-[#CC0000] font-medium text-xs rounded-full transition"
            >
              <ArrowLeft size={14} />
              <span>Main Feed</span>
            </button>
          )}

          {currentUser ? (
            <>
              <button
                onClick={() => onNavigate("/create-post")}
                className={`flex items-center gap-2 h-10 px-4 font-medium text-xs rounded-full transition ${
                  currentPath === "/create-post"
                    ? "bg-[#CC0000] text-white"
                    : "border border-[#857371] text-[#1A1A1A] hover:bg-[#1A1A1A]/8"
                }`}
              >
                <PlusCircle size={14} />
                <span>Create Post</span>
              </button>

              <button
                onClick={() => onNavigate("/settings")}
                className={`flex items-center gap-2 h-10 px-4 font-medium text-xs rounded-full transition ${
                  currentPath === "/settings"
                    ? "bg-[#CC0000] text-white"
                    : "border border-[#857371] text-[#1A1A1A] hover:bg-[#1A1A1A]/8"
                }`}
              >
                <Settings size={14} />
                <span>Settings</span>
              </button>

              <div className="flex items-center gap-2 pl-3 border-l border-[#857371]/30">
                <img
                  src={currentUser.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${currentUser.username}`}
                  alt={currentUser.display_name}
                  className="h-8 w-8 rounded-full object-cover border border-[#857371]/30"
                />
                <div className="text-left">
                  <span className="block text-xs font-medium text-[#1A1A1A]">{currentUser.display_name}</span>
                  <span className="text-[11px] text-[#534341]">@{currentUser.username}</span>
                </div>
                <button
                  onClick={onLogout}
                  title="Logout"
                  className="p-2 hover:bg-[#CC0000]/8 text-[#CC0000] rounded-full transition ml-1"
                >
                  <LogOut size={16} />
                </button>
              </div>
            </>
          ) : (
            <>
              <button
                onClick={() => onNavigate("/login")}
                className="flex items-center gap-2 h-10 px-4 border border-[#857371] hover:bg-[#CC0000]/8 text-[#CC0000] font-medium text-xs rounded-full transition"
              >
                <LogIn size={14} />
                <span>Log In</span>
              </button>
              <button
                onClick={() => onNavigate("/register")}
                className="flex items-center gap-2 h-10 px-4 bg-[#CC0000] hover:bg-[#A00000] text-white font-medium text-xs rounded-full transition"
              >
                <UserPlus size={14} />
                <span>Register</span>
              </button>
            </>
          )}
        </nav>

        {/* Mobile right side */}
        <div className="md:hidden flex items-center gap-2">
          {/* FIX: Back to feed button on mobile when stuck in subdomain */}
          {isStoreView && (
            <button
              onClick={onClearSubdomain}
              className="flex items-center gap-1 h-8 px-3 border border-[#857371] text-[#CC0000] text-xs font-medium rounded-full"
            >
              <ArrowLeft size={12} />
              <span>Feed</span>
            </button>
          )}

          {currentUser ? (
            <img
              onClick={() => onNavigate("/settings")}
              src={currentUser.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${currentUser.username}`}
              alt={currentUser.display_name}
              className="h-8 w-8 rounded-full object-cover border border-[#857371]/30 cursor-pointer"
            />
          ) : (
            <button
              onClick={() => onNavigate("/login")}
              className="h-9 px-4 bg-[#CC0000] text-white text-xs font-medium rounded-full"
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
