"use client";

import { motion } from "framer-motion";

export default function AboutIntro() {
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
          What is CosmoCocktails?
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          viewport={{ once: true }}
          className="text-cosmic-silver text-base md:text-lg font-[--font-josefin] leading-relaxed"
        >
          CosmoCocktails is born from our passion for mixology. We craft
          bar-quality cocktails with premium ingredients so you can enjoy them
          anywhere. Ready to serve, beautifully packaged and always delicious.
        </motion.p>
      </div>
    </section>
  );
}
