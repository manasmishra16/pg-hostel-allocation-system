"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Building2, Mail, Lock, ArrowRight, Sparkles } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

export default function LoginPage() {
  const router = useRouter();
  const { login, demoLogin } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Failed to login. Please check credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handleDemo = async (role: "TENANT" | "PROPERTY_OWNER" | "WARDEN" | "SUPER_ADMIN") => {
    setError("");
    setLoading(true);
    try {
      await demoLogin(role);
      if (role === "PROPERTY_OWNER") router.push("/owner/dashboard");
      else if (role === "SUPER_ADMIN") router.push("/admin/dashboard");
      else if (role === "WARDEN") router.push("/staff/dashboard");
      else router.push("/dashboard");
    } catch (err: any) {
      setError("Demo login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#090D14] flex flex-col justify-center p-4 sm:p-8">
      <div className="max-w-5xl w-full mx-auto grid grid-cols-1 md:grid-cols-2 rounded-3xl sm:rounded-4xl overflow-hidden glass-panel border border-white/10 shadow-2xl">
        {/* Left Form matching Mockup 07 */}
        <div className="p-8 sm:p-12 flex flex-col justify-between space-y-8">
          <div>
            <Link href="/" className="inline-flex items-center gap-2 mb-8">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-white">
                <Building2 className="w-4 h-4" />
              </div>
              <span className="text-lg font-bold text-white tracking-tight">StayNest</span>
            </Link>

            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Welcome Back
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Sign in to continue your journey.
            </p>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider">
                Email / Phone
              </label>
              <div className="relative mt-1.5">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="manas@staynest.com"
                  className="w-full pl-10 pr-4 py-3 rounded-xl glass-input text-xs"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider">
                  Password
                </label>
                <a href="#" className="text-[11px] text-emerald-400 hover:underline">
                  Forgot password?
                </a>
              </div>
              <div className="relative mt-1.5">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-3 rounded-xl glass-input text-xs"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-colors shadow-lg shadow-emerald-500/20 disabled:opacity-50"
            >
              {loading ? "Signing In..." : "Sign In"}
            </button>
          </form>

          {/* Quick 1-Click Demo Personas for Reviewers */}
          <div className="space-y-2 pt-2 border-t border-white/5">
            <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-emerald-400" />
              <span>Instant Evaluator Logins (1-Click)</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleDemo("TENANT")}
                className="px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-200 text-[11px] font-medium text-left truncate"
              >
                👤 Tenant (Manas)
              </button>
              <button
                type="button"
                onClick={() => handleDemo("PROPERTY_OWNER")}
                className="px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-200 text-[11px] font-medium text-left truncate"
              >
                🏢 Owner (Vikramaditya)
              </button>
              <button
                type="button"
                onClick={() => handleDemo("WARDEN")}
                className="px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-200 text-[11px] font-medium text-left truncate"
              >
                🛡️ Warden (Rajesh)
              </button>
              <button
                type="button"
                onClick={() => handleDemo("SUPER_ADMIN")}
                className="px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-200 text-[11px] font-medium text-left truncate"
              >
                👑 Platform Admin
              </button>
            </div>
          </div>

          <p className="text-center text-xs text-slate-400">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="text-emerald-400 font-semibold hover:underline">
              Sign up
            </Link>
          </p>
        </div>

        {/* Right Showcase matching Mockup 07 */}
        <div className="relative hidden md:block overflow-hidden bg-slate-900">
          <img
            src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1000"
            alt="StayNest Luxury"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#090D14] via-[#090D14]/40 to-transparent" />
          <div className="absolute bottom-12 left-10 right-10 space-y-2">
            <div className="text-2xl font-bold text-white leading-snug">
              &ldquo;A better stay for a brighter tomorrow.&rdquo;
            </div>
            <p className="text-xs text-slate-300">
              Join thousands of happy residents in Bengaluru.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
