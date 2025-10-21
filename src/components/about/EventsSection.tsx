"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";

export default function EventsSection() {
  const { t, isInitialized } = useLanguage();

  if (!isInitialized) {
    return (
      <section className="py-16 md:py-24 px-6" id="events">
        <div className="max-w-5xl mx-auto flex flex-col gap-8 text-center">
          <div className="h-12 bg-slate-700/30 rounded animate-pulse"></div>
          <div className="h-16 bg-slate-700/20 rounded animate-pulse"></div>
          <div className="h-6 bg-slate-700/20 rounded animate-pulse"></div>
          <div className="h-12 bg-slate-700/20 rounded-full animate-pulse"></div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 md:py-24 px-6" id="events">
      <div className="max-w-5xl mx-auto flex flex-col gap-8 text-center">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-3xl md:text-4xl font-[--font-unica] text-[#D8DAE3]"
        >
          {t("about.events_title")}
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          viewport={{ once: true }}
          className="text-cosmic-silver text-base md:text-lg font-[--font-josefin] leading-relaxed"
        >
          {t("about.events_description")}
        </motion.p>
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          viewport={{ once: true }}
          className="text-cosmic-silver text-base md:text-lg font-[--font-josefin] leading-relaxed"
        >
          {t("about.events_contact")}
        </motion.p>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          viewport={{ once: true }}
        >
          <Link
            href="/contact"
            className="inline-block px-8 py-4 rounded-full border border-cosmic-gold text-cosmic-gold hover:bg-cosmic-gold hover:text-black font-[--font-josefin] tracking-wide text-base md:text-lg shadow-md hover:shadow-lg hover:shadow-cosmic-gold/30 hover:scale-105 transition-all duration-300 ease-in-out"
          >
            {t("about.events_button")}
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
