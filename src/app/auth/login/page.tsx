"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import { createClient } from "@/lib/supabase/client";
import { envClient } from "@/lib/env-client";
import CosmicBackground from "@/components/ui/CosmicBackground";
import {
  HiOutlineEye,
  HiOutlineEyeSlash,
  HiOutlineEnvelope,
  HiOutlineLockClosed,
} from "react-icons/hi2";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [error, setError] = useState("");
  const { t } = useLanguage();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResetSent(false);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setError(t("auth.invalid_credentials"));
      } else {
        router.push("/account");
      }
    } catch (err) {
      setError(t("auth.login_error"));
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    setError("");
    setResetSent(false);

    if (!email) {
      setError(t("auth.email_required"));
      return;
    }

    setResetLoading(true);
    try {
      const supabase = createClient();
      const baseUrl =
        envClient.NEXT_PUBLIC_APP_URL ||
        (typeof window !== "undefined" ? window.location.origin : "");
      const redirectTo = baseUrl ? `${baseUrl}/auth/reset` : undefined;
      const { error } = await supabase.auth.resetPasswordForEmail(
        email,
        redirectTo ? { redirectTo } : undefined
      );

      if (error) {
        setError(t("auth.reset_password_error"));
        return;
      }

      setResetSent(true);
    } catch (err) {
      setError(t("auth.reset_password_error"));
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <CosmicBackground className="flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="mb-6"
          >
            <h1 className="text-4xl font-bold text-cosmic-gold font-major-mono mb-2">
              COSMOCOCKTAILS
            </h1>
            <div className="w-24 h-1 bg-gradient-to-r from-cosmic-gold to-sky-300 mx-auto rounded-full" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            <h2 className="text-2xl font-semibold text-slate-100 mb-2">
              {t("auth.welcome_back")}
            </h2>
            <p className="text-slate-300 text-sm">
              {t("auth.welcome_message")}
            </p>
          </motion.div>
        </div>

        {/* Login Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="bg-white/5 backdrop-blur-md border border-slate-700/40 rounded-2xl p-8 shadow-2xl"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                {t("auth.email")}
              </label>
              <div className="relative">
                <HiOutlineEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-3 bg-white/10 border border-slate-600/50 rounded-lg text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cosmic-gold/50 focus:border-cosmic-gold/50 transition-all"
                  placeholder={t("auth.email")}
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                {t("auth.password")}
              </label>
              <div className="relative">
                <HiOutlineLockClosed className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  className="w-full pl-10 pr-12 py-3 bg-white/10 border border-slate-600/50 rounded-lg text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cosmic-gold/50 focus:border-cosmic-gold/50 transition-all"
                  placeholder={t("auth.password")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors"
                >
                  {showPassword ? (
                    <HiOutlineEyeSlash className="w-5 h-5" />
                  ) : (
                    <HiOutlineEye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-red-300 text-sm"
              >
                {error}
              </motion.div>
            )}

            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={handlePasswordReset}
                disabled={resetLoading}
                className="text-sm text-cosmic-gold hover:text-sky-300 transition-colors disabled:opacity-50"
              >
                {resetLoading ? t("auth.loading") : t("auth.forgot_password")}
              </button>
              {resetSent && (
                <span className="text-xs text-emerald-300">
                  {t("auth.reset_password_sent")}
                </span>
              )}
            </div>

            {/* Submit Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-cosmic-gold to-sky-300 text-slate-900 font-semibold py-3 px-6 rounded-lg hover:from-cosmic-gold/90 hover:to-sky-300/90 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-slate-900 border-t-transparent rounded-full animate-spin mr-2" />
                  {t("auth.loading")}
                </div>
              ) : (
                t("auth.login_button")
              )}
            </motion.button>

            {/* Register Link */}
            <div className="text-center">
              <p className="text-slate-400 text-sm">
                {t("auth.no_account")}{" "}
                <Link
                  href="/auth/register"
                  className="text-cosmic-gold hover:text-sky-300 transition-colors font-medium"
                >
                  {t("auth.register_title")}
                </Link>
              </p>
            </div>
          </form>
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="text-center mt-8"
        >
          <p className="text-slate-500 text-xs">
            © 2024 CosmoCocktails. {t("auth.join_community")}
          </p>
        </motion.div>
      </motion.div>
    </CosmicBackground>
  );
}
