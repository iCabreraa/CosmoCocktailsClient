"use client";

import { useState, useEffect } from "react";

export function useTheme() {
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), 2500);

    // Cargar tema desde localStorage o preferencias del usuario
    const loadPreferences = async () => {
      try {
        // Primero intentar cargar desde localStorage
        const savedTheme = localStorage.getItem("theme") as "light" | "dark";

        if (savedTheme) {
          setTheme(savedTheme);
          applyTheme(savedTheme);
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
          const userTheme = data.preferences?.theme || "dark";
          setTheme(userTheme);
          applyTheme(userTheme);
          localStorage.setItem("theme", userTheme);
        } else {
          // Fallback al tema del sistema
          const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
            .matches
            ? "dark"
            : "light";
          setTheme(systemTheme);
          applyTheme(systemTheme);
        }
      } catch (error) {
        if (!isMounted) return;
        console.error("Error loading preferences:", error);
        // Fallback al tema del sistema
        const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
          .matches
          ? "dark"
          : "light";
        setTheme(systemTheme);
        applyTheme(systemTheme);
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

  const applyTheme = (newTheme: "light" | "dark") => {
    const root = document.documentElement;

    if (newTheme === "dark") {
      root.classList.add("dark");
      root.classList.remove("light");
    } else {
      root.classList.add("light");
      root.classList.remove("dark");
    }
  };

  const changeTheme = async (newTheme: "light" | "dark") => {
    setTheme(newTheme);
    applyTheme(newTheme);
    localStorage.setItem("theme", newTheme);

    // Guardar en la base de datos
    try {
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
