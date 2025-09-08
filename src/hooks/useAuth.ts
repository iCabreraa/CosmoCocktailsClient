"use client";

import { createClient } from "@/lib/supabase/client";
import { User } from "@supabase/supabase-js";
import { useEffect, useState } from "react";
import { securityAuditor } from "@/lib/security/audit";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    // Obtener sesión inicial
    const getInitialSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      setLoading(false);
    };

    getInitialSession();

    // Escuchar cambios de autenticación
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [supabase.auth]);

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
      } else if (data.user) {
        // Log successful login
        await securityAuditor.logLogin(data.user.id, true);
      }

      return { data, error };
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

  const signUp = async (email: string, password: string, metadata?: any) => {
    try {
      setError(null);
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata,
        },
      });

      if (error) {
        setError(error.message);
      } else if (data.user) {
        // Log successful signup
        await securityAuditor.logEvent({
          user_id: data.user.id,
          event_type: "login", // Treat signup as a login event
          description: "New user registration",
          metadata: { signup: true, ...metadata },
        });
      }

      return { data, error };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      setError(errorMessage);
      return { data: null, error: { message: errorMessage } };
    }
  };

  const signOut = async () => {
    try {
      if (user) {
        // Log logout before signing out
        await securityAuditor.logLogout(user.id);
      }

      const { error } = await supabase.auth.signOut();

      if (error) {
        setError(error.message);
      } else {
        setError(null);
      }

      return { error };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      setError(errorMessage);
      return { error: { message: errorMessage } };
    }
  };

  const updateProfile = async (updates: any) => {
    const { data, error } = await supabase.auth.updateUser({
      data: updates,
    });
    return { data, error };
  };

  return {
    user,
    loading,
    error,
    login: signIn,
    signup: signUp,
    logout: signOut,
    updateProfile,
    isAuthenticated: !!user,
  };
}
