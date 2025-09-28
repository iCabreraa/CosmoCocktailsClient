"use client";

import { useEffect, useCallback, useState } from "react";
import { useAuthUnified } from "./useAuthUnified";
import { createClient } from "@/lib/supabase/client";
import { securityAuditor } from "@/lib/security/audit";

export function useAuthRefresh() {
  const { user, loading, signOut: logout } = useAuthUnified();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshError, setRefreshError] = useState<string | null>(null);
  const supabase = createClient();

  const refreshSession = useCallback(
    async (silent = false) => {
      if (isRefreshing) return false;

      try {
        setIsRefreshing(true);
        setRefreshError(null);

        const { data, error } = await supabase.auth.refreshSession();

        if (error) {
          console.error("Error refreshing session:", error);

          // Log refresh failure
          if (user) {
            await securityAuditor.logSuspiciousActivity(
              "Session refresh failed",
              {
                userId: user.id,
                error: error.message,
                silent,
              }
            );
          }

          setRefreshError(error.message);

          // If refresh fails and it's not silent, logout user
          if (!silent) {
            await logout();
          }

          return false;
        }

        if (data.session) {
          // Log successful refresh
          if (user) {
            await securityAuditor.logEvent({
              user_id: user.id,
              event_type: "login",
              description: "Session refreshed successfully",
              metadata: { refresh: true, silent },
            });
          }

          return true;
        }

        return false;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";
        console.error("Error refreshing session:", error);
        setRefreshError(errorMessage);

        if (user) {
          await securityAuditor.logSuspiciousActivity("Session refresh error", {
            userId: user.id,
            error: errorMessage,
            silent,
          });
        }

        return false;
      } finally {
        setIsRefreshing(false);
      }
    },
    [supabase, user, logout, isRefreshing]
  );

  useEffect(() => {
    if (!user || loading) return;

    // Refresh session every 50 minutes (tokens expire in 60 minutes)
    const refreshInterval = setInterval(
      async () => {
        await refreshSession(true); // Silent refresh
      },
      50 * 60 * 1000
    ); // 50 minutes

    // Refresh session when tab becomes visible
    const handleVisibilityChange = async () => {
      if (document.visibilityState === "visible" && user) {
        await refreshSession(true); // Silent refresh
      }
    };

    // Refresh session when window regains focus
    const handleFocus = async () => {
      if (user) {
        await refreshSession(true); // Silent refresh
      }
    };

    // Refresh session before page unload
    const handleBeforeUnload = async () => {
      if (user) {
        await refreshSession(true); // Silent refresh
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("focus", handleFocus);
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      clearInterval(refreshInterval);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", handleFocus);
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [user, loading, refreshSession]);

  return {
    refreshSession,
    isRefreshing,
    refreshError,
    clearRefreshError: () => setRefreshError(null),
  };
}
