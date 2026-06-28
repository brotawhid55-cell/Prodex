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
    <div className="space-y-8 max-w-4xl mx-auto px-4 py-6">
      {/* Profile Banner Card (Material 3 style) */}
      <div className="bg-[#FFF8F7] rounded-[28px] border border-[#857371]/20 p-6 md:p-8 shadow-sm relative overflow-hidden">
        <div className="absolute right-0 top-0 h-48 w-48 bg-[#CC0000]/5 rounded-full blur-3xl" />

        <div className="flex flex-col md:flex-row items-center md:items-start gap-6 relative z-10">
          {/* Avatar (56px circle - which matches h-14 w-14) */}
          <div className="relative shrink-0">
            <img
              src={subdomainUser?.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${subdomain}`}
              alt={subdomainUser?.display_name || subdomain}
              className="h-14 w-14 rounded-full object-cover border-2 border-[#857371]/30 bg-gray-50 shadow-sm"
            />
          </div>

          {/* Profile Details */}
          <div className="flex-1 text-center md:text-left space-y-3">
            <div className="space-y-1">
              <div className="flex flex-col md:flex-row md:items-center gap-2 justify-center md:justify-start">
                <h2 className="text-xl md:text-2xl font-bold text-[#1A1A1A] tracking-tight uppercase">
                  {subdomainUser?.display_name || subdomain}
                </h2>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-[#FFDAD6] text-[#CC0000] text-[10px] font-mono font-bold rounded-full uppercase tracking-wider mx-auto md:mx-0 w-fit">
                  <Globe size={10} />
                  Verified Store
                </span>
              </div>
              <span className="font-mono text-xs text-[#534341] lowercase">
                @{subdomain}
              </span>
            </div>

            <p className="text-sm text-[#534341] font-normal leading-relaxed max-w-2xl">
              {subdomainUser?.bio || "No biography details configured yet."}
            </p>

            {/* Quick Stats Row & Assist Chip */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
              {/* Stats pill (Surface Variant) */}
              <div className="inline-flex items-center px-4 py-1.5 bg-[#F5DDDB] text-[#534341] text-xs font-semibold rounded-full shadow-xs">
                Posts: <span className="text-[#CC0000] ml-1">{posts.length}</span>
              </div>

              {/* Assist Chip: outlined, 8px radius */}
              <button 
                onClick={copyStoreLink}
                className="inline-flex items-center gap-1.5 h-8 px-3 border border-[#857371] hover:bg-[#CC0000]/8 active:bg-[#CC0000]/12 text-[#1A1A1A] text-xs font-medium rounded-[8px] transition active:scale-95"
              >
                {copiedStoreLink ? (
                  <>
                    <Check size={12} className="text-green-600 animate-pulse" />
                    <span className="text-green-700 font-bold">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy size={12} className="text-[#CC0000]" />
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
              className="flex items-center gap-2 h-10 px-5 bg-[#CC0000] hover:bg-[#CC0000]/92 active:bg-[#CC0000]/88 text-[#FFFFFF] font-bold text-xs rounded-full transition shadow md:self-start"
            >
              <Settings size={14} />
              <span>Customize Store</span>
            </button>
          )}
        </div>
      </div>

      {/* Owner-Only Google Search Console Head Injection tool */}
      {isOwner && (
        <div className="bg-[#FFF8F7] rounded-[28px] border border-dashed border-[#CC0000]/30 p-5 md:p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="bg-[#FFDAD6] p-2.5 rounded-xl text-[#CC0000]">
              <ShieldCheck size={20} />
            </div>
            <div>
              <h3 className="font-bold text-sm uppercase tracking-tight text-[#1A1A1A]">
                Google Search Console Head Verification
              </h3>
              <p className="text-[11px] text-[#534341] font-normal leading-relaxed">
                Claim your domain's indexing directly! The HTML tag will appear in your profile's <code className="font-mono bg-[#F5DDDB] px-1 py-0.5 rounded text-[#410002]">&lt;head&gt;</code> source automatically.
              </p>
            </div>
          </div>

          <form onSubmit={handleSaveVerificationTag} className="flex flex-col md:flex-row gap-3 items-end">
            <div className="flex-1 w-full space-y-1.5 text-left">
              <label className="text-[10px] font-mono font-bold text-[#857371] uppercase">
                Verification Meta Tag From Google
              </label>
              {/* Outlined Text Field */}
              <textarea
                placeholder='<meta name="google-site-verification" content="xxx"/>'
                value={verificationTag}
                onChange={(e) => setVerificationTag(e.target.value)}
                className="w-full px-4 py-3 bg-transparent border border-[#857371] focus:border-[#CC0000] rounded-[4px] text-xs font-mono text-[#1A1A1A] transition focus:outline-none min-h-[56px] placeholder-[#857371]/60"
              />
            </div>
            
            <button
              type="submit"
              disabled={savingTag}
              className="h-10 px-5 bg-[#CC0000] hover:bg-[#CC0000]/92 active:bg-[#CC0000]/88 disabled:bg-gray-400 text-[#FFFFFF] font-bold text-xs rounded-full transition shadow shrink-0 flex items-center justify-center gap-1.5 w-full md:w-auto"
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
        {/* CURATED REVIEWS Section Header: Label Large, On Surface Variant */}
        <h3 className="text-sm font-semibold text-[#534341] uppercase tracking-wider border-b border-[#857371]/20 pb-3 flex items-center gap-2">
          <ShoppingBag size={16} className="text-[#CC0000]" />
          <span>CURATED REVIEWS</span>
        </h3>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <Loader2 className="animate-spin text-[#CC0000]" size={36} />
            <span className="text-xs font-mono font-bold text-[#534341] uppercase">
              Fetching store items...
            </span>
          </div>
        ) : posts.length === 0 ? (
          <div className="bg-[#FFF8F7] border border-[#857371]/20 rounded-[28px] p-12 text-center max-w-sm mx-auto space-y-4 shadow-xs">
            <div className="bg-[#F5DDDB] text-[#534341] p-4 rounded-full w-fit mx-auto">
              <Globe size={24} />
            </div>
            <div>
              <h4 className="font-bold text-[#1A1A1A]">No items listed</h4>
              <p className="text-xs text-[#534341] mt-1">
                {isOwner 
                  ? "You haven't posted any curated items yet. Click create post to start!" 
                  : "This curator hasn't listed any recommendations yet."}
              </p>
            </div>
            {isOwner && (
              <button
                onClick={() => onNavigate("/create-post")}
                className="h-10 px-5 rounded-full bg-[#CC0000] hover:bg-[#CC0000]/92 text-[#FFFFFF] font-bold text-xs transition shadow"
              >
                Create First Post
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 animate-fade-in">
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
