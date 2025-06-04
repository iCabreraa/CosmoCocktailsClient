"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { FaInstagram, FaLinkedinIn } from "react-icons/fa";

export default function ContactInfo() {
  return (
    <section className="py-16 md:py-24 px-6" id="contact-info">
      <div className="max-w-4xl mx-auto flex flex-col gap-6 items-center text-center">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-3xl md:text-4xl font-[--font-unica] text-[#D8DAE3]"
        >
          Reach out directly
        </motion.h2>
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          viewport={{ once: true }}
          className="flex flex-col gap-2 text-cosmic-silver font-[--font-josefin]"
        >
          <p>
            Email:{" "}
            <a
              href="mailto:cosmococktails2024@gmail.com"
              className="text-cosmic-gold hover:underline"
            >
              cosmococktails2024@gmail.com
            </a>
          </p>
          <p>
            Phone:{" "}
            <a
              href="tel:+31 6 82156977"
              className="text-cosmic-gold hover:underline"
            >
              +31 6 82156977
            </a>
          </p>
          <div className="flex gap-4 justify-center mt-3 text-xl">
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
