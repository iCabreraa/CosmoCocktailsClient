"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { FaInstagram, FaLinkedinIn } from "react-icons/fa";

export default function ContactBlock() {
  return (
    <section className="py-20 md:py-28 px-6 text-center" id="contact">
      <div className="max-w-4xl mx-auto flex flex-col gap-8 items-center">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-3xl md:text-4xl font-[--font-unica] text-[#D8DAE3]"
        >
          Get in touch
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          viewport={{ once: true }}
          className="text-cosmic-silver text-base md:text-lg font-[--font-josefin]"
        >
          Have questions or want to book us for an event? Drop us a line!
        </motion.p>
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          viewport={{ once: true }}
          className="flex flex-col items-center gap-4"
        >
          <a
            href="mailto:cosmococktails2024@gmail.com"
            className="text-cosmic-gold font-[--font-josefin] hover:underline"
          >
            cosmococktails2024@gmail.com
          </a>
          <div className="flex gap-4 text-cosmic-silver">
            <Link
              href="https://www.instagram.com/cosmococktails_2024/"
              target="_blank"
              className="hover:text-cosmic-gold transition"
            >
              <FaInstagram />
            </Link>
            {/* <Link
              href="https://linkedin.com"
              target="_blank"
              className="hover:text-cosmic-gold transition"
            >
              <FaLinkedinIn />
            </Link> */}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
