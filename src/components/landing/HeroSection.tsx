"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

export default function HeroSection() {
  const { t } = useLanguage();

  const fullTitle = t("home.hero_title");
  const words = fullTitle.split(" ");

  return (
    <section className="pt-20 md:pt-16 min-h-[85vh] flex items-center justify-center relative px-6">
      <div className="max-w-6xl w-full flex flex-col items-center text-center gap-6 relative">
        {/* Animated Title with floating effect */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="text-5xl md:text-7xl lg:text-8xl font-[--font-unica] leading-tight text-[#D8DAE3] animate-float-slow"
        >
          {words.map((word, index) => (
            <motion.span
              key={index}
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0 },
              }}
              transition={{ duration: 0.6 }}
              className={`inline-block mr-2 ${
                // Highlight logic: for ES specifically, color the word "órbita"
                (typeof window !== "undefined" &&
                  (navigator.language?.startsWith("es") ||
                    document.documentElement.lang === "es") &&
                  word.toLowerCase().includes("órbita")) ||
                index === 2 ||
                index === 5
                  ? "text-cosmic-gold"
                  : ""
              }`}
            >
              {word}
            </motion.span>
          ))}
        </motion.h1>

        {/* Subtitulo */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="mt-2 text-base md:text-lg text-[#A1A1B0] font-[--font-josefin] max-w-2xl"
        >
          {t("home.hero_description")}
        </motion.p>

        {/* Botón + Glow pulsante */}
        {/* <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1, duration: 0.6 }}
          className="mt-8 relative flex items-center justify-center"
        > */}
        {/* Glow pulsante detrás del botón */}
        {/* <div className="absolute w-48 h-48 rounded-full bg-cosmic-gold/20 blur-2xl animate-pulse-slow z-[-1]" /> */}

        {/* Botón con efecto pulsante adicional */}
        {/* <Link
            href="/shop"
            className="inline-block px-8 py-4 rounded-full border border-cosmic-gold text-cosmic-gold hover:bg-cosmic-gold hover:text-black transition-all font-[--font-josefin] tracking-wide text-base md:text-lg shadow-md hover:shadow-lg hover:shadow-cosmic-gold/30 hover:scale-110 duration-300 ease-in-out animate-glow-soft"
          >
            Start your journey
          </Link>
        </motion.div> */}
      </div>

      {/* Icono flecha scroll */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.3, duration: 0.6 }}
        className="absolute bottom-6 md:bottom-10 text-cosmic-gold animate-bounce-slow"
      >
        <a href="#how-it-works" aria-label="Scroll to next section">
          <ChevronDown size={28} />
        </a>
      </motion.div>
    </section>
  );
}
