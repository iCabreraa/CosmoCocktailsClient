"use client";

import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";

export default function EventsIntro() {
  const { t } = useLanguage();
  return (
    <section className="py-20 md:py-28 px-6 text-center" id="events-intro">
      <div className="max-w-4xl mx-auto flex flex-col gap-6 items-center">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-4xl md:text-5xl font-[--font-unica] text-[#D8DAE3]"
        >
          {t("events.title")}
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          viewport={{ once: true }}
          className="text-cosmic-silver text-base md:text-lg font-[--font-josefin] max-w-2xl"
        >
          {t("events.subtitle")}
        </motion.p>
      </div>
    </section>
  );
}
