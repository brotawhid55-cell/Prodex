import React, { useState, useEffect } from "react";
import { StarRating } from "./StarRating.tsx";
import { PostCard, Post } from "./PostCard.tsx";
import { Copy, Check, ShieldCheck, ExternalLink, Globe, Key, Settings, Loader2, AlertCircle, ShoppingBag } from "lucide-react";
import { motion } from "motion/react";

interface ProfileViewProps {
  subdomain: string;
  subdomainUser: any;
  currentUser: any;
  onNavigateToPost: (username: string, slug: string) => void;
  onNavigate: (path: string) => void;
  onRefreshContext: () => void;
}

export function ProfileView({
  subdomain,
  subdomainUser,
  currentUser,
  onNavigateToPost,
  onNavigate,
  onRefreshContext
}: ProfileViewProps) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [verificationTag, setVerificationTag] = useState(subdomainUser?.search_console_meta_tag || "");
  const [savingTag, setSavingTag] = useState(false);
  const [tagStatus, setTagStatus] = useState<"idle" | "success" | "error">("idle");
  const [copiedStoreLink, setCopiedStoreLink] = useState(false);

  const isOwner = currentUser && currentUser.username.toLowerCase() === subdomain.toLowerCase();

  const fetchProfilePosts = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/posts?username=${subdomain}`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setPosts(data);
      }
    } catch (err) {
      console.error("Error fetching profile posts:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfilePosts();
  }, [subdomain]);

  const handleSaveVerificationTag = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingTag(true);
    setTagStatus("idle");
    try {
      const res = await fetch("/api/user/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ search_console_meta_tag: verificationTag })
      });
      const data = await res.json();
      if (res.ok) {
        setTagStatus("success");
        onRefreshContext();
      } else {
        setTagStatus("error");
      }
    } catch {
      setTagStatus("error");
    } finally {
      setSavingTag(false);
    }
  };

  const copyStoreLink = () => {
    const storeUrl = `${window.location.protocol}//${subdomain}.trodex.com/`;
    navigator.clipboard.writeText(storeUrl);
    setCopiedStoreLink(true);
    setTimeout(() => setCopiedStoreLink(false), 2000);
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 md:px-8 py-6">
      {/* Profile Banner Card */}
      <div className="bg-white rounded-3xl border border-gray-100 p-6 md:p-10 shadow-sm relative overflow-hidden">
        {/* Subtle Brand Background Accent */}
        <div className="absolute right-0 top-0 h-48 w-48 bg-red-500/5 rounded-full blur-3xl" />

        <div className="flex flex-col md:flex-row items-center md:items-start gap-6 md:gap-8 relative z-10">
          {/* Avatar with Custom Ring */}
          <div className="relative group">
            <div className="absolute -inset-1.5 bg-gradient-to-tr from-[#CC0000] to-orange-500 rounded-3xl blur opacity-30 group-hover:opacity-40 transition" />
            <img
              src={subdomainUser?.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${subdomain}`}
              alt={subdomainUser?.display_name || subdomain}
              className="relative h-24 w-24 md:h-28 md:w-28 rounded-2xl object-cover border-4 border-white shadow-md bg-gray-50"
            />
          </div>

          {/* Profile Details */}
          <div className="flex-1 text-center md:text-left space-y-4">
            <div className="space-y-1">
              <div className="flex flex-col md:flex-row md:items-center gap-2 justify-center md:justify-start">
                <h2 className="text-2xl md:text-3xl font-black text-[#1A1A1A] tracking-tight uppercase">
                  {subdomainUser?.display_name || subdomain}
                </h2>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-red-100 text-[#CC0000] text-[10px] font-mono font-bold rounded-full uppercase tracking-wider mx-auto md:mx-0 w-fit">
                  <Globe size={10} className="animate-spin-slow" />
                  Verified Store
                </span>
              </div>
              <span className="font-mono text-xs font-bold text-gray-400 lowercase">
                @{subdomain}
              </span>
            </div>

            <p className="text-sm text-gray-600 font-medium font-sans max-w-2xl leading-relaxed">
              {subdomainUser?.bio || "No biography details configured yet."}
            </p>

            {/* Quick Stats Bar */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-xs font-mono font-bold text-[#1A1A1A] bg-gray-50 p-3 rounded-xl border border-gray-100 w-fit">
              <div>
                Posts: <span className="text-[#CC0000]">{posts.length}</span>
              </div>
              <span className="text-gray-300">|</span>
              <button 
                onClick={copyStoreLink}
                className="flex items-center gap-1 hover:text-[#CC0000] transition active:scale-95"
              >
                {copiedStoreLink ? (
                  <>
                    <Check size={14} className="text-green-500" />
                    <span className="text-green-600 font-black">Copied link!</span>
                  </>
                ) : (
                  <>
                    <Copy size={14} />
                    <span>Store: {subdomain}.trodex.com</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Owner Fast Settings Button */}
          {isOwner && (
            <button
              onClick={() => onNavigate("/settings")}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-[#1A1A1A] hover:bg-gray-800 text-white font-bold text-xs rounded-xl transition shadow-md md:self-start"
            >
              <Settings size={14} />
              <span>Customize Store</span>
            </button>
          )}
        </div>
      </div>

      {/* Owner-Only Google Search Console Head Injection tool */}
      {isOwner && (
        <div className="bg-white rounded-2xl border border-dashed border-red-200 p-5 md:p-6 space-y-4">
          <div className="flex items-center gap-2">
            <div className="bg-red-50 p-2 rounded-xl text-[#CC0000]">
              <ShieldCheck size={20} />
            </div>
            <div>
              <h3 className="font-black text-sm uppercase tracking-tight text-[#1A1A1A]">
                Google Search Console Head Verification
              </h3>
              <p className="text-[11px] text-gray-500 font-medium font-sans">
                Claim your domain's indexing directly! The HTML tag will appear in your profile's <code className="font-mono bg-gray-100 px-1 py-0.5 rounded">&lt;head&gt;</code> source automatically.
              </p>
            </div>
          </div>

          <form onSubmit={handleSaveVerificationTag} className="flex flex-col md:flex-row gap-3 items-end">
            <div className="flex-1 w-full space-y-1.5">
              <label className="text-[10px] font-mono font-bold text-gray-400 uppercase">
                Verification Meta Tag From Google
              </label>
              <textarea
                placeholder='<meta name="google-site-verification" content="xxx"/>'
                value={verificationTag}
                onChange={(e) => setVerificationTag(e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-50 border-2 border-gray-100 focus:border-[#CC0000] focus:bg-white rounded-xl text-xs font-mono text-gray-700 transition focus:outline-none min-h-[50px]"
              />
            </div>
            
            <button
              type="submit"
              disabled={savingTag}
              className="px-5 py-3 bg-[#CC0000] hover:bg-[#E60000] disabled:bg-gray-400 text-white font-bold text-xs rounded-xl transition shadow-md w-full md:w-auto shrink-0 flex items-center justify-center gap-1.5"
            >
              {savingTag ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Key size={14} />
                  <span>Verify Subdomain</span>
                </>
              )}
            </button>
          </form>

          {tagStatus === "success" && (
            <div className="text-[11px] font-bold text-green-600 flex items-center gap-1">
              <Check size={14} />
              <span>Tag updated successfully! It is now rendering live in your page source.</span>
            </div>
          )}

          {tagStatus === "error" && (
            <div className="text-[11px] font-bold text-red-600 flex items-center gap-1">
              <AlertCircle size={14} />
              <span>Failed to save search console tag. Try again.</span>
            </div>
          )}
        </div>
      )}

      {/* Grid of posts */}
      <div className="space-y-6">
        <h3 className="text-xl font-black text-[#1A1A1A] tracking-tight uppercase border-b border-gray-100 pb-3 flex items-center gap-2">
          <ShoppingBag size={18} className="text-[#CC0000]" />
          <span>Curated Reviews</span>
        </h3>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <Loader2 className="animate-spin text-[#CC0000]" size={36} />
            <span className="text-xs font-mono font-bold text-gray-500 uppercase">
              Fetching store items...
            </span>
          </div>
        ) : posts.length === 0 ? (
          <div className="bg-white border border-gray-100 rounded-2xl p-12 text-center max-w-sm mx-auto space-y-4">
            <div className="bg-gray-50 text-gray-400 p-4 rounded-full w-fit mx-auto">
              <Globe size={24} />
            </div>
            <div>
              <h4 className="font-bold text-[#1A1A1A]">No items listed</h4>
              <p className="text-xs text-gray-500 font-sans mt-1">
                {isOwner 
                  ? "You haven't posted any curated items yet. Click create post to start!" 
                  : "This curator hasn't listed any recommendations yet."}
              </p>
            </div>
            {isOwner && (
              <button
                onClick={() => onNavigate("/create-post")}
                className="px-4 py-2 bg-[#CC0000] hover:bg-[#E60000] text-white font-bold text-xs rounded-xl transition"
              >
                Create First Post
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 animate-fade-in">
            {posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                username={subdomain}
                onNavigateToPost={(slug) => onNavigateToPost(subdomain, slug)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
export default ProfileView;
