"use client";

import { motion } from "framer-motion";

export default function HistoryValues() {
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
          Our Story & Values
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          viewport={{ once: true }}
          className="text-cosmic-silver text-base md:text-lg font-[--font-josefin] leading-relaxed"
        >
          Founded in 2025, CosmoCocktails started with a simple idea: to bring
          the sophistication of a cocktail bar to your living room. Our team of
          seasoned mixologists carefully selects every ingredient and believes
          in service, innovation and sustainability. We aim to elevate your
          moments with exceptional drinks while caring for our planet.
        </motion.p>
      </div>
    </section>
  );
}
