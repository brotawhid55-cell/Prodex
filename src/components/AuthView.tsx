import React, { useState } from "react";
import { LogIn, UserPlus, AlertCircle, Loader2, ShoppingBag } from "lucide-react";
import { motion } from "motion/react";

interface AuthViewProps {
  initialMode?: "login" | "register";
  onAuthSuccess: () => void;
}

export function AuthView({ initialMode = "login", onAuthSuccess }: AuthViewProps) {
  const [isLogin, setIsLogin] = useState(initialMode === "login");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  // Login separate field (can be username or email)
  const [identifier, setIdentifier] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Handle Register username input strictly
  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Alphanumeric only, lowercase
    const cleanValue = e.target.value.toLowerCase().replace(/[^a-z0-9]/g, "");
    setUsername(cleanValue);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (isLogin) {
        // --- LOGIN FLOW ---
        if (!identifier || !password) {
          setError("Please fill out all fields.");
          setLoading(false);
          return;
        }

        const res = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ identifier, password })
        });

        const data = await res.json();
        if (res.ok && data.success) {
          onAuthSuccess();
        } else {
          setError(data.error || "Invalid username or password.");
        }
      } else {
        // --- REGISTER FLOW ---
        if (!username || !email || !password) {
          setError("All fields are required.");
          setLoading(false);
          return;
        }

        // Validate username format
        const usernameRegex = /^[a-z0-9]+$/;
        if (!usernameRegex.test(username)) {
          setError("Username must be lowercase and alphanumeric only.");
          setLoading(false);
          return;
        }

        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, email, password })
        });

        const data = await res.json();
        if (res.ok && data.success) {
          onAuthSuccess();
        } else {
          setError(data.error || "Failed to register. Username or email may already be in use.");
        }
      }
    } catch {
      setError("Server connection failure. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[75vh] px-4 py-8 bg-[#FFF8F7]">
      <motion.div
        layout
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-[#FFF8F7] rounded-[28px] border border-[#857371]/20 shadow-sm p-6 md:p-8 max-w-md w-full space-y-6"
      >
        {/* Branding header inside card */}
        <div className="text-center space-y-2">
          <div className="bg-[#FFDAD6] p-3 rounded-2xl text-[#CC0000] shadow-xs w-fit mx-auto">
            <ShoppingBag size={24} className="stroke-[2.5]" />
          </div>
          <h2 className="text-2xl font-bold text-[#1A1A1A] tracking-tight uppercase">
            {isLogin ? (
              <>
                LOG IN TO <span className="text-[#CC0000]">TRODEX</span>
              </>
            ) : (
              <>
                JOIN <span className="text-[#CC0000]">TRODEX</span>
              </>
            )}
          </h2>
          <p className="text-xs text-[#534341] font-normal">
            {isLogin 
              ? "Access your dashboard and manage your store curations." 
              : "Register your custom username.trodex.com store today!"}
          </p>
        </div>

        {/* Error Notification */}
        {error && (
          <div className="p-3 bg-[#FFDAD6] text-[#B3261E] text-xs font-semibold rounded-xl flex items-center gap-2 border border-[#B3261E]/20">
            <AlertCircle size={16} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          
          {isLogin ? (
            /* --- LOGIN FIELDS --- */
            <>
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-[#534341] uppercase">
                  Email or Username
                </label>
                <input
                  type="text"
                  placeholder="Enter email or username"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="w-full h-14 px-4 bg-transparent border border-[#857371] focus:border-[#CC0000] rounded-[4px] text-sm text-[#1A1A1A] transition focus:outline-none placeholder-[#857371]/50"
                  required
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <label className="text-[11px] font-bold text-[#534341] uppercase">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => alert("Password recovery is simulated in preview! Login with 'techcurator' / 'password123' to view details.")}
                    className="text-[10px] font-semibold text-[#857371] hover:text-[#CC0000] hover:underline uppercase"
                  >
                    Forget Password?
                  </button>
                </div>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-14 px-4 bg-transparent border border-[#857371] focus:border-[#CC0000] rounded-[4px] text-sm text-[#1A1A1A] transition focus:outline-none placeholder-[#857371]/50"
                  required
                />
              </div>
            </>
          ) : (
            /* --- REGISTER FIELDS --- */
            <>
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <label className="text-[11px] font-bold text-[#534341] uppercase">
                    Choose Username (subdomain)
                  </label>
                  <span className="text-[10px] text-[#534341]">Alphanumeric, lowercase</span>
                </div>
                <input
                  type="text"
                  placeholder="e.g. janesmith"
                  value={username}
                  onChange={handleUsernameChange}
                  className="w-full h-14 px-4 bg-transparent border border-[#857371] focus:border-[#CC0000] rounded-[4px] text-sm text-[#1A1A1A] font-mono transition focus:outline-none placeholder-[#857371]/50"
                  required
                />
                <p className="text-[10px] font-mono text-[#534341]">
                  Your store will be: <span className="text-[#CC0000] font-bold">{username || "username"}.trodex.com</span>
                </p>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-[#534341] uppercase">
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="jane@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-14 px-4 bg-transparent border border-[#857371] focus:border-[#CC0000] rounded-[4px] text-sm text-[#1A1A1A] transition focus:outline-none placeholder-[#857371]/50"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-[#534341] uppercase">
                  Password
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-14 px-4 bg-transparent border border-[#857371] focus:border-[#CC0000] rounded-[4px] text-sm text-[#1A1A1A] transition focus:outline-none placeholder-[#857371]/50"
                  required
                />
              </div>
            </>
          )}

          {/* Action Button (Filled Button) */}
          <button
            type="submit"
            disabled={loading}
            className="w-full h-12 bg-[#CC0000] hover:bg-[#CC0000]/92 active:bg-[#CC0000]/88 disabled:bg-gray-400 text-[#FFFFFF] font-semibold text-xs uppercase tracking-widest rounded-full transition shadow flex items-center justify-center gap-1.5"
          >
            {loading ? (
              <Loader2 size={14} className="animate-spin" />
            ) : isLogin ? (
              <LogIn size={14} />
            ) : (
              <UserPlus size={14} />
            )}
            <span>{isLogin ? "Log In" : "Register Store"}</span>
          </button>
        </form>

        {/* Divider & Switch Mode */}
        <div className="space-y-4 pt-4 border-t border-[#857371]/20">
          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-[#857371]/10"></div>
            <span className="flex-shrink mx-4 text-[#857371] font-mono text-[10px] uppercase font-bold tracking-widest">
              {isLogin ? "New to Trodex?" : "Already have an account?"}
            </span>
            <div className="flex-grow border-t border-[#857371]/10"></div>
          </div>

          {/* Outlined Button */}
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setError("");
            }}
            className="w-full h-12 bg-transparent border border-[#857371] hover:bg-[#CC0000]/8 text-[#1A1A1A] font-semibold text-xs uppercase tracking-wider rounded-full transition"
          >
            {isLogin ? "Create an account" : "Log in to existing store"}
          </button>
        </div>

        {/* Guest Demo Account helper */}
        {isLogin && (
          <div className="bg-[#FFDAD6] p-3 rounded-[12px] border border-[#857371]/10 text-center">
            <span className="block text-[10px] font-mono font-bold text-[#CC0000]">PREVIEW ACCREDITED LOGIN</span>
            <p className="text-[10px] font-medium text-[#410002] mt-0.5 leading-relaxed">
              Email: <code className="font-mono bg-[#FFF8F7] px-1 py-0.5 rounded border border-[#857371]/10 text-[#410002]">tech@curator.com</code><br/>
              Password: <code className="font-mono bg-[#FFF8F7] px-1 py-0.5 rounded border border-[#857371]/10 text-[#410002]">password123</code>
            </p>
          </div>
        )}
      </motion.div>
    </div>
  );
}

export default AuthView;
