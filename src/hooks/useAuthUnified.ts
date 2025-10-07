import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { User } from "@/types/user-system";
import { UserService } from "@/lib/services/user.service";
import { securityAuditor } from "@/lib/security/audit";

const userService = new UserService();

export function useAuthUnified() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    // Obtener sesión inicial
    const getInitialSession = async () => {
      try {
        // Primero intentar obtener la sesión sin timeout para mantener persistencia
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session?.user) {
          // Buscar perfil completo en users_new
          const userProfile = await userService.getUserById(session.user.id);
          if (userProfile) {
            setUser(userProfile);
          } else {
            console.warn(
              "User authenticated but profile not found in users_new"
            );
            setUser(null);
          }
        } else {
          setUser(null);
        }
      } catch (err) {
        console.error("Error getting initial session:", err);
        setError("Failed to load user session");
        setUser(null);
      } finally {
        setLoading(false);
        setIsInitialized(true);
      }
    };

    getInitialSession();

    // Escuchar cambios de autenticación
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (process.env.NODE_ENV === "development") {
        // eslint-disable-next-line no-console
        console.log("Auth state changed:", event, session?.user?.id);
      }

      // Solo procesar cambios después de la inicialización inicial
      if (!isInitialized) return;

      if (session?.user) {
        try {
          // Buscar perfil completo en users_new
          const userProfile = await userService.getUserById(session.user.id);
          if (userProfile) {
            setUser(userProfile);
          } else {
            console.warn(
              "User authenticated but profile not found in users_new"
            );
            setUser(null);
          }
        } catch (err) {
          console.error("Error loading user profile:", err);
          setError("Failed to load user profile");
          setUser(null);
        }
      } else {
        setUser(null);
      }
      // No cambiar loading aquí para evitar interrupciones
    });

    return () => subscription.unsubscribe();
  }, [supabase.auth, isInitialized]);

  const signIn = async (email: string, password: string) => {
    try {
      setError(null);

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        // Log failed login attempt
        await securityAuditor.logLogin("", false);
        await securityAuditor.logSuspiciousActivity(
          `Failed login attempt for email: ${email}`,
          { email, error: error.message }
        );
        setError(error.message);
        return { data: null, error };
      }

      if (data.user) {
        // Buscar perfil completo en users_new
        const userProfile = await userService.getUserById(data.user.id);
        if (userProfile) {
          setUser(userProfile);
          // Log successful login
          await securityAuditor.logLogin(data.user.id, true);
        } else {
          setError("User profile not found");
          setUser(null);
        }
      }

      return { data, error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      setError(errorMessage);
      await securityAuditor.logSuspiciousActivity(
        `Login error for email: ${email}`,
        { email, error: errorMessage }
      );
      return { data: null, error: { message: errorMessage } };
    }
  };

  const signUp = async (
    email: string,
    password: string,
    full_name: string,
    phone?: string
  ) => {
    try {
      setError(null);

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
        setError(result.error);
        return { data: null, error: { message: result.error } };
      }

      return { data: result, error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      setError(errorMessage);
      return { data: null, error: { message: errorMessage } };
    }
  };

  const signOut = async () => {
    try {
      setError(null);

      // Log logout before signing out
      if (user) {
        await securityAuditor.logLogout(user.id);
      }

      const { error } = await supabase.auth.signOut();

      if (error) {
        setError(error.message);
        return { error };
      }

      setUser(null);
      return { error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      setError(errorMessage);
      return { error: { message: errorMessage } };
    }
  };

  const updateProfile = async (updates: Partial<User>) => {
    if (!user) {
      setError("No user logged in");
      return { data: null, error: { message: "No user logged in" } };
    }

    try {
      setError(null);
      const updatedUser = await userService.updateUser(user.id, updates);
      setUser(updatedUser);
      return { data: updatedUser, error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      setError(errorMessage);
      return { data: null, error: { message: errorMessage } };
    }
  };

  return {
    user,
    loading,
    error,
    signIn,
    signUp,
    signOut,
    updateProfile,
    isAuthenticated: !!user,
    // Alias for compatibility with useAuth
    login: signIn,
    logout: signOut,
    signup: signUp,
  };
}
