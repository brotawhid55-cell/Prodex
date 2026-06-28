import React, { useState, useEffect } from "react";
import { Header } from "./components/Header.tsx";
import { BottomNav } from "./components/BottomNav.tsx";
import { DevToolbar } from "./components/DevToolbar.tsx";
import { FeedView } from "./components/FeedView.tsx";
import { ProfileView } from "./components/ProfileView.tsx";
import { PostView } from "./components/PostView.tsx";
import { CreatePostView } from "./components/CreatePostView.tsx";
import { SettingsView } from "./components/SettingsView.tsx";
import { AuthView } from "./components/AuthView.tsx";
import { motion, AnimatePresence } from "motion/react";
import { Loader2, Sparkles, Store, Cpu, User } from "lucide-react";

export default function App() {
  const [currentPath, setCurrentPath] = useState(window.location.pathname);
  
  // Context states from server
  const [subdomain, setSubdomain] = useState<string | null>(null);
  const [subdomainUser, setSubdomainUser] = useState<any | null>(null);
  const [currentUser, setCurrentUser] = useState<any | null>(null);
  const [isUsingNeon, setIsUsingNeon] = useState(false);
  const [loadingContext, setLoadingContext] = useState(true);

  // Sync state with back button popstate
  useEffect(() => {
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
    } catch (err) {
      console.error("Error loading full-stack context:", err);
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
      // Toggle to their personal store view
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
      
      {/* Dev panel for testing subdomains in iframe */}
      <DevToolbar
        currentSubdomain={subdomain}
        currentUser={currentUser}
        isUsingNeon={isUsingNeon}
        onSimulateSubdomain={handleSimulateSubdomain}
      />

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
                            // To explore correctly, simulate subdomain of post author first
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
                            fetchContext().then(() => navigateTo("/"));
                          }}
                        />
                      );
                    case "/register":
                      return (
                        <AuthView
                          initialMode="register"
                          onAuthSuccess={() => {
                            fetchContext().then(() => navigateTo("/"));
                          }}
                        />
                      );
                    case "/create-post":
                      return currentUser ? (
                        <CreatePostView
                          onNavigate={navigateTo}
                          onPostCreated={() => {
                            // After creation, go to user's store
                            handleSimulateSubdomain(currentUser.username).then(() => {
                              navigateTo("/");
                            });
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
                    default:
                      // Fallback wildcard routing
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
