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
    <header className="sticky top-0 z-30 bg-[#FFF8F7] border-b border-[#857371]/30 px-4 md:px-8 h-16 flex items-center shadow-sm">
      <div className="w-full max-w-7xl mx-auto flex items-center justify-between">
        {/* Branding / Logo (Material 3 style) */}
        <div 
          onClick={() => onNavigate("/")}
          className="flex items-center gap-2 cursor-pointer group select-none"
        >
          <div className="bg-[#CC0000] p-2 rounded-xl text-white shadow-sm hover:bg-[#CC0000]/92 transition duration-200">
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

        {/* Desktop Navigation (Material 3 Buttons with state layers) */}
        <nav className="hidden md:flex items-center gap-4">
          {isStoreView && (
            <button
              onClick={() => {
                window.location.search = "";
              }}
              className="flex items-center gap-2 h-10 px-4 border border-[#857371] hover:bg-[#CC0000]/8 active:bg-[#CC0000]/12 text-[#CC0000] font-medium text-xs rounded-full transition-all duration-150"
            >
              <Store size={14} />
              <span>Explore Main Feed</span>
            </button>
          )}

          {currentUser ? (
            <>
              <button
                onClick={() => onNavigate("/create-post")}
                className={`flex items-center gap-2 h-10 px-4 font-medium text-xs rounded-full transition-all duration-150 ${
                  currentPath === "/create-post"
                    ? "bg-[#CC0000] text-[#FFFFFF] hover:bg-[#CC0000]/92 active:bg-[#CC0000]/88"
                    : "border border-[#857371] text-[#1A1A1A] hover:bg-[#1A1A1A]/8 active:bg-[#1A1A1A]/12"
                }`}
              >
                <PlusCircle size={14} />
                <span>Create Post</span>
              </button>

              <button
                onClick={() => onNavigate("/settings")}
                className={`flex items-center gap-2 h-10 px-4 font-medium text-xs rounded-full transition-all duration-150 ${
                  currentPath === "/settings"
                    ? "bg-[#CC0000] text-[#FFFFFF] hover:bg-[#CC0000]/92 active:bg-[#CC0000]/88"
                    : "border border-[#857371] text-[#1A1A1A] hover:bg-[#1A1A1A]/8 active:bg-[#1A1A1A]/12"
                }`}
              >
                <Settings size={14} />
                <span>Settings</span>
              </button>

              <div className="flex items-center gap-3 pl-3 border-l border-[#857371]/30">
                <img
                  src={currentUser.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${currentUser.username}`}
                  alt={currentUser.display_name}
                  className="h-8 w-8 rounded-full object-cover border border-[#857371]/30"
                />
                <div className="text-left">
                  <span className="block text-sm font-medium text-[#1A1A1A] leading-none">
                    {currentUser.display_name}
                  </span>
                  <span className="text-xs text-[#534341] lowercase">
                    @{currentUser.username}
                  </span>
                </div>
                <button
                  onClick={onLogout}
                  title="Logout"
                  className="p-2 hover:bg-[#CC0000]/8 active:bg-[#CC0000]/12 text-[#CC0000] rounded-full transition-all duration-150 ml-1"
                >
                  <LogOut size={16} />
                </button>
              </div>
            </>
          ) : (
            <>
              <button
                onClick={() => onNavigate("/login")}
                className="flex items-center gap-2 h-10 px-4 border border-[#857371] hover:bg-[#CC0000]/8 active:bg-[#CC0000]/12 text-[#CC0000] font-medium text-xs rounded-full transition-all duration-150"
              >
                <LogIn size={14} />
                <span>Log In</span>
              </button>
              
              <button
                onClick={() => onNavigate("/register")}
                className="flex items-center gap-2 h-10 px-4 bg-[#CC0000] hover:bg-[#CC0000]/92 active:bg-[#CC0000]/88 text-[#FFFFFF] font-medium text-xs rounded-full transition-all duration-150"
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
              src={currentUser.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${currentUser.username}`}
              alt={currentUser.display_name}
              className="h-8 w-8 rounded-full object-cover border border-[#857371]/30 cursor-pointer active:scale-95 transition-transform duration-100"
            />
          ) : (
            <button
              onClick={() => onNavigate("/login")}
              className="h-9 px-4 bg-[#CC0000] hover:bg-[#CC0000]/92 active:bg-[#CC0000]/88 text-[#FFFFFF] text-xs font-medium rounded-full transition"
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
