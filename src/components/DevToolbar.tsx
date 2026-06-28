import React from "react";
import { Cpu, RefreshCw, AlertCircle, Sparkles } from "lucide-react";

interface DevToolbarProps {
  currentSubdomain: string | null;
  currentUser: any;
  isUsingNeon: boolean;
  onSimulateSubdomain: (subdomain: string | null) => void;
}

export function DevToolbar({ currentSubdomain, currentUser, isUsingNeon, onSimulateSubdomain }: DevToolbarProps) {
  return (
    <div className="bg-[#1A1A1A] text-white border-b border-gray-800 text-xs px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 shadow-md">
      <div className="flex items-center gap-2 font-mono">
        <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
        <span className="font-black text-red-500 tracking-wider">TRODEX DEV PANEL</span>
        <span className="text-gray-500">|</span>
        <span className="flex items-center gap-1">
          <Cpu size={12} className="text-gray-400" />
          Database: {isUsingNeon ? (
            <span className="text-emerald-400 font-bold">Neon PostgreSQL</span>
          ) : (
            <span className="text-amber-400 font-bold">Local File Fallback</span>
          )}
        </span>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-gray-400 font-medium mr-1">Active View:</span>
        
        {/* Main Feed Button */}
        <button
          onClick={() => onSimulateSubdomain(null)}
          className={`px-3 py-1 rounded font-bold transition ${
            !currentSubdomain
              ? "bg-[#CC0000] text-white shadow"
              : "bg-gray-800 hover:bg-gray-700 text-gray-300"
          }`}
        >
          Main Feed (trodex.com)
        </button>

        {/* Demo Subdomain Button */}
        <button
          onClick={() => onSimulateSubdomain("techcurator")}
          className={`px-3 py-1 rounded font-bold transition ${
            currentSubdomain === "techcurator"
              ? "bg-[#CC0000] text-white shadow"
              : "bg-gray-800 hover:bg-gray-700 text-gray-300"
          }`}
        >
          @techcurator Store
        </button>

        {/* Current User Subdomain Button */}
        {currentUser && (
          <button
            onClick={() => onSimulateSubdomain(currentUser.username)}
            className={`px-3 py-1 rounded font-bold transition ${
              currentSubdomain === currentUser.username
                ? "bg-[#CC0000] text-white shadow"
                : "bg-gray-800 hover:bg-gray-700 text-gray-300"
            }`}
          >
            My Store (@{currentUser.username})
          </button>
        )}
      </div>

      {!isUsingNeon && (
        <div className="hidden lg:flex items-center gap-1 text-amber-400 font-medium text-[10px] bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
          <AlertCircle size={12} />
          <span>Database fallback active. Connect Neon PG in .env secrets to use SQL.</span>
        </div>
      )}
    </div>
  );
}
export default DevToolbar;
