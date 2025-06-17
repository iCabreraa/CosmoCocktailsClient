"use client";

import { motion } from "framer-motion";

export default function EventsIntro() {
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
          Cosmic News & Events
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          viewport={{ once: true }}
          className="text-cosmic-silver text-base md:text-lg font-[--font-josefin] max-w-2xl"
        >
          Stay updated on our latest appearances and stellar celebrations. Here
          you can find the highlights of where we have been shaking up the
          galaxy.
        </motion.p>
      </div>
    </section>
  );
}
