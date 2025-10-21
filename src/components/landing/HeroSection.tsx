"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

export default function HeroSection() {
  const { t, isInitialized, language } = useLanguage();

  if (!isInitialized) {
    return (
      <section className="pt-20 md:pt-16 min-h-[85vh] flex items-center justify-center relative px-6">
        <div className="max-w-6xl w-full flex flex-col items-center text-center gap-6 relative">
          <div className="h-16 md:h-20 w-full animate-pulse bg-cosmic-silver/10 rounded-xl" />
          <div className="h-6 w-96 animate-pulse bg-cosmic-silver/10 rounded-xl" />
        </div>
      </section>
    );
  }

  // Get words array directly from translations
  const getHeroWords = () => {
    const translations = {
      es: [
        "Cócteles",
        "de",
        "calidad",
        "_LINE_BREAK_",
        "Entregados",
        "en",
        "tu",
        "órbita.",
      ],
      en: [
        "Quality",
        "cocktails.",
        "_LINE_BREAK_",
        "Delivered",
        "to",
        "your",
        "orbit.",
      ],
      nl: [
        "Kwaliteit",
        "cocktails.",
        "_LINE_BREAK_",
        "Bezorgd",
        "op",
        "jouw",
        "baan.",
      ],
    };
    return translations[language] || translations.es;
  };

  const words = getHeroWords();

  return (
    <section className="pt-20 md:pt-16 min-h-[85vh] flex items-center justify-center relative px-6">
      <div className="max-w-6xl w-full flex flex-col items-center text-center gap-6 relative">
        {/* Animated Title with floating effect */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="text-5xl md:text-7xl lg:text-8xl font-[--font-unica] leading-tight text-[#D8DAE3] animate-float-slow flex flex-wrap justify-center gap-x-2"
        >
          {words.map((word, index) => {
            if (word === "_LINE_BREAK_") {
              return <div key={index} className="w-full" />;
            }
            return (
              <motion.span
                key={index}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0 },
                }}
                transition={{ duration: 0.6 }}
                className={
                  word.includes("calidad") ||
                  word.includes("Entregados") ||
                  word.includes("cocktails.") ||
                  word.includes("Delivered") ||
                  word.includes("Bezorgd")
                    ? "text-cosmic-gold"
                    : ""
                }
              >
                {word}
              </motion.span>
            );
          })}
        </motion.h1>

        {/* Subtitulo */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="mt-2 text-base md:text-lg text-[#A1A1B0] font-[--font-josefin] max-w-2xl"
        >
          {t("home.hero_subtitle")}
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
        <button
          onClick={() => {
            const nextSection = document.getElementById("how-it-works");
            if (nextSection) {
              // Smooth scroll with custom easing
              const startPosition = window.pageYOffset;
              const targetPosition = nextSection.offsetTop;
              const distance = targetPosition - startPosition;
              const duration = 1200; // 1.2 seconds for smooth animation
              let startTime: number | null = null;

              // Easing function: easeInOutCubic (slow start, fast middle, slow end)
              const easeInOutCubic = (t: number): number => {
                return t < 0.5
                  ? 4 * t * t * t
                  : 1 - Math.pow(-2 * t + 2, 3) / 2;
              };

              const animateScroll = (currentTime: number) => {
                if (startTime === null) startTime = currentTime;
                const timeElapsed = currentTime - startTime;
                const progress = Math.min(timeElapsed / duration, 1);

                const easedProgress = easeInOutCubic(progress);
                const currentPosition =
                  startPosition + distance * easedProgress;

                window.scrollTo(0, currentPosition);

                if (progress < 1) {
                  requestAnimationFrame(animateScroll);
                }
              };

              requestAnimationFrame(animateScroll);
            }
          }}
          className="hover:text-white transition-colors duration-300 cursor-pointer"
          aria-label="Scroll to next section"
        >
          <ChevronDown size={28} />
        </button>
      </motion.div>
    </section>
  );
}
