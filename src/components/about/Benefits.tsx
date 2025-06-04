"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";

const benefits = [
  "Premium cocktails delivered to your door",
  "Ready to drink — no mixology skills needed",
  "Curated recipes for every taste",
  "Perfect for parties or relaxing at home",
];

export default function Benefits() {
  return (
    <section className="py-16 md:py-24 px-6 bg-transparent" id="benefits">
      <div className="max-w-5xl mx-auto flex flex-col gap-8 text-center">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-3xl md:text-4xl font-[--font-unica] text-[#D8DAE3]"
        >
          How can we help you?
        </motion.h2>
        <motion.ul
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          viewport={{ once: true }}
          className="grid gap-4 text-left mx-auto w-fit text-cosmic-silver font-[--font-josefin] text-base md:text-lg"
        >
          {benefits.map((item) => (
            <li key={item} className="flex items-start gap-3">
              <Check className="text-cosmic-gold mt-1" size={20} />
              <span>{item}</span>
            </li>
          ))}
        </motion.ul>
      </div>
    </section>
  );
}
