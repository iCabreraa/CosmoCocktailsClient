"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";

export default function ContactBlock() {
  const { t, isInitialized } = useLanguage();

  if (!isInitialized) {
    return (
      <section className="py-20 md:py-28 px-6 text-center" id="feedback">
        <div className="max-w-4xl mx-auto flex flex-col gap-8 items-center">
          <div className="h-12 bg-slate-700/30 rounded animate-pulse"></div>
          <div className="h-6 bg-slate-700/20 rounded animate-pulse"></div>
          <div className="h-12 bg-slate-700/20 rounded animate-pulse"></div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 md:py-28 px-6 text-center" id="feedback">
      <div className="max-w-4xl mx-auto flex flex-col gap-8 items-center">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-3xl md:text-4xl font-[--font-unica] text-[#D8DAE3]"
        >
          {t("about.feedback_title")}
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          viewport={{ once: true }}
          className="text-cosmic-silver text-base md:text-lg font-[--font-josefin] max-w-2xl mx-auto"
        >
          {t("about.feedback_message")}
        </motion.p>
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          viewport={{ once: true }}
          className="flex flex-col items-center gap-4"
        >
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            <Link
              href="/contact"
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-cosmic-gold to-sky-300 text-slate-900 font-semibold rounded-xl hover:from-cosmic-gold/90 hover:to-sky-300/90 transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-cosmic-gold/25"
            >
              {t("about.contact_us")}
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
