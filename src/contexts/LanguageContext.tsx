"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { translations, type Language } from "@/i18n/translations";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
  isInitialized: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined
);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>("es");
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Cargar idioma guardado
    try {
      const savedLanguage = localStorage.getItem("cosmic-language") as
        | Language
        | null;
      const legacyLanguage = localStorage.getItem("language") as
        | Language
        | null;
      const initialLanguage = savedLanguage || legacyLanguage;

      if (initialLanguage && ["es", "en", "nl"].includes(initialLanguage)) {
        setLanguageState(initialLanguage);
        if (!savedLanguage && legacyLanguage) {
          localStorage.setItem("cosmic-language", initialLanguage);
          localStorage.removeItem("language");
        }
      }
    } catch (error) {
      console.warn("Error loading language from localStorage:", error);
    } finally {
      setIsInitialized(true);
    }
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute("lang", language);
  }, [language]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("cosmic-language", lang);
    localStorage.removeItem("language");
  };

  const t = (key: string, params?: Record<string, string | number>): string => {
    try {
      const keys = key.split(".");
      let value: any = translations[language];

      // Navegar por las claves anidadas
      for (const k of keys) {
        if (value && typeof value === "object" && k in value) {
          value = value[k];
        } else {
          console.warn(
            `Translation key not found: ${key} for language: ${language}`
          );
          return key; // Devolver la clave si no se encuentra
        }
      }

      // Si encontramos una cadena, procesar parámetros
      if (typeof value === "string") {
        if (params) {
          return value.replace(/\{(\w+)\}/g, (match, paramKey) => {
            return params[paramKey]?.toString() || match;
          });
        }
        return value;
      }

      console.warn(`Translation value is not a string for key: ${key}`);
      return key;
    } catch (error) {
      console.error(`Error translating key ${key}:`, error);
      return key;
    }
  };

  return (
    <LanguageContext.Provider
      value={{ language, setLanguage, t, isInitialized }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    console.error("useLanguage must be used within a LanguageProvider");
    // Fallback para evitar crashes
    return {
      language: "es" as const,
      setLanguage: () => {},
      t: (key: string, params?: Record<string, string | number>) => key,
      isInitialized: false,
    };
  }
  return context;
}
