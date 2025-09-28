"use client";

import { motion } from "framer-motion";
import { FaGlassMartiniAlt, FaShippingFast, FaCocktail } from "react-icons/fa";
import { useEffect, useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";

export default function HowItWorks() {
  const { t } = useLanguage();

  const steps = [
    {
      icon: FaGlassMartiniAlt,
      title: t("home.step1_title"),
      description: t("home.step1_description"),
    },
    {
      icon: FaShippingFast,
      title: t("home.step2_title"),
      description: t("home.step2_description"),
    },
    {
      icon: FaCocktail,
      title: t("home.step3_title"),
      description: t("home.step3_description"),
    },
  ];

  const [activePulse, setActivePulse] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActivePulse(prev => (prev + 1) % steps.length);
    }, 1200); // Cambia cada 1.2 segundos
    return () => clearInterval(interval);
  }, [steps.length]);

  return (
    <section id="how-it-works" className="py-20 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Título */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-4xl md:text-5xl font-[--font-unica] text-[#D8DAE3] text-center mb-12"
        >
          {t("home.how_it_works")}
        </motion.h2>

        {/* Timeline */}
        <div className="relative flex flex-col md:flex-row md:justify-between md:items-start gap-16 md:gap-10">
          {/* Línea decorativa */}
          <div className="absolute hidden md:block top-1/2 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-cosmic-gold/30 to-transparent" />
          <div className="absolute md:hidden top-0 left-1/2 w-[2px] h-full bg-cosmic-gold/20 transform -translate-x-1/2" />

          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                viewport={{ once: true }}
                className="flex flex-col items-center text-center md:w-1/3 relative"
              >
                {/* Círculo del icono */}
                <motion.div
                  animate={{
                    scale: activePulse === index ? [1, 1.2, 1] : 1,
                    opacity: activePulse === index ? [1, 0.8, 1] : 1,
                  }}
                  transition={{
                    duration: 1,
                    ease: "easeInOut",
                  }}
                  className="w-14 h-14 flex items-center justify-center bg-cosmic-bg border border-cosmic-gold rounded-full z-10"
                >
                  <div className="w-14 h-14 flex items-center justify-center bg-cosmic-bg border border-cosmic-gold rounded-full z-10 group-hover:shadow-[0_0_15px_rgba(209,184,127,0.5)] transition duration-300">
                    <Icon className="text-cosmic-gold" size={36} />
                  </div>
                </motion.div>

                {/* Texto */}
                <div className="mt-6">
                  <h3 className="text-xl font-[--font-unica] text-cosmic-gold mb-2">
                    {step.title}
                  </h3>
                  <p className="text-cosmic-silver text-sm max-w-xs mx-auto">
                    {step.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
