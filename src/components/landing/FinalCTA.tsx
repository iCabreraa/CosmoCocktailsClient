"use client";

import { motion } from "framer-motion";
import Link from "next/link";

export default function FinalCTA() {
  return (
    <section className="py-20 md:py-28 px-6 text-center bg-transparent">
      <div className="max-w-4xl mx-auto flex flex-col items-center gap-10">
        {/* Título Final */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-4xl md:text-5xl font-[--font-unica] text-[#D8DAE3] leading-snug"
        >
          Ready for a <i className="text-cosmic-gold">new journey</i>?
        </motion.h2>

        {/* Botones CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          viewport={{ once: true }}
          className="flex flex-col sm:flex-row gap-5 sm:gap-8 items-center justify-center mt-4"
        >
          <Link
            href="/shop"
            className="inline-block px-8 py-4 rounded-full border border-cosmic-gold text-cosmic-gold hover:bg-cosmic-gold hover:text-black font-[--font-josefin] tracking-wide text-base md:text-lg shadow-md hover:shadow-lg hover:shadow-cosmic-gold/30 hover:scale-105 transition-all duration-300 ease-in-out"
          >
            Start your Order
          </Link>

          <Link
            href="/contact"
            className="inline-block px-8 py-4 rounded-full border border-cosmic-gold/30 text-cosmic-silver hover:border-cosmic-gold hover:text-cosmic-gold font-[--font-josefin] tracking-wide text-base md:text-lg transition-all duration-300 ease-in-out"
          >
            Contact us
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
