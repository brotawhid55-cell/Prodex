"use client";

import React, { useState, useEffect } from "react";
import { Header } from "./Header.tsx";
import { BottomNav } from "./BottomNav.tsx";
import { FeedView } from "./FeedView.tsx";
import { ProfileView } from "./ProfileView.tsx";
import { PostView } from "./PostView.tsx";
import { CreatePostView } from "./CreatePostView.tsx";
import { SettingsView } from "./SettingsView.tsx";
import { AuthView } from "./AuthView.tsx";
import { motion, AnimatePresence } from "motion/react";
import { Loader2, Store } from "lucide-react";

export function ClientApp() {
  const [currentPath, setCurrentPath] = useState("/");
  const [subdomain, setSubdomain] = useState<string | null>(null);
  const [subdomainUser, setSubdomainUser] = useState<any | null>(null);
  const [currentUser, setCurrentUser] = useState<any | null>(null);
  const [isUsingNeon, setIsUsingNeon] = useState(false);
  const [loadingContext, setLoadingContext] = useState(true);
  const [dbError, setDbError] = useState<string | null>(null);

  useEffect(() => {
    setCurrentPath(window.location.pathname);
    const handlePopState = () => setCurrentPath(window.location.pathname);
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const navigateTo = (path: string) => {
    window.history.pushState({}, "", path);
    setCurrentPath(path);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const fetchContext = async () => {
    try {
      const res = await fetch("/api/context");
      const data = await res.json();
      setSubdomain(data.subdomain);
      setSubdomainUser(data.subdomainUser);
      setCurrentUser(data.currentUser);
      setIsUsingNeon(data.isUsingNeon);
      setDbError(data.error || null);
    } catch (err: any) {
      setDbError(err.message || "Failed to contact API.");
    } finally {
      setLoadingContext(false);
    }
  };

  useEffect(() => {
    fetchContext();
  }, [currentPath]);

  // ─── FIX: Clear simulation cookie properly ───────────────────
  const clearSubdomain = async () => {
    setLoadingContext(true);
    try {
      await fetch("/api/simulate-subdomain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subdomain: null }),
      });
      setSubdomain(null);
      setSubdomainUser(null);
      window.history.pushState({}, "", "/");
      setCurrentPath("/");
      await fetchContext();
    } catch (err) {
      setLoadingContext(false);
    }
  };

  const handleSimulateSubdomain = async (sub: string | null) => {
    if (!sub) { await clearSubdomain(); return; }
    setLoadingContext(true);
    try {
      await fetch("/api/simulate-subdomain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subdomain: sub }),
      });
      window.history.pushState({}, "", "/");
      setCurrentPath("/");
      await fetchContext();
    } catch (err) {
      setLoadingContext(false);
    }
  };

  // ─── FIX: Logout also clears subdomain simulation ────────────
  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      // Clear subdomain simulation cookie too
      await fetch("/api/simulate-subdomain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subdomain: null }),
      });
      setCurrentUser(null);
      setSubdomain(null);
      setSubdomainUser(null);
      navigateTo("/");
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  const handleProfileClick = () => {
    if (currentUser) {
      handleSimulateSubdomain(currentUser.username);
    } else {
      navigateTo("/login");
    }
  };

  const isPostRoute = currentPath.startsWith("/post/");
  const postSlug = isPostRoute ? currentPath.replace("/post/", "") : "";

  return (
    <div className="min-h-screen bg-[#FFF8F7] text-[#1A1A1A] font-sans flex flex-col justify-between pb-16 md:pb-0">
      <Header
        currentPath={currentPath}
        currentSubdomain={subdomain}
        subdomainUser={subdomainUser}
        currentUser={currentUser}
        onNavigate={navigateTo}
        onLogout={handleLogout}
        onClearSubdomain={clearSubdomain}
      />

      <main className="flex-1 w-full max-w-7xl mx-auto py-4">
        {loadingContext ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <Loader2 className="animate-spin text-[#CC0000]" size={42} />
            <span className="text-xs font-mono font-bold text-[#534341] uppercase tracking-widest">
              Loading...
            </span>
          </div>
        ) : dbError ? (
          <div className="max-w-2xl mx-auto my-8 p-6 bg-[#FFF8F7] rounded-[28px] shadow-sm border border-[#857371]/30">
            <h2 className="text-xl font-bold mb-3">Database Error</h2>
            <p className="text-sm text-[#534341] font-mono bg-[#EDEDED]/50 p-4 rounded-xl mb-4">{dbError}</p>
            <p className="text-xs text-[#534341]">Add your DATABASE_URL to Vercel Environment Variables.</p>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={subdomain ? `sub-${subdomain}-${currentPath}` : `main-${currentPath}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.15 }}
              className="w-full"
            >
              {subdomain ? (
                subdomainUser ? (
                  isPostRoute ? (
                    <PostView
                      subdomain={subdomain}
                      slug={postSlug}
                      onNavigateBack={() => navigateTo("/")}
                    />
                  ) : (
                    <ProfileView
                      subdomain={subdomain}
                      subdomainUser={subdomainUser}
                      currentUser={currentUser}
                      onNavigateToPost={(username, slug) => navigateTo(`/post/${slug}`)}
                      onNavigate={navigateTo}
                      onRefreshContext={fetchContext}
                    />
                  )
                ) : (
                  <div className="max-w-md mx-auto py-20 text-center space-y-4">
                    <div className="bg-[#FFDAD6] text-[#CC0000] p-4 rounded-full w-fit mx-auto">
                      <Store size={32} />
                    </div>
                    <h3 className="text-xl font-bold uppercase">Store Not Found</h3>
                    <p className="text-xs text-[#534341]">
                      <span className="font-bold">@{subdomain}</span> has not been registered yet.
                    </p>
                    <button
                      onClick={clearSubdomain}
                      className="h-10 px-6 rounded-full border border-[#857371] text-[#1A1A1A] text-xs font-semibold"
                    >
                      Return to Main Feed
                    </button>
                  </div>
                )
              ) : (
                (() => {
                  switch (currentPath) {
                    case "/":
                      return (
                        <FeedView
                          onNavigateToPost={(username, slug) => {
                            handleSimulateSubdomain(username).then(() => navigateTo(`/post/${slug}`));
                          }}
                          onNavigate={navigateTo}
                        />
                      );
                    case "/login":
                      return (
                        <AuthView
                          initialMode="login"
                          onAuthSuccess={() => fetchContext().then(() => navigateTo("/settings"))}
                        />
                      );
                    case "/register":
                      return (
                        <AuthView
                          initialMode="register"
                          onAuthSuccess={() => fetchContext().then(() => navigateTo("/settings"))}
                        />
                      );
                    case "/create-post":
                      return currentUser ? (
                        <CreatePostView
                          onNavigate={navigateTo}
                          onPostCreated={() => navigateTo("/settings")}
                        />
                      ) : (
                        <AuthView
                          initialMode="login"
                          onAuthSuccess={() => fetchContext().then(() => navigateTo("/create-post"))}
                        />
                      );
                    case "/settings":
                      return currentUser ? (
                        <SettingsView
                          currentUser={currentUser}
                          onNavigate={navigateTo}
                          onRefreshContext={fetchContext}
                        />
                      ) : (
                        <AuthView
                          initialMode="login"
                          onAuthSuccess={() => fetchContext().then(() => navigateTo("/settings"))}
                        />
                      );
                    case "/about":
                      return (
                        <div className="max-w-2xl mx-auto bg-[#FFF8F7] p-6 md:p-8 rounded-[28px] border border-[#857371]/20 shadow-sm space-y-4">
                          <h2 className="text-2xl font-bold uppercase">About <span className="text-[#CC0000]">Trodex</span></h2>
                          <p className="text-sm text-[#534341] leading-relaxed">
                            Trodex is an SEO-first product marketing platform for e-commerce sellers.
                            Every user gets a personal subdomain that can be verified in Google Search Console,
                            Bing, Yandex, Baidu, and Pinterest — giving sellers real SEO ownership.
                          </p>
                        </div>
                      );
                    case "/privacy":
                      return (
                        <div className="max-w-2xl mx-auto bg-[#FFF8F7] p-6 md:p-8 rounded-[28px] border border-[#857371]/20 shadow-sm space-y-4">
                          <h2 className="text-2xl font-bold uppercase">Privacy <span className="text-[#CC0000]">Policy</span></h2>
                          <p className="text-sm text-[#534341] leading-relaxed">
                            We collect only what is necessary: email, username, and posts.
                            Your posts are publicly indexed by search engines.
                            We do not sell your data to third parties.
                          </p>
                        </div>
                      );
                    case "/terms":
                      return (
                        <div className="max-w-2xl mx-auto bg-[#FFF8F7] p-6 md:p-8 rounded-[28px] border border-[#857371]/20 shadow-sm space-y-4">
                          <h2 className="text-2xl font-bold uppercase">Terms of <span className="text-[#CC0000]">Service</span></h2>
                          <p className="text-sm text-[#534341] leading-relaxed">
                            By using Trodex you agree not to post illegal content, spam, or fraudulent reviews.
                            Trodex reserves the right to remove content that violates these terms.
                          </p>
                        </div>
                      );
                    default:
                      return (
                        <div className="text-center py-20 space-y-3">
                          <h2 className="text-2xl font-bold uppercase">Page Not Found</h2>
                          <button
                            onClick={() => navigateTo("/")}
                            className="h-10 px-6 rounded-full bg-[#CC0000] text-white font-semibold text-xs"
                          >
                            Go Home
                          </button>
                        </div>
                      );
                  }
                })()
              )}
            </motion.div>
          </AnimatePresence>
        )}
      </main>

      <footer className="w-full bg-[#EDEDED] border-t border-[#857371]/20 text-[#534341] py-6 px-4 mt-12 mb-16 md:mb-0">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-semibold">
          <div>&copy; {new Date().getFullYear()} Trodex. All rights reserved.</div>
          <div className="flex items-center gap-6">
            <button onClick={() => navigateTo("/about")} className="hover:text-[#CC0000] transition">About</button>
            <button onClick={() => navigateTo("/privacy")} className="hover:text-[#CC0000] transition">Privacy</button>
            <button onClick={() => navigateTo("/terms")} className="hover:text-[#CC0000] transition">Terms</button>
          </div>
        </div>
      </footer>

      <BottomNav
        currentPath={currentPath}
        isLoggedIn={!!currentUser}
        onNavigate={navigateTo}
        onProfileClick={handleProfileClick}
      />
    </div>
  );
}

export default ClientApp;
