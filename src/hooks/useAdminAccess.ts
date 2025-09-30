"use client";

import { useEffect, useState } from "react";
import { useAuthUnified } from "./useAuthUnified";
import { createClient } from "@/lib/supabase/client";

type AdminAccessState = {
  canAccess: boolean;
  isLoading: boolean;
  error: string | null;
  userRole: string | null;
};

export function useAdminAccess(): AdminAccessState {
  const { user, loading } = useAuthUnified();
  const [state, setState] = useState<AdminAccessState>({
    canAccess: false,
    isLoading: true,
    error: null,
    userRole: null,
  });

  useEffect(() => {
    const verify = async () => {
      try {
        if (loading) {
          setState(prev => ({ ...prev, isLoading: true }));
          return;
        }

        if (!user) {
          setState({
            canAccess: false,
            isLoading: false,
            error: "no-user",
            userRole: null,
          });
          return;
        }

        const validRoles = ["admin", "staff"];
        if (!validRoles.includes(user.role)) {
          setState({
            canAccess: false,
            isLoading: false,
            error: "invalid-role",
            userRole: user.role,
          });
          return;
        }

        const supabase = createClient();
        const { data } = await supabase.auth.getSession();
        if (!data.session) {
          setState({
            canAccess: false,
            isLoading: false,
            error: "no-session",
            userRole: user.role,
          });
          return;
        }

        setState({
          canAccess: true,
          isLoading: false,
          error: null,
          userRole: user.role,
        });
      } catch (e) {
        setState({
          canAccess: false,
          isLoading: false,
          error: "error",
          userRole: user?.role ?? null,
        });
      }
    };

    verify();
  }, [user, loading]);

  return state;
}
