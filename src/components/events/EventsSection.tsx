"use client";

import { motion } from "framer-motion";
import EventCard, { Event } from "./EventCard";

const events: Event[] = [
  {
    title: "CosmoCocktails Launch Party",
    date: "March 2024",
    image: "/images/cocktailsImages/pina_colada.webp",
    description:
      "Our official debut in Rotterdam with signature drinks and live DJ.",
  },
  {
    title: "Stellar Mixology Workshop",
    date: "July 2024",
    image: "/images/cocktailsImages/mojito.webp",
    description:
      "Hands-on masterclass exploring the secrets behind our most popular blends.",
  },
  {
    title: "Galactic New Year's Bash",
    date: "December 2024",
    image: "/images/hero-bg.webp",
    description:
      "Ring in the new year among the stars with cosmic cocktails and surprises.",
  },
];

export default function EventsSection() {
  return (
    <section className="py-16 px-6" id="events-list">
      <div className="max-w-6xl mx-auto grid gap-8 md:grid-cols-3">
        {events.map((event, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: idx * 0.1 }}
            viewport={{ once: true }}
          >
            <EventCard event={event} />
          </motion.div>
        ))}
      </div>
    </section>
  );
}
