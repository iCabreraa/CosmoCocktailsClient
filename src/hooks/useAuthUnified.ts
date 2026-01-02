import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { User } from "@/types/user-system";
import { UserService } from "@/lib/services/user.service";
import { securityAuditor } from "@/lib/security/audit";

const supabase = createClient();
const userService = new UserService();

type AuthState = {
  user: User | null;
  loading: boolean;
  error: string | null;
  isInitialized: boolean;
};

let authState: AuthState = {
  user: null,
  loading: true,
  error: null,
  isInitialized: false,
};

const authListeners = new Set<(state: AuthState) => void>();
let authInitPromise: Promise<void> | null = null;
let authSubscription: { unsubscribe: () => void } | null = null;

const emitAuthState = () => {
  authListeners.forEach(listener => listener(authState));
};

const updateAuthState = (patch: Partial<AuthState>) => {
  authState = { ...authState, ...patch };
  emitAuthState();
};

const syncUserFromSession = async (sessionUser: { id: string } | null) => {
  if (!sessionUser) {
    updateAuthState({
      user: null,
      loading: false,
      error: null,
      isInitialized: true,
    });
    return;
  }

  try {
    const userProfile = await userService.getUserById(sessionUser.id);
    if (userProfile) {
      updateAuthState({
        user: userProfile,
        loading: false,
        error: null,
        isInitialized: true,
      });
    } else {
      console.warn("User authenticated but profile not found in users");
      updateAuthState({
        user: null,
        loading: false,
        error: null,
        isInitialized: true,
      });
    }
  } catch (err) {
    console.error("Error loading user profile:", err);
    updateAuthState({
      user: null,
      loading: false,
      error: "Failed to load user profile",
      isInitialized: true,
    });
  }
};

const ensureAuthInitialized = async () => {
  if (authInitPromise) return authInitPromise;

  authInitPromise = (async () => {
    try {
      const {
        data: { session },
        error: authError,
      } = await supabase.auth.getSession();

      if (authError) {
        console.error("Error getting initial session:", authError);
        updateAuthState({
          user: null,
          loading: false,
          error: "Failed to load user session",
          isInitialized: true,
        });
      } else {
        await syncUserFromSession(session?.user ?? null);
      }
    } catch (err) {
      console.error("Error getting initial session:", err);
      updateAuthState({
        user: null,
        loading: false,
        error: "Failed to load user session",
        isInitialized: true,
      });
    }

    if (!authSubscription) {
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange(async (_event, session) => {
        await syncUserFromSession(session?.user ?? null);
      });

      authSubscription = subscription;
    }
  })();

  return authInitPromise;
};

export function useAuthUnified() {
  const [state, setState] = useState(authState);

  useEffect(() => {
    const handleUpdate = (nextState: AuthState) => {
      setState(nextState);
    };

    authListeners.add(handleUpdate);
    setState(authState);
    void ensureAuthInitialized();

    return () => {
      authListeners.delete(handleUpdate);
    };
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    try {
      updateAuthState({ error: null });

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        await securityAuditor.logLogin("", false);
        await securityAuditor.logSuspiciousActivity(
          `Failed login attempt for email: ${email}`,
          { email, error: error.message }
        );
        updateAuthState({ error: error.message });
        return { data: null, error };
      }

      if (data.user) {
        const userProfile = await userService.getUserById(data.user.id);
        if (userProfile) {
          updateAuthState({ user: userProfile, error: null });
          await securityAuditor.logLogin(data.user.id, true);
        } else {
          updateAuthState({ user: null, error: "User profile not found" });
        }
      }

      return { data, error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      updateAuthState({ error: errorMessage });
      await securityAuditor.logSuspiciousActivity(
        `Login error for email: ${email}`,
        { email, error: errorMessage }
      );
      return { data: null, error: { message: errorMessage } };
    }
  }, []);

  const signUp = useCallback(
    async (email: string, password: string, full_name: string, phone?: string) => {
      try {
        updateAuthState({ error: null });

        const response = await fetch("/api/auth/signup", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            password,
            full_name,
            phone,
          }),
        });

        const result = await response.json();

        if (!response.ok) {
          updateAuthState({ error: result.error });
          return { data: null, error: { message: result.error } };
        }

        return { data: result, error: null };
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Unknown error";
        updateAuthState({ error: errorMessage });
        return { data: null, error: { message: errorMessage } };
      }
    },
    []
  );

  const signOut = useCallback(async () => {
    try {
      updateAuthState({ error: null });

      if (state.user) {
        await securityAuditor.logLogout(state.user.id);
      }

      const { error } = await supabase.auth.signOut();

      if (error) {
        const message = error.message?.toLowerCase?.() ?? "";
        const sessionMissing =
          message.includes("session") && message.includes("missing");
        if (sessionMissing) {
          updateAuthState({ user: null, error: null });
          return { error: null };
        }
        updateAuthState({ error: error.message });
        return { error };
      }

      updateAuthState({ user: null, error: null });
      return { error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      updateAuthState({ error: errorMessage });
      return { error: { message: errorMessage } };
    }
  }, [state.user]);

  const updateProfile = useCallback(
    async (updates: Partial<User>) => {
      if (!state.user) {
        updateAuthState({ error: "No user logged in" });
        return { data: null, error: { message: "No user logged in" } };
      }

      try {
        updateAuthState({ error: null });
        const updatedUser = await userService.updateUser(state.user.id, updates);
        updateAuthState({ user: updatedUser, error: null });
        return { data: updatedUser, error: null };
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Unknown error";
        updateAuthState({ error: errorMessage });
        return { data: null, error: { message: errorMessage } };
      }
    },
    [state.user]
  );

  return {
    user: state.user,
    loading: state.loading,
    error: state.error,
    signIn,
    signUp,
    signOut,
    updateProfile,
    isAuthenticated: !!state.user,
    // Alias for compatibility with useAuth
    login: signIn,
    logout: signOut,
    signup: signUp,
  };
}
