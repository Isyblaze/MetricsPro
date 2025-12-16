"use client";

import { useState } from "react";
import useAuth from "@/utils/useAuth";

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { signInWithCredentials } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await signInWithCredentials({
        email,
        password,
        callbackUrl: "/dashboard",
        redirect: true,
      });
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to sign in");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F3F3F3] dark:bg-[#0A0A0A] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-[#3B82F6] to-[#2563EB] rounded-2xl flex items-center justify-center">
            <span className="text-white text-2xl font-bold font-sora">M</span>
          </div>
        </div>

        {/* Sign In Card */}
        <div className="bg-white dark:bg-[#1E1E1E] border border-[#E6E6E6] dark:border-[#333333] rounded-2xl p-8">
          <h1 className="text-3xl font-bold text-black dark:text-white mb-2 font-sora">
            Welcome back
          </h1>
          <p className="text-[#6F6F6F] dark:text-[#AAAAAA] mb-8 font-inter">
            Sign in to your MetricsPro account
          </p>

          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-600 dark:text-red-400 font-inter">
                {error}
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label className="block text-sm font-medium text-[#2B2B2B] dark:text-white mb-2 font-inter">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full h-12 px-4 rounded-xl bg-white dark:bg-[#262626] border border-[#E5E5E5] dark:border-[#404040] text-black dark:text-white placeholder-[#6E6E6E] dark:placeholder-[#888888] font-inter transition-all duration-200 focus:border-black dark:focus:border-white focus:outline-none"
                placeholder="you@company.com"
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-[#2B2B2B] dark:text-white mb-2 font-inter">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full h-12 px-4 rounded-xl bg-white dark:bg-[#262626] border border-[#E5E5E5] dark:border-[#404040] text-black dark:text-white placeholder-[#6E6E6E] dark:placeholder-[#888888] font-inter transition-all duration-200 focus:border-black dark:focus:border-white focus:outline-none"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 rounded-xl bg-gradient-to-b from-[#252525] to-[#0F0F0F] dark:from-[#FFFFFF] dark:to-[#E0E0E0] text-white dark:text-black font-semibold transition-all duration-150 hover:from-[#2d2d2d] hover:to-[#171717] dark:hover:from-[#F0F0F0] dark:hover:to-[#D0D0D0] active:from-[#1a1a1a] active:to-[#000000] dark:active:from-[#E0E0E0] dark:active:to-[#C0C0C0] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed font-inter"
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-[#6F6F6F] dark:text-[#AAAAAA] font-inter">
              Don't have an account?{" "}
              <a
                href="/account/signup"
                className="text-black dark:text-white font-semibold hover:underline"
              >
                Sign up
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
