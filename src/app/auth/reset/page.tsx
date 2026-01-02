"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import { createClient } from "@/lib/supabase/client";
import CosmicBackground from "@/components/ui/CosmicBackground";
import {
  HiOutlineEye,
  HiOutlineEyeSlash,
  HiOutlineLockClosed,
} from "react-icons/hi2";

export default function ResetPasswordPage() {
  const { t } = useLanguage();
  const supabase = createClient();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sessionReady, setSessionReady] = useState(false);
  const [hasSession, setHasSession] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const resolveResetSession = useCallback(async () => {
    if (typeof window === "undefined") {
      return null;
    }

    const currentUrl = new URL(window.location.href);
    const code = currentUrl.searchParams.get("code");
    const type = currentUrl.searchParams.get("type");

    if (code && (type === "recovery" || !type)) {
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);
      if (error) {
        return { error };
      }
      window.history.replaceState(
        {},
        document.title,
        `${currentUrl.origin}${currentUrl.pathname}`
      );
      return { session: data.session };
    }

    if (currentUrl.hash) {
      const hashParams = new URLSearchParams(currentUrl.hash.slice(1));
      const accessToken = hashParams.get("access_token");
      const refreshToken = hashParams.get("refresh_token");

      if (accessToken && refreshToken) {
        const { data, error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });
        if (error) {
          return { error };
        }
        window.history.replaceState(
          {},
          document.title,
          `${currentUrl.origin}${currentUrl.pathname}`
        );
        return { session: data.session };
      }
    }

    return null;
  }, [supabase]);

  useEffect(() => {
    let isMounted = true;

    const checkSession = async () => {
      setSessionReady(false);
      setError("");

      const resolved = await resolveResetSession();
      if (!isMounted) return;

      if (resolved?.error) {
        setHasSession(false);
        setError(t("auth.reset_password_invalid"));
        setSessionReady(true);
        return;
      }

      if (resolved?.session) {
        setHasSession(true);
        setSessionReady(true);
        return;
      }

      const { data } = await supabase.auth.getSession();
      if (!isMounted) return;
      setHasSession(Boolean(data.session));
      setSessionReady(true);
    };

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (!isMounted) return;
        setHasSession(Boolean(session));
        setSessionReady(true);
      }
    );

    checkSession();

    return () => {
      isMounted = false;
      listener?.subscription?.unsubscribe();
    };
  }, [resolveResetSession, supabase, t]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (!hasSession) {
      const resolved = await resolveResetSession();
      if (!resolved?.session) {
        setError(t("auth.reset_password_invalid"));
        return;
      }
      setHasSession(true);
    }

    if (password.length < 6) {
      setError(t("auth.password_min_length"));
      return;
    }

    if (password !== confirmPassword) {
      setError(t("auth.passwords_not_match"));
      return;
    }

    setLoading(true);
    try {
      const updateWithTimeout = Promise.race([
        supabase.auth.updateUser({ password }),
        new Promise<never>((_, reject) => {
          setTimeout(() => reject(new Error("timeout")), 15000);
        }),
      ]) as Promise<{ error?: { message?: string } | null }>;

      const { error } = await updateWithTimeout;
      if (error) {
        setError(error.message || t("auth.reset_password_error"));
        return;
      }
      setSuccess(true);
      setPassword("");
      setConfirmPassword("");
    } catch (err) {
      setError(t("auth.reset_password_error"));
    } finally {
      setLoading(false);
    }
  };

  if (!sessionReady) {
    return (
      <CosmicBackground className="flex items-center justify-center p-4">
        <div className="w-10 h-10 border-2 border-cosmic-gold border-t-transparent rounded-full animate-spin" />
      </CosmicBackground>
    );
  }

  if (!hasSession) {
    return (
      <CosmicBackground className="flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md text-center bg-white/5 backdrop-blur-md border border-slate-700/40 rounded-2xl p-8 shadow-2xl"
        >
          <h1 className="text-2xl font-semibold text-slate-100 mb-3">
            {t("auth.reset_password_update_title")}
          </h1>
          <p className="text-slate-300 text-sm mb-6">
            {t("auth.reset_password_invalid")}
          </p>
          <Link
            href="/auth/login"
            className="inline-flex items-center justify-center w-full bg-gradient-to-r from-cosmic-gold to-sky-300 text-slate-900 font-semibold py-3 px-6 rounded-lg hover:from-cosmic-gold/90 hover:to-sky-300/90 transition-all duration-200"
          >
            {t("auth.reset_password_request_new")}
          </Link>
        </motion.div>
      </CosmicBackground>
    );
  }

  return (
    <CosmicBackground className="flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl font-semibold text-slate-100 mb-2">
            {t("auth.reset_password_update_title")}
          </h1>
          <p className="text-slate-300 text-sm">
            {t("auth.reset_password_title")}
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="bg-white/5 backdrop-blur-md border border-slate-700/40 rounded-2xl p-8 shadow-2xl"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                {t("auth.new_password")}
              </label>
              <div className="relative">
                <HiOutlineLockClosed className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                  className="w-full pl-10 pr-12 py-3 bg-white/10 border border-slate-600/50 rounded-lg text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cosmic-gold/50 focus:border-cosmic-gold/50 transition-all"
                  placeholder={t("auth.password_placeholder")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors"
                >
                  {showPassword ? (
                    <HiOutlineEyeSlash className="w-5 h-5" />
                  ) : (
                    <HiOutlineEye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                {t("auth.confirm_password")}
              </label>
              <div className="relative">
                <HiOutlineLockClosed className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                  className="w-full pl-10 pr-12 py-3 bg-white/10 border border-slate-600/50 rounded-lg text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cosmic-gold/50 focus:border-cosmic-gold/50 transition-all"
                  placeholder={t("auth.confirm_password")}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors"
                >
                  {showConfirmPassword ? (
                    <HiOutlineEyeSlash className="w-5 h-5" />
                  ) : (
                    <HiOutlineEye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-red-300 text-sm">
                {error}
              </div>
            )}

            {success && (
              <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-3 text-emerald-300 text-sm">
                {t("auth.reset_password_success")}
              </div>
            )}

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
                t("auth.reset_password_update_button")
              )}
            </motion.button>

            <div className="text-center">
              <Link
                href="/auth/login"
                className="text-sm text-slate-400 hover:text-slate-200 transition-colors"
              >
                {t("auth.login_title")}
              </Link>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </CosmicBackground>
  );
}
