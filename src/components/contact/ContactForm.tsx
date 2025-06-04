"use client";

import { useState } from "react";
import { motion } from "framer-motion";

export default function ContactForm() {
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      alert("Message sent!");
    }, 500);
  };

  return (
    <section className="py-16 md:py-24 px-6" id="contact-form">
      <div className="max-w-3xl mx-auto">
        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="flex flex-col gap-5"
        >
          <input
            type="text"
            name="name"
            required
            placeholder="Your name"
            className="bg-transparent border border-cosmic-fog rounded-md p-3 text-cosmic-text placeholder-cosmic-fog focus:outline-none"
          />
          <input
            type="email"
            name="email"
            required
            placeholder="Your email"
            className="bg-transparent border border-cosmic-fog rounded-md p-3 text-cosmic-text placeholder-cosmic-fog focus:outline-none"
          />
          <textarea
            name="message"
            rows={5}
            required
            placeholder="Your message"
            className="bg-transparent border border-cosmic-fog rounded-md p-3 text-cosmic-text placeholder-cosmic-fog focus:outline-none"
          />
          <button
            type="submit"
            disabled={submitting}
            className="inline-block px-8 py-4 rounded-full border border-cosmic-gold text-cosmic-gold hover:bg-cosmic-gold hover:text-black font-[--font-josefin] tracking-wide text-base md:text-lg shadow-md hover:shadow-lg hover:shadow-cosmic-gold/30 hover:scale-105 transition-all duration-300 ease-in-out disabled:opacity-50"
          >
            {/* TODO */}
            {submitting ? "Sending..." : "Send Message"}
          </button>
        </motion.form>
      </div>
    </section>
  );
}
