/**
 * LanguageSelector Component
 *
 * Dropdown component for language selection
 *
 * @fileoverview Language selector with flag icons and smooth transitions
 * @version 1.0.0
 * @author CosmoCocktails Development Team
 */

"use client";

import React, { useState, useRef, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { ChevronDown, Globe } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// ============================================================================
// TYPES
// ============================================================================

type Language = "es" | "en" | "nl";

interface LanguageOption {
  code: Language;
  name: string;
  shortName: string;
  gradient: string;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const languages: LanguageOption[] = [
  {
    code: "es",
    name: "Español",
    shortName: "ES",
    gradient: "from-red-500 to-yellow-500",
  },
  {
    code: "en",
    name: "English",
    shortName: "EN",
    gradient: "from-blue-600 to-red-500",
  },
  {
    code: "nl",
    name: "Nederlands",
    shortName: "NL",
    gradient: "from-red-500 to-blue-500",
  },
];

// ============================================================================
// COMPONENT
// ============================================================================

export default function LanguageSelector() {
  const { language, setLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState<"top" | "bottom">(
    "bottom"
  );
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentLanguage =
    languages.find(lang => lang.code === language) || languages[0];

  // Close dropdown when clicking outside and detect position
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    const handlePosition = () => {
      if (dropdownRef.current) {
        const rect = dropdownRef.current.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        const spaceBelow = viewportHeight - rect.bottom;
        const spaceAbove = rect.top;

        // If there's not enough space below (less than 200px), open upward
        if (spaceBelow < 200 && spaceAbove > 200) {
          setDropdownPosition("top");
        } else {
          setDropdownPosition("bottom");
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("resize", handlePosition);
    handlePosition(); // Check position on mount

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("resize", handlePosition);
    };
  }, []);

  const handleLanguageChange = (newLanguage: Language) => {
    setLanguage(newLanguage);
    setIsOpen(false);
  };

  const handleToggle = () => {
    if (!isOpen && dropdownRef.current) {
      const rect = dropdownRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const spaceBelow = viewportHeight - rect.bottom;
      const spaceAbove = rect.top;

      // If there's not enough space below (less than 200px), open upward
      if (spaceBelow < 200 && spaceAbove > 200) {
        setDropdownPosition("top");
      } else {
        setDropdownPosition("bottom");
      }
    }
    setIsOpen(!isOpen);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button - Simplified */}
      <button
        onClick={handleToggle}
        className="flex items-center gap-2 text-slate-300 hover:text-sky-300 hover:bg-white/5 px-3 py-2 rounded-lg transition-colors duration-200"
        aria-label="Select language"
      >
        <Globe className="w-4 h-4" />
        <span className="text-sm font-medium uppercase">
          {currentLanguage.shortName}
        </span>
        <ChevronDown
          className={`w-3 h-3 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className={`absolute left-0 md:right-0 w-40 md:w-48 bg-white/5 backdrop-blur-md border border-slate-700/40 rounded-lg shadow-xl overflow-hidden z-[70] ${
              dropdownPosition === "top" ? "bottom-full mb-2" : "top-full mt-2"
            }`}
          >
            {languages.map(lang => (
              <button
                key={lang.code}
                onClick={() => handleLanguageChange(lang.code)}
                className={`w-full flex items-center gap-2 md:gap-3 px-3 md:px-4 py-2 md:py-3 text-left hover:bg-white/5 transition-colors duration-150 ${
                  language === lang.code
                    ? "bg-white/10 text-sky-300 border-r-2 border-sky-500"
                    : "text-slate-300 hover:text-slate-100"
                }`}
              >
                <span className="text-xs md:text-sm font-medium uppercase">
                  {lang.shortName}
                </span>
                <span className="text-xs md:text-sm font-medium">
                  {lang.name}
                </span>
                {language === lang.code && (
                  <div className="ml-auto w-2 h-2 bg-sky-300 rounded-full animate-pulse" />
                )}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
