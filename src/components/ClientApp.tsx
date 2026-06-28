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
  
  // Context states from server
  const [subdomain, setSubdomain] = useState<string | null>(null);
  const [subdomainUser, setSubdomainUser] = useState<any | null>(null);
  const [currentUser, setCurrentUser] = useState<any | null>(null);
  const [isUsingNeon, setIsUsingNeon] = useState(false);
  const [loadingContext, setLoadingContext] = useState(true);
  const [dbError, setDbError] = useState<string | null>(null);

  // Sync state with back button popstate & set initial path on mount safely
  useEffect(() => {
    setCurrentPath(window.location.pathname);

    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
    };
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
      if (data.error) {
        setDbError(data.error);
      } else {
        setDbError(null);
      }
    } catch (err: any) {
      console.error("Error loading full-stack context:", err);
      setDbError(err.message || "Failed to contact local API server.");
    } finally {
      setLoadingContext(false);
    }
  };

  useEffect(() => {
    fetchContext();
  }, [currentPath]);

  const handleSimulateSubdomain = async (sub: string | null) => {
    setLoadingContext(true);
    try {
      await fetch("/api/simulate-subdomain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subdomain: sub })
      });
      // Redirect to home and refresh
      window.history.pushState({}, "", "/");
      setCurrentPath("/");
      await fetchContext();
    } catch (err) {
      console.error("Error simulating subdomain:", err);
      setLoadingContext(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      setCurrentUser(null);
      navigateTo("/");
    } catch (err) {
      console.error("Error logging out:", err);
    }
  };

  const handleProfileClick = () => {
    if (currentUser) {
      handleSimulateSubdomain(currentUser.username);
    } else {
      navigateTo("/login");
    }
  };

  // Extract slug parameters from path
  const isPostRoute = currentPath.startsWith("/post/");
  const postSlug = isPostRoute ? currentPath.replace("/post/", "") : "";

  return (
    <div className="min-h-screen bg-[#F5F0EB] text-[#1A1A1A] font-sans flex flex-col justify-between pb-16 md:pb-0">
      
      {/* Header component */}
      <Header
        currentPath={currentPath}
        currentSubdomain={subdomain}
        subdomainUser={subdomainUser}
        currentUser={currentUser}
        onNavigate={navigateTo}
        onLogout={handleLogout}
      />

      {/* Main Content Stage */}
      <main className="flex-1 w-full max-w-7xl mx-auto py-4">
        {loadingContext ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <Loader2 className="animate-spin text-[#CC0000]" size={42} />
            <span className="text-xs font-mono font-bold text-gray-500 uppercase tracking-widest">
              Initializing Trodex Environment...
            </span>
          </div>
        ) : dbError ? (
          <div className="max-w-2xl mx-auto my-8 p-6 md:p-8 bg-[#1A1A1A] text-white rounded-2xl shadow-xl border border-red-900/40">
            <div className="flex items-center gap-3 mb-4">
              <span className="flex items-center justify-center bg-red-600/25 p-2 rounded-lg text-[#CC0000] font-bold text-lg">⚠️</span>
              <h2 className="text-xl font-bold tracking-tight text-white">Database Connection Required</h2>
            </div>
            <p className="text-gray-300 text-sm leading-relaxed mb-6 whitespace-pre-line bg-black/40 p-4 rounded-xl border border-white/5 font-mono">
              {dbError}
            </p>
            <div className="border-t border-gray-800 pt-6">
              <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-3">How to Resolve This:</h3>
              <ol className="space-y-3 text-xs text-gray-400 list-decimal pl-4">
                <li>Go to <a href="https://neon.tech" target="_blank" rel="noopener noreferrer" className="text-[#CC0000] underline hover:text-red-400">neon.tech</a> and create a free PostgreSQL database.</li>
                <li>Copy the connection string (pooled connection string is recommended).</li>
                <li>Add it as <code className="bg-gray-800 text-gray-200 px-1.5 py-0.5 rounded font-mono text-[11px]">DATABASE_URL</code> to your environment variables (in <code className="bg-gray-800 text-gray-200 px-1.5 py-0.5 rounded font-mono text-[11px]">.env.local</code> for local dev, or in Vercel settings for production).</li>
                <li>Refresh the page to automatically bootstrap and seed your database!</li>
              </ol>
            </div>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={subdomain ? `subdomain-${subdomain}-${currentPath}` : `main-${currentPath}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.18 }}
              className="w-full"
            >
              {subdomain ? (
                /* ========================================================
                   A) SUBDOMAIN STORE LAYOUTS
                   ======================================================== */
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
                  /* Subdomain User Not Found */
                  <div className="max-w-md mx-auto py-20 text-center space-y-4">
                    <div className="bg-amber-50 text-amber-500 p-4 rounded-full w-fit mx-auto">
                      <Store size={32} />
                    </div>
                    <div>
                      <h3 className="text-xl font-black uppercase">Store Not Found</h3>
                      <p className="text-xs text-gray-500 font-sans mt-1">
                        The store subdomain <span className="font-bold">@{subdomain}</span> has not been registered yet on Trodex.
                      </p>
                    </div>
                    <button
                      onClick={() => handleSimulateSubdomain(null)}
                      className="px-5 py-2.5 bg-[#1A1A1A] hover:bg-gray-800 text-white text-xs font-bold rounded-xl transition"
                    >
                      Return to Main Feed
                    </button>
                  </div>
                )
              ) : (
                /* ========================================================
                   B) MAIN CENTRAL DOMAIN LAYOUTS
                   ======================================================== */
                (() => {
                  switch (currentPath) {
                    case "/":
                      return (
                        <FeedView
                          onNavigateToPost={(username, slug) => {
                            handleSimulateSubdomain(username).then(() => {
                              navigateTo(`/post/${slug}`);
                            });
                          }}
                          onNavigate={navigateTo}
                        />
                      );
                    case "/login":
                      return (
                        <AuthView
                          initialMode="login"
                          onAuthSuccess={() => {
                            fetchContext().then(() => navigateTo("/settings"));
                          }}
                        />
                      );
                    case "/register":
                      return (
                        <AuthView
                          initialMode="register"
                          onAuthSuccess={() => {
                            fetchContext().then(() => navigateTo("/settings"));
                          }}
                        />
                      );
                    case "/create-post":
                      return currentUser ? (
                        <CreatePostView
                          onNavigate={navigateTo}
                          onPostCreated={() => {
                            navigateTo("/settings");
                          }}
                        />
                      ) : (
                        <AuthView
                          initialMode="login"
                          onAuthSuccess={() => {
                            fetchContext().then(() => navigateTo("/create-post"));
                          }}
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
                          onAuthSuccess={() => {
                            fetchContext().then(() => navigateTo("/settings"));
                          }}
                        />
                      );
                    case "/about":
                      return (
                        <div className="max-w-2xl mx-auto bg-white p-6 md:p-8 rounded-3xl border border-gray-100 shadow-sm space-y-4">
                          <h2 className="text-3xl font-black text-[#1A1A1A] uppercase tracking-tight">About <span className="text-[#CC0000]">Trodex</span></h2>
                          <p className="text-xs text-gray-500 font-medium uppercase font-mono tracking-wider">The Decentralized Creator Storefront</p>
                          <div className="text-sm text-gray-600 space-y-4 leading-relaxed font-medium">
                            <p>
                              Trodex empowers product curators, reviewers, and affiliate marketers to claim their own distinct brand subdomain and curate their favorite gear in seconds.
                            </p>
                            <p>
                              By compiling custom reviews, real-time ratings, and clear shop direct/affiliate redirects, Trodex simplifies the link-in-bio storefront concept into beautiful, high-converting social feeds.
                            </p>
                          </div>
                        </div>
                      );
                    case "/privacy":
                      return (
                        <div className="max-w-2xl mx-auto bg-white p-6 md:p-8 rounded-3xl border border-gray-100 shadow-sm space-y-4">
                          <h2 className="text-3xl font-black text-[#1A1A1A] uppercase tracking-tight">Privacy <span className="text-[#CC0000]">Policy</span></h2>
                          <p className="text-xs text-gray-500 font-medium uppercase font-mono tracking-wider">Last updated: June 2026</p>
                          <div className="text-sm text-gray-600 space-y-4 leading-relaxed font-medium">
                            <p>
                              Your privacy is important to us. Trodex does not track your keystrokes, sell your product curation lists, or monitor external referrer routes beyond standard session validation cookies.
                            </p>
                            <p>
                              Any search engine verification meta tags you provide are rendered directly inside your subdomain's header to allow search consoles to claim ownership seamlessly.
                            </p>
                          </div>
                        </div>
                      );
                    case "/terms":
                      return (
                        <div className="max-w-2xl mx-auto bg-white p-6 md:p-8 rounded-3xl border border-gray-100 shadow-sm space-y-4">
                          <h2 className="text-3xl font-black text-[#1A1A1A] uppercase tracking-tight">Terms of <span className="text-[#CC0000]">Service</span></h2>
                          <p className="text-xs text-gray-500 font-medium uppercase font-mono tracking-wider">Last updated: June 2026</p>
                          <div className="text-sm text-gray-600 space-y-4 leading-relaxed font-medium">
                            <p>
                              By registering a custom subdomain, you agree not to post malicious redirects, fraudulent reviews, or violate any trade laws with illegal affiliate networks.
                            </p>
                            <p>
                              Trodex reserves the right to reclaim generic usernames or subdomains that infringe on active trademarks.
                            </p>
                          </div>
                        </div>
                      );
                    default:
                      return (
                        <div className="text-center py-20 space-y-3">
                          <h2 className="text-2xl font-black uppercase">Page Not Found</h2>
                          <button
                            onClick={() => navigateTo("/")}
                            className="px-4 py-2 bg-[#CC0000] text-white font-bold text-xs rounded-xl"
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

      {/* Footer component with static links */}
      <footer className="w-full bg-[#1A1A1A] border-t border-gray-800 text-gray-400 py-6 px-4 md:px-8 mt-12 mb-16 md:mb-0">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-medium">
          <div>
            &copy; {new Date().getFullYear()} Trodex. All rights reserved.
          </div>
          <div className="flex items-center gap-6 font-semibold">
            <button onClick={() => navigateTo("/about")} className="hover:text-[#CC0000] transition text-left cursor-pointer">
              About
            </button>
            <button onClick={() => navigateTo("/privacy")} className="hover:text-[#CC0000] transition text-left cursor-pointer">
              Privacy Policy
            </button>
            <button onClick={() => navigateTo("/terms")} className="hover:text-[#CC0000] transition text-left cursor-pointer">
              Terms of Service
            </button>
          </div>
        </div>
      </footer>

      {/* Floating Bottom Nav for mobile clients */}
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
