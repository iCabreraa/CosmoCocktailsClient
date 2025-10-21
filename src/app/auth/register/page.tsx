"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import { createClient } from "@/lib/supabase/client";
import CosmicBackground from "@/components/ui/CosmicBackground";
import {
  HiOutlineEye,
  HiOutlineEyeSlash,
  HiOutlineEnvelope,
  HiOutlineLockClosed,
  HiOutlineUser,
} from "react-icons/hi2";

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { t } = useLanguage();
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError(t("auth.passwords_not_match"));
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError(t("auth.password_min_length"));
      setLoading(false);
      return;
    }

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName,
          },
        },
      });

      if (error) {
        setError(t("auth.register_error"));
      } else {
        router.push("/account");
      }
    } catch (err) {
      setError(t("auth.register_error"));
    } finally {
      setLoading(false);
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
              {t("auth.join_community")}
            </h2>
            <p className="text-slate-300 text-sm">{t("auth.join_message")}</p>
          </motion.div>
        </div>

        {/* Register Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="bg-white/5 backdrop-blur-md border border-slate-700/40 rounded-2xl p-8 shadow-2xl"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Full Name Field */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                {t("auth.full_name")}
              </label>
              <div className="relative">
                <HiOutlineUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-4 py-3 bg-white/10 border border-slate-600/50 rounded-lg text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cosmic-gold/50 focus:border-cosmic-gold/50 transition-all"
                  placeholder={t("auth.full_name")}
                />
              </div>
            </div>

            {/* Email Field */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                {t("auth.email")}
              </label>
              <div className="relative">
                <HiOutlineEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
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
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
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

            {/* Confirm Password Field */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                {t("auth.confirm_password")}
              </label>
              <div className="relative">
                <HiOutlineLockClosed className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-12 py-3 bg-white/10 border border-slate-600/50 rounded-lg text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cosmic-gold/50 focus:border-cosmic-gold/50 transition-all"
                  placeholder={t("auth.confirm_password")}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors"
                >
                  {showConfirmPassword ? (
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
                t("auth.register_button")
              )}
            </motion.button>

            {/* Login Link */}
            <div className="text-center">
              <p className="text-slate-400 text-sm">
                {t("auth.have_account")}{" "}
                <Link
                  href="/auth/login"
                  className="text-cosmic-gold hover:text-sky-300 transition-colors font-medium"
                >
                  {t("auth.login_title")}
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
