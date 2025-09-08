"use client";

import { useEffect, useCallback } from "react";
import { useAuth } from "./useAuth";
import { createClient } from "@/lib/supabase/client";

export function useAuthRefresh() {
  const { user, loading } = useAuth();
  const supabase = createClient();

  const refreshSession = useCallback(async () => {
    try {
      const { data, error } = await supabase.auth.refreshSession();
      if (error) {
        console.error("Error refreshing session:", error);
        return false;
      }
      return !!data.session;
    } catch (error) {
      console.error("Error refreshing session:", error);
      return false;
    }
  }, [supabase]);

  useEffect(() => {
    if (!user || loading) return;

    // Refresh session every 50 minutes (tokens expire in 60 minutes)
    const refreshInterval = setInterval(
      async () => {
        const refreshed = await refreshSession();
        if (!refreshed) {
          console.log("Session refresh failed, user will need to re-login");
        }
      },
      50 * 60 * 1000
    ); // 50 minutes

    // Refresh session when tab becomes visible
    const handleVisibilityChange = async () => {
      if (document.visibilityState === "visible") {
        await refreshSession();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      clearInterval(refreshInterval);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [user, loading, refreshSession]);

  return { refreshSession };
}
