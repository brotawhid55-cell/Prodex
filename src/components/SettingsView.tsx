import React, { useState, useEffect } from "react";
import { Settings, Loader2, Check, AlertCircle, ShieldCheck, User, ArrowLeft, LogOut } from "lucide-react";

interface SettingsViewProps {
  currentUser: any;
  onNavigate: (path: string) => void;
  onRefreshContext: () => void;
}

export function SettingsView({ currentUser, onNavigate, onRefreshContext }: SettingsViewProps) {
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  
  // Search engine fields
  const [googleVerification, setGoogleVerification] = useState("");
  const [bingVerification, setBingVerification] = useState("");
  const [yandexVerification, setYandexVerification] = useState("");
  const [baiduVerification, setBaiduVerification] = useState("");
  const [pinterestVerification, setPinterestVerification] = useState("");

  const [activeTab, setActiveTab] = useState<"profile" | "verification">("profile");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (currentUser) {
      setDisplayName(currentUser.display_name || "");
      setBio(currentUser.bio || "");
      setAvatarUrl(currentUser.avatar_url || "");
      setGoogleVerification(currentUser.google_verification || "");
      setBingVerification(currentUser.bing_verification || "");
      setYandexVerification(currentUser.yandex_verification || "");
      setBaiduVerification(currentUser.baidu_verification || "");
      setPinterestVerification(currentUser.pinterest_verification || "");
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
          google_verification: googleVerification,
          bing_verification: bingVerification,
          yandex_verification: yandexVerification,
          baidu_verification: baiduVerification,
          pinterest_verification: pinterestVerification
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

  const handleLogoutClick = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      onRefreshContext();
      onNavigate("/login");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  if (!currentUser) {
    return (
      <div className="max-w-md mx-auto py-20 text-center space-y-4">
        <Loader2 className="animate-spin text-[#CC0000] mx-auto" size={32} />
        <span className="text-xs font-mono font-bold text-[#534341] uppercase tracking-widest block">
          Checking account details...
        </span>
      </div>
    );
  }

  const fallbackAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(
    currentUser.username
  )}&background=CC0000&color=fff&size=128`;
  const resolvedAvatar = avatarUrl.trim() || fallbackAvatar;

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      {/* Back to feed link */}
      <button
        onClick={() => onNavigate("/")}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#1A1A1A] hover:text-[#CC0000] transition h-10 px-4 bg-[#FFF8F7] rounded-full border border-[#857371] shadow-sm"
      >
        <ArrowLeft size={14} />
        <span>Back to Feed</span>
      </button>

      {/* Main Container */}
      <div className="bg-[#FFF8F7] rounded-[28px] border border-[#857371]/20 shadow-sm p-6 md:p-8 space-y-6">
        
        {/* Title Heading */}
        <div className="border-b border-[#857371]/20 pb-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1 text-left">
            <h2 className="text-xl md:text-2xl font-bold text-[#1A1A1A] tracking-tight uppercase flex items-center gap-2">
              <Settings className="text-[#CC0000]" />
              <span>Store Settings</span>
            </h2>
            <p className="text-xs text-[#534341] font-normal">
              Update your store appearance, profile details, and search engine verifications.
            </p>
          </div>

          {/* Subdomain highlight info card */}
          <div className="bg-[#FFDAD6] px-4 py-2 rounded-full font-mono text-xs font-bold text-[#410002] self-start md:self-auto">
            Your Store: <span className="underline">{currentUser.username}.trodex.com</span>
          </div>
        </div>

        {/* Tab Selection buttons */}
        <div className="flex border-b border-[#857371]/20">
          <button
            type="button"
            onClick={() => {
              setActiveTab("profile");
              setStatus("idle");
            }}
            className={`flex-1 py-3 text-center text-xs font-bold uppercase tracking-wider transition-all border-b-2 ${
              activeTab === "profile"
                ? "border-[#CC0000] text-[#CC0000]"
                : "border-transparent text-[#534341] hover:text-[#1A1A1A]"
            }`}
          >
            Store Profile
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab("verification");
              setStatus("idle");
            }}
            className={`flex-1 py-3 text-center text-xs font-bold uppercase tracking-wider transition-all border-b-2 ${
              activeTab === "verification"
                ? "border-[#CC0000] text-[#CC0000]"
                : "border-transparent text-[#534341] hover:text-[#1A1A1A]"
            }`}
          >
            Search Engine Verification
          </button>
        </div>

        {/* Update Form */}
        <form onSubmit={handleSave} className="space-y-6">
          
          {activeTab === "profile" ? (
            /* TAB 1: Store Profile Info */
            <div className="space-y-5 max-w-xl text-left">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#CC0000] flex items-center gap-1.5 border-b border-[#857371]/10 pb-2">
                <User size={16} />
                <span>Store Profile Info</span>
              </h3>

              {/* Avatar URL */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-[#534341] uppercase block">
                  Profile Avatar URL
                </label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/... or similar image URL"
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  className="w-full h-14 px-4 bg-transparent border border-[#857371] focus:border-[#CC0000] rounded-[4px] text-sm text-[#1A1A1A] transition focus:outline-none font-mono placeholder-[#857371]/50"
                />
                
                {/* Avatar Preview block */}
                <div className="flex items-center gap-3 pt-2 bg-[#F5DDDB]/50 p-4 rounded-[12px] border border-[#857371]/10 mt-2">
                  <img
                    src={resolvedAvatar}
                    alt="Avatar Preview"
                    className="h-16 w-16 rounded-full object-cover border border-[#857371]/30 bg-white shrink-0 shadow-xs"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = fallbackAvatar;
                    }}
                  />
                  <div>
                    <span className="text-xs font-semibold text-[#1A1A1A] block">Avatar Live Preview</span>
                    <span className="text-[10px] text-[#534341] font-mono">
                      {avatarUrl ? "Using custom URL" : "Using UI Avatars placeholder fallback"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Display Name */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-[#534341] uppercase block">
                  Display Store Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Minimalist Curator"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full h-14 px-4 bg-transparent border border-[#857371] focus:border-[#CC0000] rounded-[4px] text-sm text-[#1A1A1A] transition focus:outline-none placeholder-[#857371]/50"
                  required
                />
              </div>

              {/* Bio */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-[11px] font-bold text-[#534341] uppercase">
                  <label>Curator Biography</label>
                  <span className={`font-mono text-[10px] ${bio.length > 160 ? "text-[#B3261E] font-bold" : "text-[#534341]"}`}>
                    {bio.length}/160 max
                  </span>
                </div>
                <textarea
                  placeholder="Tell your store followers what you specialize in curating..."
                  value={bio}
                  onChange={(e) => setBio(e.target.value.slice(0, 160))}
                  className="w-full px-4 py-3 bg-transparent border border-[#857371] focus:border-[#CC0000] rounded-[4px] text-sm text-[#1A1A1A] transition focus:outline-none min-h-[100px] resize-none placeholder-[#857371]/50"
                />
              </div>

              {/* Readonly subdomain preview */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-[#534341] uppercase block">
                  Your Store URL (Readonly Preview)
                </label>
                <input
                  type="text"
                  value={`${currentUser.username}.trodex.com`}
                  readOnly
                  className="w-full h-14 px-4 bg-[#F5DDDB]/30 border border-[#857371]/30 text-[#534341] rounded-[4px] text-sm font-mono select-all focus:outline-none cursor-default"
                />
              </div>
            </div>
          ) : (
            /* TAB 2: Search Engine Verification with List Style and Labels */
            <div className="space-y-6 max-w-xl text-left">
              <div className="bg-[#FFDAD6] border border-[#857371]/10 p-4 rounded-[12px] space-y-1">
                <h4 className="font-bold text-xs uppercase text-[#410002] flex items-center gap-1.5">
                  <ShieldCheck size={14} />
                  <span>Meta Verification Instructions</span>
                </h4>
                <p className="text-[11px] text-[#410002]/95 leading-relaxed">
                  Paste your verification meta tags below. They will appear in your store's <code className="bg-[#FFF8F7] px-1 py-0.5 rounded font-mono text-[10px]">&lt;head&gt;</code> automatically, allowing search engines to verify your subdomain.
                </p>
              </div>

              {/* Google Search Console */}
              <div className="space-y-1.5 pb-4 border-b border-[#857371]/10">
                <label className="text-[11px] font-bold text-[#CC0000] flex items-center gap-1.5 uppercase">
                  <span className="h-2 w-2 rounded-full bg-[#CC0000]" />
                  <span>Google Search Console</span>
                </label>
                <input
                  type="text"
                  placeholder='<meta name="google-site-verification" content="xxx"/>'
                  value={googleVerification}
                  onChange={(e) => setGoogleVerification(e.target.value)}
                  className="w-full h-14 px-4 bg-transparent border border-[#857371] focus:border-[#CC0000] rounded-[4px] text-xs font-mono text-[#1A1A1A] transition focus:outline-none placeholder-[#857371]/50"
                />
                <p className="text-[10px] text-[#534341]">
                  Paste verification meta tag. Get from{" "}
                  <a href="https://search.google.com/search-console" target="_blank" rel="noopener noreferrer" className="underline hover:text-[#CC0000] font-bold">
                    search.google.com/search-console
                  </a>
                </p>
              </div>

              {/* Bing Webmaster Tools */}
              <div className="space-y-1.5 pb-4 border-b border-[#857371]/10">
                <label className="text-[11px] font-bold text-[#CC0000] flex items-center gap-1.5 uppercase">
                  <span className="h-2 w-2 rounded-full bg-[#857371]" />
                  <span>Bing Webmaster Tools</span>
                </label>
                <input
                  type="text"
                  placeholder='<meta name="msvalidate.01" content="xxx"/>'
                  value={bingVerification}
                  onChange={(e) => setBingVerification(e.target.value)}
                  className="w-full h-14 px-4 bg-transparent border border-[#857371] focus:border-[#CC0000] rounded-[4px] text-xs font-mono text-[#1A1A1A] transition focus:outline-none placeholder-[#857371]/50"
                />
                <p className="text-[10px] text-[#534341]">
                  Paste verification meta tag. Get from{" "}
                  <a href="https://bing.com/webmasters" target="_blank" rel="noopener noreferrer" className="underline hover:text-[#CC0000] font-bold">
                    bing.com/webmasters
                  </a>
                </p>
              </div>

              {/* Yandex Webmaster */}
              <div className="space-y-1.5 pb-4 border-b border-[#857371]/10">
                <label className="text-[11px] font-bold text-[#CC0000] flex items-center gap-1.5 uppercase">
                  <span className="h-2 w-2 rounded-full bg-[#E0A900]" />
                  <span>Yandex Webmaster</span>
                </label>
                <input
                  type="text"
                  placeholder='<meta name="yandex-verification" content="xxx"/>'
                  value={yandexVerification}
                  onChange={(e) => setYandexVerification(e.target.value)}
                  className="w-full h-14 px-4 bg-transparent border border-[#857371] focus:border-[#CC0000] rounded-[4px] text-xs font-mono text-[#1A1A1A] transition focus:outline-none placeholder-[#857371]/50"
                />
                <p className="text-[10px] text-[#534341]">
                  Paste verification meta tag. Get from{" "}
                  <a href="https://webmaster.yandex.com" target="_blank" rel="noopener noreferrer" className="underline hover:text-[#CC0000] font-bold">
                    webmaster.yandex.com
                  </a>
                </p>
              </div>

              {/* Baidu Webmaster */}
              <div className="space-y-1.5 pb-4 border-b border-[#857371]/10">
                <label className="text-[11px] font-bold text-[#CC0000] flex items-center gap-1.5 uppercase">
                  <span className="h-2 w-2 rounded-full bg-orange-600" />
                  <span>Baidu Webmaster</span>
                </label>
                <input
                  type="text"
                  placeholder='<meta name="baidu-site-verification" content="xxx"/>'
                  value={baiduVerification}
                  onChange={(e) => setBaiduVerification(e.target.value)}
                  className="w-full h-14 px-4 bg-transparent border border-[#857371] focus:border-[#CC0000] rounded-[4px] text-xs font-mono text-[#1A1A1A] transition focus:outline-none placeholder-[#857371]/50"
                />
                <p className="text-[10px] text-[#534341]">
                  Paste verification meta tag. Get from{" "}
                  <a href="https://ziyuan.baidu.com" target="_blank" rel="noopener noreferrer" className="underline hover:text-[#CC0000] font-bold">
                    ziyuan.baidu.com
                  </a>
                </p>
              </div>

              {/* Pinterest Domain Claim */}
              <div className="space-y-1.5 pb-4">
                <label className="text-[11px] font-bold text-[#CC0000] flex items-center gap-1.5 uppercase">
                  <span className="h-2 w-2 rounded-full bg-red-600" />
                  <span>Pinterest Domain Claim</span>
                </label>
                <input
                  type="text"
                  placeholder='<meta name="p:domain_verify" content="xxx"/>'
                  value={pinterestVerification}
                  onChange={(e) => setPinterestVerification(e.target.value)}
                  className="w-full h-14 px-4 bg-transparent border border-[#857371] focus:border-[#CC0000] rounded-[4px] text-xs font-mono text-[#1A1A1A] transition focus:outline-none placeholder-[#857371]/50"
                />
                <p className="text-[10px] text-[#534341]">
                  Paste domain claim meta tag. Get from{" "}
                  <a href="https://pinterest.com/settings/claim" target="_blank" rel="noopener noreferrer" className="underline hover:text-[#CC0000] font-bold">
                    pinterest.com/settings/claim
                  </a>
                </p>
              </div>
            </div>
          )}

          {/* Action Footer for Form */}
          <div className="pt-6 border-t border-[#857371]/20 flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Status indicators */}
            <div className="text-xs">
              {status === "success" && (
                <div className="text-green-600 font-bold flex items-center gap-1.5">
                  <Check size={16} />
                  <span>Settings saved successfully!</span>
                </div>
              )}
              {status === "error" && (
                <div className="text-[#B3261E] font-bold flex items-center gap-1.5">
                  <AlertCircle size={16} />
                  <span>{errorMessage}</span>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="h-10 px-6 rounded-full bg-[#CC0000] hover:bg-[#CC0000]/92 active:bg-[#CC0000]/88 disabled:bg-gray-400 text-[#FFFFFF] font-semibold text-xs transition shadow w-full md:w-auto shrink-0 flex items-center justify-center gap-1.5"
            >
              {loading ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <span>Save All Changes</span>
              )}
            </button>
          </div>
        </form>

        {/* BOTTOM: Red logout button */}
        <div className="pt-6 border-t border-[#857371]/20 flex justify-between items-center">
          <span className="text-[10px] text-[#534341] font-mono">ID: {currentUser.id}</span>
          <button
            type="button"
            onClick={handleLogoutClick}
            className="inline-flex items-center gap-2 h-10 px-4 rounded-full border border-[#857371] hover:bg-[#CC0000]/8 text-[#CC0000] text-xs font-semibold transition"
          >
            <LogOut size={14} />
            <span>Log Out Account</span>
          </button>
        </div>

      </div>
    </div>
  );
}

export default SettingsView;
