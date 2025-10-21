"use client";

import { useState } from "react";
import { useAdminAccess } from "@/hooks/useAdminAccess";
import { adminAccessLogger } from "@/lib/security/access-logger";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  HiOutlineCog6Tooth,
  HiOutlineArrowTopRightOnSquare,
} from "react-icons/hi2";

export default function AdminAccessButton() {
  const { canAccess, isLoading, verification, lastChecked, refreshAccess } =
    useAdminAccess();
  const { t } = useLanguage();
  const [busy, setBusy] = useState(false);

  // Mostrar el botón si tiene acceso, independientemente del estado de loading
  // Solo ocultar si explícitamente no tiene acceso
  if (!canAccess && !isLoading) return null;

  // Mostrar skeleton mientras carga por primera vez
  if (isLoading && !verification) {
    return (
      <div className="bg-gradient-to-r from-red-600 via-purple-600 to-blue-600 rounded-xl p-4 border border-red-500/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-6 w-6 bg-white/20 rounded animate-pulse" />
            <div>
              <div className="h-4 w-24 bg-white/20 rounded animate-pulse mb-1" />
              <div className="h-3 w-32 bg-white/10 rounded animate-pulse" />
            </div>
          </div>
          <div className="h-8 w-20 bg-white/10 rounded animate-pulse" />
        </div>
      </div>
    );
  }

  const handleClick = async () => {
    setBusy(true);

    try {
      // Log del intento de acceso al panel
      await adminAccessLogger.logAccessAttempt({
        event_type: "admin_access_attempt",
        user_id: verification?.userRole ? "current-user" : null, // El ID real se obtiene del contexto
        success: true,
        reason: "Acceso al panel administrativo",
        verification_details: {
          isAuthenticated: verification?.isAuthenticated || false,
          hasValidRole: verification?.hasValidRole || false,
          userRole: verification?.userRole || null,
          rolesSynchronized: verification?.rolesSynchronized || false,
          isUserActive: verification?.isUserActive || false,
          userStatus: verification?.userStatus || null,
          hasValidSession: verification?.hasValidSession || false,
          sessionExpiresAt: verification?.sessionExpiresAt || null,
        },
      });

      // En producción, usar el subdominio del admin
      const url =
        process.env.NODE_ENV === "production"
          ? "https://admin.cosmococktails.nl" // ← Cambiar por tu dominio real
          : "http://localhost:5174";

      window.open(url, "_blank", "noopener,noreferrer");
    } catch (error) {
      console.error("Error accessing admin panel:", error);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="bg-gradient-to-r from-red-600 via-purple-600 to-blue-600 rounded-xl p-4 border border-red-500/30">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <HiOutlineCog6Tooth className="h-6 w-6 text-white" />
          <div>
            <h3 className="text-white font-semibold">
              {t("admin.panel_title")}
            </h3>
            <p className="text-xs text-red-100">{t("admin.authorized_only")}</p>
            {lastChecked && (
              <p className="text-xs text-red-200">
                {t("admin.verified")}: {lastChecked.toLocaleTimeString()}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={refreshAccess}
            className="px-2 py-1 text-xs bg-white/10 hover:bg-white/20 text-white rounded"
            title={t("admin.refresh_permissions")}
          >
            ↻
          </button>
          <button
            onClick={handleClick}
            disabled={busy}
            className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg disabled:opacity-50"
          >
            {busy ? (
              <span>{t("admin.redirecting")}</span>
            ) : (
              <>
                <HiOutlineArrowTopRightOnSquare className="h-4 w-4" />
                <span>{t("admin.access")}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
