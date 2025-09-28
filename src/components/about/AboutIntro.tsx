"use client";

import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";

export default function AboutIntro() {
  const { t } = useLanguage();
  return (
    <section className="py-20 md:py-28 px-6" id="intro">
      <div className="max-w-4xl mx-auto text-center flex flex-col gap-6">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-4xl md:text-5xl font-[--font-unica] text-[#D8DAE3]"
        >
          {t("about.title")}
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          viewport={{ once: true }}
          className="text-cosmic-silver text-base md:text-lg font-[--font-josefin] leading-relaxed"
        >
          {t("about.description")}
        </motion.p>
      </div>
    </section>
  );
}
