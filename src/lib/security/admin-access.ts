"use client";

import { createClient } from "@/lib/supabase/client";
import { User } from "@/types/user-system";

export interface AdminAccessVerification {
  // Nivel 1: Autenticación básica
  isAuthenticated: boolean;

  // Nivel 2: Rol en base de datos
  hasValidRole: boolean;
  userRole: string | null;

  // Nivel 3: Sincronización de roles
  rolesSynchronized: boolean;

  // Nivel 4: Estado del usuario
  isUserActive: boolean;
  userStatus: string | null;

  // Nivel 5: Sesión válida
  hasValidSession: boolean;
  sessionExpiresAt: Date | null;

  // Resultado final
  canAccess: boolean;
  reason?: string;
}

class AdminAccessVerifier {
  private supabase = createClient();
  private cache = new Map<
    string,
    { data: AdminAccessVerification; timestamp: number }
  >();
  private readonly CACHE_DURATION = 2 * 60 * 1000; // 2 minutos

  async verifyAdminAccess(user: User | null): Promise<AdminAccessVerification> {
    const cacheKey = user?.id || "anonymous";
    const cached = this.cache.get(cacheKey);

    // Verificar cache
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data;
    }

    const verification = await this.performVerification(user);

    // Actualizar cache
    this.cache.set(cacheKey, {
      data: verification,
      timestamp: Date.now(),
    });

    return verification;
  }

  private async performVerification(
    user: User | null
  ): Promise<AdminAccessVerification> {
    const verification: AdminAccessVerification = {
      isAuthenticated: false,
      hasValidRole: false,
      userRole: null,
      rolesSynchronized: false,
      isUserActive: false,
      userStatus: null,
      hasValidSession: false,
      sessionExpiresAt: null,
      canAccess: false,
    };

    try {
      // NIVEL 1: Verificar autenticación básica
      verification.isAuthenticated = !!user;
      if (!user) {
        verification.reason = "Usuario no autenticado";
        return verification;
      }

      // NIVEL 2: Verificar rol en base de datos
      verification.userRole = user.role;
      verification.hasValidRole = ["admin", "staff"].includes(user.role);
      if (!verification.hasValidRole) {
        verification.reason = `Rol inválido: ${user.role}`;
        return verification;
      }

      // NIVEL 3: Verificar sincronización de roles con auth.users
      const { data: authUser } = await this.supabase.auth.getUser();
      if (authUser.user) {
        const authRole = authUser.user.user_metadata?.role;
        verification.rolesSynchronized = authRole === user.role;
        if (!verification.rolesSynchronized) {
          verification.reason = `Roles desincronizados: DB(${user.role}) vs Auth(${authRole})`;
          return verification;
        }
      }

      // NIVEL 4: Verificar estado del usuario
      verification.userStatus = user.status;
      verification.isUserActive = user.status === "active";
      if (!verification.isUserActive) {
        verification.reason = `Usuario inactivo: ${user.status}`;
        return verification;
      }

      // NIVEL 5: Verificar sesión válida
      const { data: sessionData } = await this.supabase.auth.getSession();
      verification.hasValidSession = !!sessionData.session;
      if (sessionData.session?.expires_at) {
        verification.sessionExpiresAt = new Date(
          sessionData.session.expires_at * 1000
        );
        const isExpired = verification.sessionExpiresAt < new Date();
        if (isExpired) {
          verification.reason = "Sesión expirada";
          return verification;
        }
      }

      // Si llegamos aquí, el acceso está autorizado
      verification.canAccess = true;
      verification.reason = "Acceso autorizado";
    } catch (error) {
      verification.reason = `Error en verificación: ${error instanceof Error ? error.message : "Error desconocido"}`;
      console.error("Error verifying admin access:", error);
    }

    return verification;
  }

  // Limpiar cache cuando sea necesario
  clearCache(userId?: string): void {
    if (userId) {
      this.cache.delete(userId);
    } else {
      this.cache.clear();
    }
  }

  // Verificar si el cache está válido
  isCacheValid(userId: string): boolean {
    const cached = this.cache.get(userId);
    return cached ? Date.now() - cached.timestamp < this.CACHE_DURATION : false;
  }
}

export const adminAccessVerifier = new AdminAccessVerifier();
