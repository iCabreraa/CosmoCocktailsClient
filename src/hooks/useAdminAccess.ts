"use client";

import { useState, useEffect } from "react";
import { useAuthUnified } from "./useAuthUnified";
import { createClient } from "@/lib/supabase/client";

interface AdminAccessState {
  canAccess: boolean;
  isLoading: boolean;
  error: string | null;
  userRole: string | null;
}

export function useAdminAccess() {
  const { user, loading } = useAuthUnified();
  const [state, setState] = useState<AdminAccessState>({
    canAccess: false,
    isLoading: true,
    error: null,
    userRole: null,
  });

  useEffect(() => {
    const verifyAdminAccess = async () => {
      try {
        setState(prev => ({ ...prev, isLoading: true, error: null }));

        // Verificación 1: Usuario autenticado
        if (loading) {
          setState(prev => ({ ...prev, isLoading: true }));
          return;
        }

        if (!user) {
          setState({
            canAccess: false,
            isLoading: false,
            error: "Usuario no autenticado",
            userRole: null,
          });
          return;
        }

        // Verificación 2: Rol válido
        const validRoles = ["admin", "staff"];

        if (!validRoles.includes(user.role)) {
          setState({
            canAccess: false,
            isLoading: false,
            error: "Rol insuficiente",
            userRole: user.role,
          });
          return;
        }

        // Verificación 3: Sesión activa en Supabase
        const supabase = createClient();
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError || !session) {
          setState({
            canAccess: false,
            isLoading: false,
            error: "Sesión expirada",
            userRole: user.role,
          });
          return;
        }

        // Verificación 4: Estado del usuario
        if (user.status !== "active") {
          setState({
            canAccess: false,
            isLoading: false,
            error: "Usuario inactivo",
            userRole: user.role,
          });
          return;
        }

        // Todas las verificaciones pasaron
        setState({
          canAccess: true,
          isLoading: false,
          error: null,
          userRole: user.role,
        });

        // Log de acceso exitoso para auditoría
        console.log(
          `✅ Admin access verified for user: ${user.email} (${user.role}) at ${new Date().toISOString()}`
        );
      } catch (error) {
        console.error("❌ Error verifying admin access:", error);
        setState({
          canAccess: false,
          isLoading: false,
          error: "Error de verificación",
          userRole: user?.role || null,
        });
      }
    };

    verifyAdminAccess();
  }, [user, loading]);

  return state;
}
