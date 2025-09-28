"use client";

import { useState, useEffect } from "react";

export function useTheme() {
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  const [language, setLanguage] = useState<"es" | "en" | "nl">("es");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Cargar tema e idioma desde localStorage o preferencias del usuario
    const loadPreferences = async () => {
      try {
        // Primero intentar cargar desde localStorage
        const savedTheme = localStorage.getItem("theme") as "light" | "dark";
        const savedLanguage = localStorage.getItem("language") as
          | "es"
          | "en"
          | "nl";

        if (savedTheme && savedLanguage) {
          setTheme(savedTheme);
          setLanguage(savedLanguage);
          applyTheme(savedTheme);
          applyLanguage(savedLanguage);
          setLoading(false);
          return;
        }

        // Si no hay preferencias guardadas, cargar desde la API
        const response = await fetch("/api/preferences");
        if (response.ok) {
          const data = await response.json();
          const userTheme = data.preferences?.theme || "dark";
          const userLanguage = data.preferences?.language || "es";
          setTheme(userTheme);
          setLanguage(userLanguage);
          applyTheme(userTheme);
          applyLanguage(userLanguage);
          localStorage.setItem("theme", userTheme);
          localStorage.setItem("language", userLanguage);
        } else {
          // Fallback al tema del sistema
          const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
            .matches
            ? "dark"
            : "light";
          setTheme(systemTheme);
          setLanguage("es");
          applyTheme(systemTheme);
          applyLanguage("es");
        }
      } catch (error) {
        console.error("Error loading preferences:", error);
        // Fallback al tema del sistema
        const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
          .matches
          ? "dark"
          : "light";
        setTheme(systemTheme);
        setLanguage("es");
        applyTheme(systemTheme);
        applyLanguage("es");
      } finally {
        setLoading(false);
      }
    };

    loadPreferences();
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

  const applyLanguage = (newLanguage: "es" | "en" | "nl") => {
    const root = document.documentElement;
    root.setAttribute("lang", newLanguage);
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

  const changeLanguage = async (newLanguage: "es" | "en" | "nl") => {
    setLanguage(newLanguage);
    applyLanguage(newLanguage);
    localStorage.setItem("language", newLanguage);

    // Guardar en la base de datos
    try {
      await fetch("/api/preferences", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ language: newLanguage }),
      });
    } catch (error) {
      console.error("Error saving language:", error);
    }
  };

  return {
    theme,
    language,
    loading,
    changeTheme,
    changeLanguage,
  };
}
