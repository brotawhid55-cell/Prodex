import React, { useState, useEffect } from "react";
import { Settings, Loader2, Check, AlertCircle, ShieldCheck, Globe, User, ArrowLeft } from "lucide-react";
import { motion } from "motion/react";

interface SettingsViewProps {
  currentUser: any;
  onNavigate: (path: string) => void;
  onRefreshContext: () => void;
}

export function SettingsView({ currentUser, onNavigate, onRefreshContext }: SettingsViewProps) {
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [searchConsoleTag, setSearchConsoleTag] = useState("");

  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (currentUser) {
      setDisplayName(currentUser.display_name || "");
      setBio(currentUser.bio || "");
      setAvatarUrl(currentUser.avatar_url || "");
      setSearchConsoleTag(currentUser.search_console_meta_tag || "");
    }
  }, [currentUser]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus("idle");
    setErrorMessage("");

    if (!displayName) {
      setErrorMessage("Display name is required.");
      setLoading(false);
      return;
    }

    if (bio.length > 160) {
      setErrorMessage("Bio cannot exceed 160 characters.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/user/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          display_name: displayName,
          bio,
          avatar_url: avatarUrl,
          search_console_meta_tag: searchConsoleTag
        })
      });

      const data = await res.json();
      if (res.ok) {
        setStatus("success");
        onRefreshContext();
      } else {
        setStatus("error");
        setErrorMessage(data.error || "Failed to update settings.");
      }
    } catch {
      setStatus("error");
      setErrorMessage("Server error during settings update.");
    } finally {
      setLoading(false);
    }
  };

  if (!currentUser) {
    return (
      <div className="max-w-md mx-auto py-20 text-center space-y-4">
        <Loader2 className="animate-spin text-[#CC0000] mx-auto" size={32} />
        <span className="text-xs font-mono font-bold text-gray-400 uppercase tracking-widest block">
          Checking account details...
        </span>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-8 py-6 space-y-6">
      {/* Back to feed link */}
      <button
        onClick={() => onNavigate("/")}
        className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#1A1A1A] hover:text-[#CC0000] transition bg-white px-4 py-2 rounded-xl border border-gray-100 shadow-sm"
      >
        <ArrowLeft size={14} />
        <span>Back to Feed</span>
      </button>

      {/* Main Container */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 md:p-8 space-y-8">
        
        {/* Title Heading */}
        <div className="border-b border-gray-100 pb-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-2xl md:text-3xl font-black text-[#1A1A1A] tracking-tight uppercase flex items-center gap-2">
              <Settings className="text-[#CC0000]" />
              <span>Store Settings</span>
            </h2>
            <p className="text-xs text-gray-500 font-medium font-sans">
              Update your store appearance, profile details, and external domain verifications.
            </p>
          </div>

          {/* Subdomain highlight info card */}
          <div className="bg-red-50 p-3 rounded-2xl border border-red-100 font-mono text-xs font-bold text-[#CC0000]">
            Your Store: <span className="underline">{currentUser.username}.trodex.com</span>
          </div>
        </div>

        {/* Update Form */}
        <form onSubmit={handleSave} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Left Hand: Core Profile */}
            <div className="space-y-4">
              <h3 className="font-black text-sm uppercase tracking-wider text-gray-400 flex items-center gap-1.5 border-b border-gray-50 pb-2">
                <User size={16} />
                <span>Public Brand Profile</span>
              </h3>

              {/* Display Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#1A1A1A] uppercase">
                  Display Store Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Minimalist Curator"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200/80 focus:border-[#CC0000] focus:bg-white rounded-xl text-xs font-bold text-[#1A1A1A] transition focus:outline-none"
                  required
                />
              </div>

              {/* Avatar URL */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#1A1A1A] uppercase">
                  Profile Avatar URL
                </label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/... or similar image URL"
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200/80 focus:border-[#CC0000] focus:bg-white rounded-xl text-xs font-bold text-[#1A1A1A] transition focus:outline-none font-mono"
                />
                
                {/* Micro avatar preview */}
                {avatarUrl && (
                  <div className="flex items-center gap-2 pt-1">
                    <img
                      src={avatarUrl}
                      alt="Avatar Preview"
                      className="h-10 w-10 rounded-xl object-cover border border-gray-200"
                    />
                    <span className="text-[10px] text-gray-400 font-mono">Live avatar preview</span>
                  </div>
                )}
              </div>

              {/* Bio */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs font-bold text-[#1A1A1A] uppercase">
                  <label>Curator Biography</label>
                  <span className={`font-mono text-[10px] font-bold ${bio.length > 160 ? "text-red-500" : "text-gray-400"}`}>
                    {bio.length}/160 max
                  </span>
                </div>
                <textarea
                  placeholder="Tell your store followers what you specialize in curating..."
                  value={bio}
                  onChange={(e) => setBio(e.target.value.slice(0, 160))}
                  className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200/80 focus:border-[#CC0000] focus:bg-white rounded-xl text-xs font-medium text-[#1A1A1A] transition focus:outline-none min-h-[90px] resize-none"
                />
              </div>
            </div>

            {/* Right Hand: Search Console Tag */}
            <div className="space-y-4">
              <h3 className="font-black text-sm uppercase tracking-wider text-gray-400 flex items-center gap-1.5 border-b border-gray-50 pb-2">
                <ShieldCheck size={16} />
                <span>Search Console Verification</span>
              </h3>

              {/* Instruction description card */}
              <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 text-xs text-gray-600 font-medium space-y-2 leading-relaxed font-sans">
                <div className="flex items-center gap-1.5 text-gray-800 font-bold">
                  <Globe size={14} className="text-[#CC0000]" />
                  <span>Subdomain SEO Instructions</span>
                </div>
                <p>
                  Copy the HTML tag from Google Search Console and paste it here. It will appear in your profile's <code className="font-mono bg-white px-1 py-0.5 rounded border border-gray-200">&lt;head&gt;</code> tag automatically so Google can verify your ownership.
                </p>
                <div className="text-[10px] text-gray-400 font-mono pt-1">
                  Format expected: &lt;meta name="google-site-verification" content="..." /&gt;
                </div>
              </div>

              {/* Textarea */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#1A1A1A] uppercase">
                  HTML Meta Verification Tag
                </label>
                <textarea
                  placeholder='<meta name="google-site-verification" content="Paste your meta code here"/>'
                  value={searchConsoleTag}
                  onChange={(e) => setSearchConsoleTag(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200/80 focus:border-[#CC0000] focus:bg-white rounded-xl text-xs font-mono text-gray-700 transition focus:outline-none min-h-[110px] resize-y"
                />
              </div>
            </div>
          </div>

          {/* Action Footer */}
          <div className="pt-6 border-t border-gray-100 flex flex-col md:flex-row items-center justify-between gap-4">
            
            {/* Status indicators */}
            <div className="text-xs">
              {status === "success" && (
                <div className="text-green-600 font-bold flex items-center gap-1">
                  <Check size={16} />
                  <span>Profile and verification settings saved successfully!</span>
                </div>
              )}
              {status === "error" && (
                <div className="text-red-500 font-bold flex items-center gap-1">
                  <AlertCircle size={16} />
                  <span>{errorMessage}</span>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="px-8 py-3.5 bg-[#CC0000] hover:bg-[#E60000] disabled:bg-gray-400 text-white font-black text-xs uppercase tracking-widest rounded-xl transition shadow-md w-full md:w-auto shrink-0 flex items-center justify-center gap-1.5"
            >
              {loading ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <span>Save All Changes</span>
                </>
              )}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
export default SettingsView;
