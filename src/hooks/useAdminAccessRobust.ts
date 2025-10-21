"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useAuthUnified } from "./useAuthUnified";
import {
  adminAccessVerifier,
  AdminAccessVerification,
} from "@/lib/security/admin-access";
import { adminAccessLogger } from "@/lib/security/access-logger";
import { createClient } from "@/lib/supabase/client";

export interface AdminAccessState {
  canAccess: boolean;
  isLoading: boolean;
  error: string | null;
  userRole: string | null;
  verification: AdminAccessVerification | null;
  lastChecked: Date | null;
  refreshAccess: () => void;
}

export function useAdminAccessRobust(): AdminAccessState {
  const { user, loading } = useAuthUnified();
  const [state, setState] = useState<AdminAccessState>({
    canAccess: false,
    isLoading: true,
    error: null,
    userRole: null,
    verification: null,
    lastChecked: null,
    refreshAccess: () => {}, // Placeholder inicial
  });

  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const visibilityTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Función para verificar acceso administrativo
  const verifyAccess = useCallback(
    async (forceRefresh = false) => {
      try {
        // Solo mostrar loading si no hay datos previos o es un refresh forzado
        if (!state.verification || forceRefresh) {
          setState(prev => ({ ...prev, isLoading: true, error: null }));
        }

        const verification = await adminAccessVerifier.verifyAdminAccess(user);

        // Log del intento de acceso
        await adminAccessLogger.logAccessAttempt({
          event_type: verification.canAccess
            ? "admin_access_granted"
            : "admin_access_denied",
          user_id: user?.id || null,
          success: verification.canAccess,
          reason: verification.reason,
          verification_details: {
            isAuthenticated: verification.isAuthenticated,
            hasValidRole: verification.hasValidRole,
            userRole: verification.userRole,
            rolesSynchronized: verification.rolesSynchronized,
            isUserActive: verification.isUserActive,
            userStatus: verification.userStatus,
            hasValidSession: verification.hasValidSession,
            sessionExpiresAt: verification.sessionExpiresAt,
          },
        });

        setState(prev => ({
          ...prev,
          canAccess: verification.canAccess,
          isLoading: false,
          error: verification.canAccess
            ? null
            : verification.reason || "Acceso denegado",
          userRole: verification.userRole,
          verification,
          lastChecked: new Date(),
        }));

        // Debug logging
        if (process.env.NODE_ENV === "development") {
          console.log("[AdminAccess] Verification completed:", {
            canAccess: verification.canAccess,
            userRole: verification.userRole,
            reason: verification.reason,
            timestamp: new Date().toISOString(),
          });
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Error desconocido";

        // Log del error
        await adminAccessLogger.logAccessAttempt({
          event_type: "admin_access_denied",
          user_id: user?.id || null,
          success: false,
          reason: errorMessage,
          verification_details: {
            isAuthenticated: !!user,
            hasValidRole: false,
            userRole: user?.role || null,
            rolesSynchronized: false,
            isUserActive: false,
            userStatus: user?.status || null,
            hasValidSession: false,
            sessionExpiresAt: null,
          },
        });

        setState(prev => ({
          ...prev,
          canAccess: false,
          isLoading: false,
          error: errorMessage,
          userRole: user?.role || null,
          verification: null,
          lastChecked: new Date(),
        }));
      }
    },
    [user, state.verification]
  );

  // Función para manejar cambios de visibilidad de la página
  const handleVisibilityChange = useCallback(() => {
    if (!document.hidden && user) {
      // Limpiar timeout anterior si existe
      if (visibilityTimeoutRef.current) {
        clearTimeout(visibilityTimeoutRef.current);
      }

      // Verificar acceso después de un breve delay
      visibilityTimeoutRef.current = setTimeout(() => {
        adminAccessVerifier.clearCache(user.id);
        verifyAccess(true);
      }, 1000);
    }
  }, [user, verifyAccess]);

  // Función para manejar cambios de foco de la ventana
  const handleFocus = useCallback(() => {
    if (user) {
      adminAccessVerifier.clearCache(user.id);
      verifyAccess(true);
    }
  }, [user, verifyAccess]);

  // Función para manejar cambios en localStorage
  const handleStorageChange = useCallback(
    (event: StorageEvent) => {
      if (event.key?.includes("supabase") && user) {
        adminAccessVerifier.clearCache(user.id);
        verifyAccess(true);
      }
    },
    [user, verifyAccess]
  );

  // Efecto principal para verificar acceso
  useEffect(() => {
    if (loading) {
      setState(prev => ({ ...prev, isLoading: true }));
      return;
    }

    verifyAccess();
  }, [user, loading, verifyAccess]);

  // Efecto para escuchar cambios de autenticación de Supabase
  useEffect(() => {
    if (!user) return;

    const supabase = createClient();

    // Escuchar cambios de autenticación
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log(
        "[AdminAccess] Auth state changed:",
        event,
        session?.user?.id
      );

      // Limpiar cache cuando hay cambios de auth
      adminAccessVerifier.clearCache(user.id);

      // Verificar acceso después de cambios de auth
      if (
        event === "SIGNED_IN" ||
        event === "TOKEN_REFRESHED" ||
        event === "SIGNED_OUT"
      ) {
        // Pequeño delay para asegurar que el estado se actualice
        setTimeout(() => {
          verifyAccess(true);
        }, 100);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [user, verifyAccess]);

  // Efecto para configurar refresh automático
  useEffect(() => {
    if (!user) return;

    // Refresh cada 5 minutos
    refreshIntervalRef.current = setInterval(
      () => {
        verifyAccess(true);
      },
      5 * 60 * 1000
    );

    // Eventos de visibilidad y foco
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("focus", handleFocus);
    window.addEventListener("storage", handleStorageChange);

    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
      if (visibilityTimeoutRef.current) {
        clearTimeout(visibilityTimeoutRef.current);
      }
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", handleFocus);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [
    user,
    verifyAccess,
    handleVisibilityChange,
    handleFocus,
    handleStorageChange,
  ]);

  // Función para refresh manual
  const refreshAccess = useCallback(() => {
    if (user) {
      adminAccessVerifier.clearCache(user.id);
      verifyAccess(true);
    }
  }, [user, verifyAccess]);

  // Actualizar refreshAccess en el estado
  useEffect(() => {
    setState(prev => ({ ...prev, refreshAccess }));
  }, [refreshAccess]);

  return state;
}
