"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

export function useTheme() {
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  const [loading, setLoading] = useState(true);

  const enforceDarkTheme = () => {
    setTheme("dark");
    applyTheme();
    localStorage.setItem("theme", "dark");
  };

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), 2500);

    // Cargar tema desde localStorage o preferencias del usuario
    const loadPreferences = async () => {
      try {
        // Primero intentar cargar desde localStorage
        const savedTheme = localStorage.getItem("theme") as
          | "light"
          | "dark"
          | null;

        if (savedTheme) {
          enforceDarkTheme();
          setLoading(false);
          return;
        }

        const supabase = createClient();
        const { data: sessionData, error: sessionError } =
          await supabase.auth.getSession();
        if (!isMounted) return;
        if (sessionError || !sessionData.session?.user) {
          // Sin sesión, usar tema del sistema y evitar /api/preferences
          enforceDarkTheme();
          setLoading(false);
          return;
        }

        // Si no hay preferencias guardadas, cargar desde la API
        const response = await fetch("/api/preferences", {
          signal: controller.signal,
        });
        if (!isMounted) return;
        if (response.ok) {
          const data = await response.json();
          enforceDarkTheme();
        } else {
          enforceDarkTheme();
        }
      } catch (error) {
        if (!isMounted) return;
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }
        console.error("Error loading preferences:", error);
        enforceDarkTheme();
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadPreferences();

    return () => {
      isMounted = false;
      controller.abort();
      window.clearTimeout(timeoutId);
    };
  }, []);

  const applyTheme = () => {
    const root = document.documentElement;

    root.classList.add("dark");
    root.classList.remove("light");
  };

  const changeTheme = async (newTheme: "light" | "dark") => {
    if (newTheme !== "dark") {
      enforceDarkTheme();
      return;
    }

    enforceDarkTheme();

    // Guardar en la base de datos
    try {
      const supabase = createClient();
      const { data: sessionData, error: sessionError } =
        await supabase.auth.getSession();
      if (sessionError || !sessionData.session?.user) {
        return;
      }
      await fetch("/api/preferences", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ theme: newTheme }),
      });
    } catch (error) {
      console.error("Error saving theme:", error);
    }
  };

  return {
    theme,
    loading,
    changeTheme,
  };
}
