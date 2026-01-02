"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  HiOutlineCog,
  HiOutlineBell,
  HiOutlineShieldCheck,
  HiOutlineLanguage,
  HiOutlineMoon,
  HiOutlineSun,
  HiOutlineCheck,
  HiXMark,
} from "react-icons/hi2";
import { User } from "@/types/user-system";
import { useTheme } from "@/hooks/useTheme";
import { useLanguage } from "@/contexts/LanguageContext";
import PrivacyModal from "@/components/privacy/PrivacyModal";

interface UserSettingsProps {
  user: User;
  onUpdate: (updates: Partial<User>) => Promise<void>;
}

export default function UserSettings({ user, onUpdate }: UserSettingsProps) {
  const { theme, changeTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  const [settings, setSettings] = useState({
    notifications: {
      email: true,
      push: false,
      marketing: true,
    },
    privacy: {
      profile_public: true,
      show_orders: true,
    },
    preferences: {
      theme: theme,
      language: "es",
      currency: "EUR",
      timezone: "Europe/Madrid",
    },
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [originalSettings, setOriginalSettings] = useState<any>(null);
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);

  useEffect(() => {
    // Cargar preferencias del usuario al montar el componente
    const fetchPreferences = async () => {
      try {
        const response = await fetch("/api/preferences");
        if (!response.ok) throw new Error("Error al cargar preferencias");
        const data = await response.json();
        setSettings(prev => ({
          ...prev,
          preferences: { ...prev.preferences, ...data.preferences },
        }));
        setOriginalSettings({
          ...settings,
          preferences: { ...settings.preferences, ...data.preferences },
        });
      } catch (err) {
        console.error("Failed to fetch preferences:", err);
        setError(
          err instanceof Error ? err.message : "Error al cargar preferencias"
        );
      }
    };
    fetchPreferences();
  }, [user.id]);

  const handleSave = async () => {
    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      // Enviar solo las preferencias que se pueden actualizar
      const response = await fetch("/api/preferences", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          theme: settings.preferences.theme,
          language: settings.preferences.language,
          currency: settings.preferences.currency,
        }),
      });

      if (!response.ok) throw new Error("Error al guardar configuración");

      const data = await response.json();
      setSettings(prev => ({
        ...prev,
        preferences: { ...prev.preferences, ...data.preferences },
      }));
      setSuccess(true);
      setHasUnsavedChanges(false);
      setOriginalSettings(settings);
      setTimeout(() => setSuccess(false), 3000); // Ocultar mensaje de éxito
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al guardar configuración"
      );
    } finally {
      setLoading(false);
    }
  };

  const updateSetting = (
    category: "notifications" | "privacy" | "preferences",
    key: string,
    value: any
  ) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category as keyof typeof prev],
        [key]: value,
      },
    }));
    setHasUnsavedChanges(true);
  };

  return (
    <div className="space-y-6 text-slate-100">
      {/* Header */}
      <div className="bg-white/5 backdrop-blur-md border border-[#3b82f6]/30 hover:border-[#f59e0b]/40 shadow-[0_0_40px_rgba(59,130,246,.08)] rounded-xl p-6">
        <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#8b5cf6] to-[#3b82f6] flex items-center">
          <HiOutlineCog className="h-6 w-6 mr-3 text-purple-400" />
          {t("settings.title")}
        </h2>
        <p className="text-gray-300 mt-2">{t("settings.subtitle")}</p>
      </div>

      {error && (
        <div className="bg-red-600/20 border border-red-400 rounded-lg p-4">
          <p className="text-red-300 text-sm">{error}</p>
        </div>
      )}

      {/* Appearance Settings */}
      <div className="bg-white/5 backdrop-blur-md border border-[#3b82f6]/30 hover:border-[#f59e0b]/40 shadow-[0_0_40px_rgba(59,130,246,.08)] rounded-xl p-6">
        <h3 className="text-lg font-semibold text-transparent bg-clip-text bg-gradient-to-r from-[#8b5cf6] to-[#3b82f6] mb-4 flex items-center">
          <HiOutlineMoon className="h-5 w-5 mr-2 text-blue-400" />
          {t("settings.appearance")}
        </h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">
              {t("settings.theme")}
            </label>
            <div className="grid grid-cols-2 gap-4">
              <button
                disabled
                className="p-4 rounded-lg border-2 transition-colors border-gray-600 text-gray-400 bg-gray-800/50 cursor-not-allowed relative"
              >
                <HiOutlineSun className="h-6 w-6 mx-auto mb-2" />
                <p className="text-sm font-medium">{t("settings.light")}</p>
                <div className="absolute top-1 right-1 bg-orange-500 text-white text-xs px-1 py-0.5 rounded">
                  {t("settings.coming_soon")}
                </div>
              </button>
              <button
                onClick={() => {
                  updateSetting("preferences", "theme", "dark");
                  changeTheme("dark");
                }}
                className={`p-4 rounded-lg border-2 transition-colors ${
                  theme === "dark"
                    ? "border-purple-400 bg-purple-400/20 text-purple-200"
                    : "border-gray-600 hover:border-gray-500 text-gray-200 bg-gray-800/50"
                }`}
              >
                <HiOutlineMoon className="h-6 w-6 mx-auto mb-2" />
                <p className="text-sm font-medium">{t("settings.dark")}</p>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Language Settings */}
      <div className="bg-white/5 backdrop-blur-md border border-[#3b82f6]/30 hover:border-[#f59e0b]/40 shadow-[0_0_40px_rgba(59,130,246,.08)] rounded-xl p-6">
        <h3 className="text-lg font-semibold text-transparent bg-clip-text bg-gradient-to-r from-[#8b5cf6] to-[#3b82f6] mb-4 flex items-center">
          <HiOutlineLanguage className="h-5 w-5 mr-2 text-green-400" />
          {t("settings.language")}
        </h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              {t("settings.language_label")}
            </label>
            <select
              value={language}
              onChange={e => {
                const newLanguage = e.target.value as "es" | "en" | "nl";
                updateSetting("preferences", "language", newLanguage);
                setLanguage(newLanguage);
              }}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white"
            >
              <option value="es">Español</option>
              <option value="en">English</option>
              <option value="nl">Nederlands</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              {t("settings.currency")}
            </label>
            <select
              value={settings.preferences.currency}
              onChange={e =>
                updateSetting("preferences", "currency", e.target.value)
              }
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white"
              disabled // Deshabilitado temporalmente
            >
              <option value="EUR">EUR (€)</option>
              {/* <option value="USD">USD ($)</option>
              <option value="GBP">GBP (£)</option> */}
            </select>
            <p className="text-xs text-gray-500 mt-1">
              Solo EUR disponible para envíos en Holanda.
            </p>
          </div>
        </div>
      </div>

      {/* Notification Settings */}
      <div className="bg-white/5 backdrop-blur-md border border-[#3b82f6]/30 hover:border-[#f59e0b]/40 shadow-[0_0_40px_rgba(59,130,246,.08)] rounded-xl p-6">
        <h3 className="text-lg font-semibold text-transparent bg-clip-text bg-gradient-to-r from-[#8b5cf6] to-[#3b82f6] mb-4 flex items-center">
          <HiOutlineBell className="h-5 w-5 mr-2 text-yellow-400" />
          {t("settings.notifications.title")}
        </h3>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-white">
                {t("settings.notifications.email.title")}
              </p>
              <p className="text-sm text-gray-400">
                {t("settings.notifications.email.description")}
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.notifications.email}
                onChange={e =>
                  updateSetting("notifications", "email", e.target.checked)
                }
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-white">
                {t("settings.notifications.push.title")}
              </p>
              <p className="text-sm text-gray-400">
                {t("settings.notifications.push.description")}
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.notifications.push}
                onChange={e =>
                  updateSetting("notifications", "push", e.target.checked)
                }
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-white">
                {t("settings.notifications.marketing.title")}
              </p>
              <p className="text-sm text-gray-400">
                {t("settings.notifications.marketing.description")}
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.notifications.marketing}
                onChange={e =>
                  updateSetting("notifications", "marketing", e.target.checked)
                }
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Privacy Settings */}
      <div className="bg-white/5 backdrop-blur-md border border-[#3b82f6]/30 hover:border-[#f59e0b]/40 shadow-[0_0_40px_rgba(59,130,246,.08)] rounded-xl p-6">
        <h3 className="text-lg font-semibold text-transparent bg-clip-text bg-gradient-to-r from-[#8b5cf6] to-[#3b82f6] mb-4 flex items-center">
          <HiOutlineShieldCheck className="h-5 w-5 mr-2 text-red-400" />
          {t("settings.privacy.title")}
        </h3>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-white">
                {t("settings.privacy.profile_public.title")}
              </p>
              <p className="text-sm text-gray-400">
                {t("settings.privacy.profile_public.description")}
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.privacy.profile_public}
                onChange={e =>
                  updateSetting("privacy", "profile_public", e.target.checked)
                }
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-white">
                {t("settings.privacy.show_orders.title")}
              </p>
              <p className="text-sm text-gray-400">
                {t("settings.privacy.show_orders.description")}
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.privacy.show_orders}
                onChange={e =>
                  updateSetting("privacy", "show_orders", e.target.checked)
                }
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Legal & Support */}
      <div className="bg-white/5 backdrop-blur-md border border-[#3b82f6]/30 hover:border-[#f59e0b]/40 shadow-[0_0_40px_rgba(59,130,246,.08)] rounded-xl p-6">
        <h3 className="text-lg font-semibold text-transparent bg-clip-text bg-gradient-to-r from-[#8b5cf6] to-[#3b82f6] mb-3">
          {t("settings.legal.title")}
        </h3>
        <p className="text-sm text-gray-300 mb-4">
          {t("settings.legal.description")}
        </p>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => setIsPrivacyOpen(true)}
            className="px-4 py-2 rounded-lg border border-gray-600/60 text-sm text-gray-200 hover:border-cosmic-gold/60 hover:text-cosmic-gold transition-colors"
          >
            {t("settings.legal.privacy")}
          </button>
          <Link
            href="/terms"
            className="px-4 py-2 rounded-lg border border-gray-600/60 text-sm text-gray-200 hover:border-cosmic-gold/60 hover:text-cosmic-gold transition-colors"
          >
            {t("settings.legal.terms")}
          </Link>
          <Link
            href="/cookies"
            className="px-4 py-2 rounded-lg border border-gray-600/60 text-sm text-gray-200 hover:border-cosmic-gold/60 hover:text-cosmic-gold transition-colors"
          >
            {t("settings.legal.cookies")}
          </Link>
          <Link
            href="/contact"
            className="px-4 py-2 rounded-lg border border-gray-600/60 text-sm text-gray-200 hover:border-cosmic-gold/60 hover:text-cosmic-gold transition-colors"
          >
            {t("settings.legal.contact")}
          </Link>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end space-x-3 mt-6 pt-6 border-t border-gray-700">
        {hasUnsavedChanges && (
          <span className="text-orange-400 flex items-center mr-4">
            <HiXMark className="h-5 w-5 mr-2" />
            Tienes cambios sin guardar
          </span>
        )}
        {success && (
          <span className="text-green-400 flex items-center mr-4">
            <HiOutlineCheck className="h-5 w-5 mr-2" />
            Configuración guardada!
          </span>
        )}
        {error && (
          <span className="text-red-400 flex items-center mr-4">
            <HiXMark className="h-5 w-5 mr-2" />
            Error: {error}
          </span>
        )}
        <button
          onClick={handleSave}
          disabled={loading || !hasUnsavedChanges}
          className="flex items-center px-6 py-3 text-lg font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? (
            <span className="animate-spin h-5 w-5 mr-3 border-b-2 border-white rounded-full"></span>
          ) : (
            <HiOutlineCheck className="h-5 w-5 mr-3" />
          )}
          Guardar Cambios
        </button>
      </div>

      <PrivacyModal
        isOpen={isPrivacyOpen}
        onClose={() => setIsPrivacyOpen(false)}
      />
    </div>
  );
}
