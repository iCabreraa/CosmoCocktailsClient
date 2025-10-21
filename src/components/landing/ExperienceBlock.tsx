"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";

export default function ExperienceBlock() {
  const { t, isInitialized } = useLanguage();

  if (!isInitialized) {
    return (
      <section
        id="experience"
        className="py-20 md:py-28 px-6 relative overflow-hidden"
      >
        <div className="max-w-6xl mx-auto text-center flex flex-col items-center gap-10">
          <div className="h-12 w-96 animate-pulse bg-cosmic-silver/10 rounded-xl" />
          <div className="h-6 w-full max-w-2xl animate-pulse bg-cosmic-silver/10 rounded-xl" />
          <div className="h-12 w-48 animate-pulse bg-cosmic-silver/10 rounded-xl" />
        </div>
      </section>
    );
  }

  return (
    <section
      id="experience"
      className="py-20 md:py-28 px-6 relative overflow-hidden"
    >
      <div className="max-w-6xl mx-auto text-center flex flex-col items-center gap-10">
        {/* Título */}
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-4xl md:text-5xl font-[--font-unica] text-[#D8DAE3]"
        >
          {t("home.experience_title")}
        </motion.h2>

        {/* Párrafo */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          viewport={{ once: true }}
          className="text-cosmic-silver text-base md:text-lg font-[--font-josefin] max-w-2xl leading-relaxed"
        >
          {t("home.experience_description")}
        </motion.p>

        {/* Botón Quiz */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          viewport={{ once: true }}
          className="mt-6"
        >
          <Link
            href="/quiz"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-full border border-cosmic-gold text-cosmic-gold hover:bg-cosmic-gold hover:text-black font-[--font-josefin] tracking-wide text-base md:text-lg shadow-md hover:shadow-lg hover:shadow-cosmic-gold/30 hover:scale-105 transition-all duration-300 ease-in-out"
          >
            <span>✨</span> {t("home.quiz_button")}
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
