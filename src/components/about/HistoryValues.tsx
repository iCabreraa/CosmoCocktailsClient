"use client";

import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";

export default function HistoryValues() {
  const { t } = useLanguage();
  return (
    <section className="py-16 md:py-24 px-6" id="history">
      <div className="max-w-5xl mx-auto flex flex-col gap-6 text-center">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-3xl md:text-4xl font-[--font-unica] text-[#D8DAE3]"
        >
          {t("about.mission_title")}
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          viewport={{ once: true }}
          className="text-cosmic-silver text-base md:text-lg font-[--font-josefin] leading-relaxed"
        >
          {t("about.mission_description")}
        </motion.p>
      </div>
    </section>
  );
}
