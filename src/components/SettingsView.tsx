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
        <span className="text-xs font-mono font-bold text-gray-400 uppercase tracking-widest block">
          Checking account details...
        </span>
      </div>
    );
  }

  // Resolve custom or fallback avatar URL
  const fallbackAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(
    currentUser.username
  )}&background=CC0000&color=fff&size=128`;
  const resolvedAvatar = avatarUrl.trim() || fallbackAvatar;

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
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 md:p-8 space-y-6">
        
        {/* Title Heading */}
        <div className="border-b border-gray-100 pb-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-2xl md:text-3xl font-black text-[#1A1A1A] tracking-tight uppercase flex items-center gap-2">
              <Settings className="text-[#CC0000]" />
              <span>Store Settings</span>
            </h2>
            <p className="text-xs text-gray-500 font-medium font-sans">
              Update your store appearance, profile details, and search engine verifications.
            </p>
          </div>

          {/* Subdomain highlight info card */}
          <div className="bg-red-50 p-3 rounded-2xl border border-red-100 font-mono text-xs font-bold text-[#CC0000]">
            Your Store: <span className="underline">{currentUser.username}.trodex.com</span>
          </div>
        </div>

        {/* Tab Selection buttons */}
        <div className="flex border-b border-gray-100">
          <button
            type="button"
            onClick={() => {
              setActiveTab("profile");
              setStatus("idle");
            }}
            className={`flex-1 py-3 text-center text-xs font-black uppercase tracking-wider transition-all border-b-2 ${
              activeTab === "profile"
                ? "border-[#CC0000] text-[#CC0000]"
                : "border-transparent text-gray-400 hover:text-[#1A1A1A]"
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
            className={`flex-1 py-3 text-center text-xs font-black uppercase tracking-wider transition-all border-b-2 ${
              activeTab === "verification"
                ? "border-[#CC0000] text-[#CC0000]"
                : "border-transparent text-gray-400 hover:text-[#1A1A1A]"
            }`}
          >
            Search Engine Verification
          </button>
        </div>

        {/* Update Form */}
        <form onSubmit={handleSave} className="space-y-6">
          
          {activeTab === "profile" ? (
            /* TAB 1: Store Profile */
            <div className="space-y-4 max-w-xl">
              <h3 className="font-black text-sm uppercase tracking-wider text-gray-400 flex items-center gap-1.5 border-b border-gray-50 pb-2">
                <User size={16} />
                <span>Store Profile Info</span>
              </h3>

              {/* Avatar URL + live preview */}
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
                
                {/* Avatar Preview block */}
                <div className="flex items-center gap-3 pt-2 bg-gray-50 p-3 rounded-2xl border border-gray-100">
                  <img
                    src={resolvedAvatar}
                    alt="Avatar Preview"
                    className="h-16 w-16 rounded-2xl object-cover border-2 border-white shadow-md bg-white shrink-0"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = fallbackAvatar;
                    }}
                  />
                  <div>
                    <span className="text-xs font-bold text-[#1A1A1A] block">Avatar Live Preview</span>
                    <span className="text-[10px] text-gray-400 font-mono">
                      {avatarUrl ? "Using custom URL" : "Using UI Avatars placeholder fallback"}
                    </span>
                  </div>
                </div>
              </div>

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

              {/* Readonly subdomain preview */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#1A1A1A] uppercase">
                  Your Store URL (Readonly Preview)
                </label>
                <input
                  type="text"
                  value={`${currentUser.username}.trodex.com`}
                  readOnly
                  className="w-full px-4 py-3 bg-gray-100 border-2 border-gray-200 text-gray-500 rounded-xl text-xs font-mono select-all focus:outline-none cursor-default"
                />
              </div>
            </div>
          ) : (
            /* TAB 2: Search Engine Verification */
            <div className="space-y-6 max-w-xl">
              <div className="bg-blue-50 border border-blue-100 p-4 rounded-2xl space-y-1">
                <h4 className="font-bold text-xs uppercase text-blue-700 flex items-center gap-1">
                  <ShieldCheck size={14} />
                  <span>Meta Verification Instructions</span>
                </h4>
                <p className="text-[11px] text-blue-600/95 leading-relaxed">
                  Paste your verification meta tags below. They will appear in your store's <code className="bg-blue-100 px-1 py-0.5 rounded font-mono text-[10px]">&lt;head&gt;</code> automatically, allowing search engines to verify your subdomain.
                </p>
              </div>

              {/* 🔴 Google Search Console */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#1A1A1A] flex items-center gap-1.5 uppercase">
                  <span className="h-2 w-2 rounded-full bg-red-600" />
                  <span>Google Search Console</span>
                </label>
                <input
                  type="text"
                  placeholder='<meta name="google-site-verification" content="xxx"/>'
                  value={googleVerification}
                  onChange={(e) => setGoogleVerification(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 border-2 border-gray-200/80 focus:border-[#CC0000] focus:bg-white rounded-xl text-xs font-mono text-gray-700 transition focus:outline-none"
                />
                <p className="text-[10px] text-gray-400 font-sans">
                  Paste verification meta tag. Get from{" "}
                  <a href="https://search.google.com/search-console" target="_blank" rel="noopener noreferrer" className="underline hover:text-[#CC0000] font-bold">
                    search.google.com/search-console
                  </a>
                </p>
              </div>

              {/* 🔵 Bing Webmaster Tools */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#1A1A1A] flex items-center gap-1.5 uppercase">
                  <span className="h-2 w-2 rounded-full bg-blue-600" />
                  <span>Bing Webmaster Tools</span>
                </label>
                <input
                  type="text"
                  placeholder='<meta name="msvalidate.01" content="xxx"/>'
                  value={bingVerification}
                  onChange={(e) => setBingVerification(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 border-2 border-gray-200/80 focus:border-[#CC0000] focus:bg-white rounded-xl text-xs font-mono text-gray-700 transition focus:outline-none"
                />
                <p className="text-[10px] text-gray-400 font-sans">
                  Paste verification meta tag. Get from{" "}
                  <a href="https://bing.com/webmasters" target="_blank" rel="noopener noreferrer" className="underline hover:text-[#CC0000] font-bold">
                    bing.com/webmasters
                  </a>
                </p>
              </div>

              {/* 🟡 Yandex Webmaster */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#1A1A1A] flex items-center gap-1.5 uppercase">
                  <span className="h-2 w-2 rounded-full bg-yellow-500" />
                  <span>Yandex Webmaster</span>
                </label>
                <input
                  type="text"
                  placeholder='<meta name="yandex-verification" content="xxx"/>'
                  value={yandexVerification}
                  onChange={(e) => setYandexVerification(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 border-2 border-gray-200/80 focus:border-[#CC0000] focus:bg-white rounded-xl text-xs font-mono text-gray-700 transition focus:outline-none"
                />
                <p className="text-[10px] text-gray-400 font-sans">
                  Paste verification meta tag. Get from{" "}
                  <a href="https://webmaster.yandex.com" target="_blank" rel="noopener noreferrer" className="underline hover:text-[#CC0000] font-bold">
                    webmaster.yandex.com
                  </a>
                </p>
              </div>

              {/* 🟠 Baidu Webmaster */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#1A1A1A] flex items-center gap-1.5 uppercase">
                  <span className="h-2 w-2 rounded-full bg-orange-500" />
                  <span>Baidu Webmaster</span>
                </label>
                <input
                  type="text"
                  placeholder='<meta name="baidu-site-verification" content="xxx"/>'
                  value={baiduVerification}
                  onChange={(e) => setBaiduVerification(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 border-2 border-gray-200/80 focus:border-[#CC0000] focus:bg-white rounded-xl text-xs font-mono text-gray-700 transition focus:outline-none"
                />
                <p className="text-[10px] text-gray-400 font-sans">
                  Paste verification meta tag. Get from{" "}
                  <a href="https://ziyuan.baidu.com" target="_blank" rel="noopener noreferrer" className="underline hover:text-[#CC0000] font-bold">
                    ziyuan.baidu.com
                  </a>
                </p>
              </div>

              {/* 🌐 Pinterest Domain Claim */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#1A1A1A] flex items-center gap-1.5 uppercase">
                  <span className="h-2 w-2 rounded-full bg-red-500" />
                  <span>Pinterest Domain Claim</span>
                </label>
                <input
                  type="text"
                  placeholder='<meta name="p:domain_verify" content="xxx"/>'
                  value={pinterestVerification}
                  onChange={(e) => setPinterestVerification(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 border-2 border-gray-200/80 focus:border-[#CC0000] focus:bg-white rounded-xl text-xs font-mono text-gray-700 transition focus:outline-none"
                />
                <p className="text-[10px] text-gray-400 font-sans">
                  Paste domain claim meta tag. Get from{" "}
                  <a href="https://pinterest.com/settings/claim" target="_blank" rel="noopener noreferrer" className="underline hover:text-[#CC0000] font-bold">
                    pinterest.com/settings/claim
                  </a>
                </p>
              </div>
            </div>
          )}

          {/* Action Footer for Form */}
          <div className="pt-6 border-t border-gray-100 flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Status indicators */}
            <div className="text-xs">
              {status === "success" && (
                <div className="text-green-600 font-bold flex items-center gap-1">
                  <Check size={16} />
                  <span>Settings saved successfully!</span>
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
                <span>Save All Changes</span>
              )}
            </button>
          </div>
        </form>

        {/* BOTTOM: Red logout button */}
        <div className="pt-6 border-t border-gray-100 flex justify-between items-center">
          <span className="text-[10px] text-gray-400 font-mono">ID: {currentUser.id}</span>
          <button
            type="button"
            onClick={handleLogoutClick}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-red-50 hover:bg-red-600 hover:text-white text-[#CC0000] text-xs font-bold uppercase tracking-wider rounded-xl transition-all"
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
