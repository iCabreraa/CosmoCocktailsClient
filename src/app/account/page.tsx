"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useAuthUnified } from "@/hooks/useAuthUnified";
import { useAuthRefresh } from "@/hooks/useAuthRefresh";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  ErrorNotification,
  useNotifications,
} from "@/components/ErrorNotification";
import AccountTabs from "@/components/account/AccountTabs";
import CosmicBackground from "@/components/ui/CosmicBackground";
import PrivacyModal from "@/components/privacy/PrivacyModal";
import { createClient } from "@/lib/supabase/client";
import { envClient } from "@/lib/env-client";
import {
  HiOutlineEye,
  HiOutlineEyeSlash,
  HiOutlineEnvelope,
  HiOutlineLockClosed,
  HiOutlineUser,
  HiOutlinePhone,
} from "react-icons/hi2";

export default function AccountPage() {
  const {
    user,
    loading,
    signIn: login,
    signUp: signup,
    signOut: logout,
    updateProfile,
    error: authError,
  } = useAuthUnified();

  const isAuthenticated = !!user;
  const { refreshError, clearRefreshError } = useAuthRefresh();
  const { notifications, addNotification, removeNotification } =
    useNotifications();
  const { t } = useLanguage();
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    full_name: "",
    phone: "",
  });
  const [error, setError] = useState("");
  const [loadingAction, setLoadingAction] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  // Mostrar notificaciones de errores de autenticación
  useEffect(() => {
    if (authError) {
      addNotification({
        type: "error",
        title: t("common.error"),
        message: authError,
        duration: 5000,
      });
    }
  }, [authError, addNotification]);

  // Mostrar notificaciones de errores de refresh
  useEffect(() => {
    if (refreshError) {
      addNotification({
        type: "warning",
        title: t("auth.session_expired"),
        message: t("auth.session_expired_message"),
        duration: 7000,
      });
      clearRefreshError();
    }
  }, [refreshError, addNotification, clearRefreshError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setResetSent(false);
    setSuccessMessage("");
    setLoadingAction(true);

    try {
      if (isLogin) {
        const { error } = await login(formData.email, formData.password);
        if (error) {
          setError(error.message);
          addNotification({
            type: "error",
            title: t("auth.login_error"),
            message: error.message,
            duration: 5000,
          });
        } else {
          addNotification({
            type: "success",
            title: t("auth.login_success"),
            message: t("auth.login_success_message"),
            duration: 3000,
          });
          // Permanecer en /account; el listener de auth actualizará el dashboard sin forzar navegación
          // Limpiar el formulario después del login exitoso
          setFormData({ email: "", password: "", full_name: "", phone: "" });
        }
      } else {
        const { error } = await signup(
          formData.email,
          formData.password,
          formData.full_name,
          formData.phone
        );
        if (error) {
          setError(error.message);
          addNotification({
            type: "error",
            title: t("auth.register_error"),
            message: error.message,
            duration: 5000,
          });
        } else {
          addNotification({
            type: "success",
            title: t("auth.register_success"),
            message: t("auth.register_success_message"),
            duration: 5000,
          });
          setIsLogin(true);
          setFormData({ email: "", password: "", full_name: "", phone: "" });
          setSuccessMessage(t("auth.register_success_message"));
        }
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : t("common.error");
      setError(errorMessage);
      addNotification({
        type: "error",
        title: t("common.error"),
        message: errorMessage,
        duration: 5000,
      });
    } finally {
      setLoadingAction(false);
    }
  };

  const handleLogout = async () => {
    const { error } = await logout();
    if (error) {
      addNotification({
        type: "error",
        title: t("auth.logout_error_title"),
        message: t("auth.logout_error_message"),
        duration: 5000,
      });
      return;
    }
    addNotification({
      type: "success",
      title: t("auth.logout_success_title"),
      message: t("auth.logout_success_message"),
      duration: 3000,
    });
    router.push("/");
    router.refresh();
  };

  const handlePasswordReset = async () => {
    setError("");
    setResetSent(false);

    if (!formData.email) {
      setError(t("auth.email_required"));
      return;
    }

    setResetLoading(true);
    try {
      const baseUrl =
        envClient.NEXT_PUBLIC_APP_URL ||
        (typeof window !== "undefined" ? window.location.origin : "");
      const redirectTo = baseUrl ? `${baseUrl}/auth/reset` : undefined;
      const { error } = await supabase.auth.resetPasswordForEmail(
        formData.email,
        redirectTo ? { redirectTo } : undefined
      );

      if (error) {
        setError(error.message);
        addNotification({
          type: "error",
          title: t("common.error"),
          message: t("auth.reset_password_error"),
          duration: 5000,
        });
        return;
      }

      setResetSent(true);
      addNotification({
        type: "success",
        title: t("auth.reset_password_title"),
        message: t("auth.reset_password_sent"),
        duration: 5000,
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : t("common.error");
      setError(errorMessage);
      addNotification({
        type: "error",
        title: t("common.error"),
        message: t("auth.reset_password_error"),
        duration: 5000,
      });
    } finally {
      setResetLoading(false);
    }
  };

  if (loading) {
    return (
      <CosmicBackground className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-cosmic-gold"></div>
      </CosmicBackground>
    );
  }

  if (isAuthenticated && user) {
    return (
      <>
        <AccountTabs
          user={user}
          onUpdate={async updates => {
            const { error } = await updateProfile(updates);
            if (error) {
              addNotification({
                type: "error",
                title: t("profile.update_error"),
                message: error.message || t("common.error"),
                duration: 5000,
              });
              throw new Error(error.message || t("common.error"));
            }
            addNotification({
              type: "success",
              title: t("profile.update_success"),
              message: t("profile.update_success_message"),
              duration: 3000,
            });
          }}
          onLogout={handleLogout}
        />
        {/* Notificaciones */}
        {notifications.map(notification => (
          <ErrorNotification
            key={notification.id}
            {...notification}
            onClose={() => removeNotification(notification.id!)}
          />
        ))}
      </>
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
              {isLogin ? t("auth.welcome_back") : t("auth.welcome_new")}
            </h2>
            <p className="text-slate-300 text-sm">
              {isLogin ? t("auth.welcome_message") : t("auth.join_community")}
            </p>
          </motion.div>
        </div>

        {/* Auth Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="bg-white/5 backdrop-blur-md border border-slate-700/40 rounded-2xl p-8 shadow-2xl"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Full Name Field (Register only) */}
            {!isLogin && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8, duration: 0.5 }}
              >
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  {t("profile.full_name")}
                </label>
                <div className="relative">
                  <HiOutlineUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <input
                    type="text"
                    id="full_name"
                    required={!isLogin}
                    value={formData.full_name}
                    onChange={e =>
                      setFormData({ ...formData, full_name: e.target.value })
                    }
                    className="w-full pl-10 pr-4 py-3 bg-slate-800/50 border border-slate-600/50 rounded-lg text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cosmic-gold/50 focus:border-cosmic-gold/50 transition-all duration-200"
                    placeholder={t("profile.full_name_placeholder")}
                  />
                </div>
              </motion.div>
            )}

            {/* Phone Field (Register only) */}
            {!isLogin && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.9, duration: 0.5 }}
              >
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  {t("profile.phone")}
                </label>
                <div className="relative">
                  <HiOutlinePhone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <input
                    type="tel"
                    id="phone"
                    value={formData.phone}
                    onChange={e =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    className="w-full pl-10 pr-4 py-3 bg-slate-800/50 border border-slate-600/50 rounded-lg text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cosmic-gold/50 focus:border-cosmic-gold/50 transition-all duration-200"
                    placeholder={t("profile.phone_placeholder")}
                  />
                </div>
              </motion.div>
            )}

            {/* Email Field */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: isLogin ? 0.8 : 1.0, duration: 0.5 }}
            >
              <label className="block text-sm font-medium text-slate-300 mb-2">
                {t("auth.email")}
              </label>
              <div className="relative">
                <HiOutlineEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                  type="email"
                  id="email"
                  required
                  value={formData.email}
                  onChange={e =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="w-full pl-10 pr-4 py-3 bg-slate-800/50 border border-slate-600/50 rounded-lg text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cosmic-gold/50 focus:border-cosmic-gold/50 transition-all duration-200"
                  placeholder={t("auth.email_placeholder")}
                />
              </div>
            </motion.div>

            {/* Password Field */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: isLogin ? 0.9 : 1.1, duration: 0.5 }}
            >
              <label className="block text-sm font-medium text-slate-300 mb-2">
                {t("auth.password")}
              </label>
              <div className="relative">
                <HiOutlineLockClosed className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  required
                  value={formData.password}
                  onChange={e =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  className="w-full pl-10 pr-12 py-3 bg-slate-800/50 border border-slate-600/50 rounded-lg text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cosmic-gold/50 focus:border-cosmic-gold/50 transition-all duration-200"
                  placeholder={t("auth.password_placeholder")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-300 transition-colors"
                >
                  {showPassword ? (
                    <HiOutlineEyeSlash className="w-5 h-5" />
                  ) : (
                    <HiOutlineEye className="w-5 h-5" />
                  )}
                </button>
              </div>
              {isLogin && (
                <div className="mt-3 flex items-center justify-between text-xs">
                  <button
                    type="button"
                    onClick={handlePasswordReset}
                    disabled={resetLoading}
                    className="text-cosmic-gold hover:text-sky-300 transition-colors font-medium disabled:opacity-60"
                  >
                    {resetLoading
                      ? t("auth.loading")
                      : t("auth.forgot_password")}
                  </button>
                  {resetSent && (
                    <span className="text-emerald-300">
                      {t("auth.reset_password_sent")}
                    </span>
                  )}
                </div>
              )}
            </motion.div>

            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg p-3"
              >
                {error}
              </motion.div>
            )}

            {successMessage && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-emerald-300 text-sm bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3"
              >
                {successMessage}
              </motion.div>
            )}

            {/* Submit Button */}
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: isLogin ? 1.0 : 1.2, duration: 0.5 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loadingAction}
              className="w-full bg-gradient-to-r from-cosmic-gold to-sky-300 text-slate-900 font-semibold py-3 px-6 rounded-lg hover:from-cosmic-gold/90 hover:to-sky-300/90 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loadingAction ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-slate-900 border-t-transparent rounded-full animate-spin mr-2" />
                  {t("common.loading")}
                </div>
              ) : isLogin ? (
                t("auth.login_button")
              ) : (
                t("auth.register_button")
              )}
            </motion.button>

            <div className="text-center text-xs text-slate-400">
              {t("auth.legal_prefix")}{" "}
              <button
                type="button"
                onClick={() => setIsPrivacyOpen(true)}
                className="text-cosmic-gold hover:text-sky-300 transition-colors font-medium"
              >
                {t("auth.legal_privacy")}
              </button>
              {t("auth.legal_suffix")}
            </div>

            {/* Toggle Login/Register */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: isLogin ? 1.1 : 1.3, duration: 0.5 }}
              className="text-center"
            >
              <p className="text-slate-400 text-sm">
                {isLogin ? t("auth.no_account") : t("auth.have_account")}{" "}
                <button
                  type="button"
                  onClick={() => {
                    setIsLogin(!isLogin);
                    setError("");
                    setSuccessMessage("");
                    setFormData({
                      email: "",
                      password: "",
                      full_name: "",
                      phone: "",
                    });
                  }}
                  className="text-cosmic-gold hover:text-sky-300 transition-colors font-medium"
                >
                  {isLogin ? t("auth.register_title") : t("auth.login_title")}
                </button>
              </p>
            </motion.div>
          </form>
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4, duration: 0.6 }}
          className="text-center mt-8"
        >
          <Link
            href="/"
            className="text-slate-500 hover:text-slate-300 transition-colors text-sm"
          >
            ← {t("auth.back_to_home")}
          </Link>
        </motion.div>

        {/* Notificaciones */}
        {notifications.map(notification => (
          <ErrorNotification
            key={notification.id}
            {...notification}
            onClose={() => removeNotification(notification.id!)}
          />
        ))}
      </motion.div>
      <PrivacyModal
        isOpen={isPrivacyOpen}
        onClose={() => setIsPrivacyOpen(false)}
      />
    </CosmicBackground>
  );
}
