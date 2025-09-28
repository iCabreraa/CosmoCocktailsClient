"use client";

import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAdminAccess } from "@/hooks/useAdminAccess";
import {
  HiOutlineCog6Tooth,
  HiOutlineArrowTopRightOnSquare,
} from "react-icons/hi2";
import { toast } from "react-hot-toast";

export default function AdminAccessButton() {
  const { t } = useLanguage();
  const { canAccess, isLoading, error, userRole } = useAdminAccess();
  const [isRedirecting, setIsRedirecting] = useState(false);

  // Verificación de seguridad: Solo mostrar si tiene acceso
  if (isLoading || !canAccess) {
    return null;
  }

  const handleAdminAccess = async () => {
    try {
      setIsRedirecting(true);

      // Verificación adicional de seguridad usando el hook
      if (!canAccess) {
        toast.error(t("admin.access_denied"));
        return;
      }

      // Log del acceso admin para auditoría
      console.log(
        `🔐 Admin access attempt by user with role: ${userRole} at ${new Date().toISOString()}`
      );

      // Redirección segura al panel de administración
      const adminUrl = "http://localhost:5174";

      // Abrir en nueva pestaña para mantener la sesión del e-commerce
      const newWindow = window.open(adminUrl, "_blank", "noopener,noreferrer");

      if (!newWindow) {
        toast.error(t("admin.popup_blocked"));
        return;
      }

      toast.success(t("admin.access_granted"));
    } catch (error) {
      console.error("❌ Error accessing admin panel:", error);
      toast.error(t("admin.access_error"));
    } finally {
      setIsRedirecting(false);
    }
  };

  return (
    <div className="bg-gradient-to-r from-red-600 via-purple-600 to-blue-600 rounded-xl p-4 border border-red-500/30 shadow-[0_0_24px_rgba(239,68,68,.15)]">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-white/20 rounded-lg">
            <HiOutlineCog6Tooth className="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">
              {t("admin.panel_title")}
            </h3>
            <p className="text-sm text-red-100">
              {t("admin.panel_description")}
            </p>
          </div>
        </div>

        <button
          onClick={handleAdminAccess}
          disabled={isRedirecting}
          className="flex items-center space-x-2 px-4 py-2 bg-white/20 hover:bg-white/30 border border-white/30 rounded-lg text-white font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isRedirecting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
              <span>{t("admin.redirecting")}</span>
            </>
          ) : (
            <>
              <HiOutlineArrowTopRightOnSquare className="h-4 w-4" />
              <span>{t("admin.access_button")}</span>
            </>
          )}
        </button>
      </div>

      {/* Información de seguridad */}
      <div className="mt-3 pt-3 border-t border-white/20">
        <p className="text-xs text-red-200">🔒 {t("admin.security_notice")}</p>
      </div>
    </div>
  );
}
