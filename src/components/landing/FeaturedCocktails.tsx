"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";

const cardVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.2,
      duration: 0.8,
      ease: "easeOut",
    },
  }),
};

export default function FeaturedCocktails() {
  const cocktails = [
    {
      name: "Pornstar Martini",
      description: "Exotic, fruity, and boldly indulgent.",
      price: "from €13",
      image: "/images/cocktailsImages/pornstar_martini.webp",
      slug: "pornstar-martini",
    },
    {
      name: "Galactic Negroni",
      description: "Bitter, aromatic, with a cosmic twist.",
      price: "from €14",
      image: "/images/cocktailsImages/negroni.webp",
      slug: "galactic-negroni",
    },
    {
      name: "Piña Colada",
      description: "Tropical, creamy, and blissfully smooth.",
      price: "from €12",
      image: "/images/cocktailsImages/pina_colada.webp",
      slug: "pina-colada",
    },
  ];

  return (
    <section id="featured" className="py-20 px-6">
      <div className="max-w-7xl mx-auto text-center">
        {/* Title */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-4xl md:text-5xl font-[--font-unica] text-[#D8DAE3] mb-10"
        >
          Our BestSellers Cocktails
        </motion.h2>

        {/* Cocktails grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {cocktails.map((cocktail, index) => (
            <Link
              key={index}
              href={`/cocktails/${cocktail.slug}`}
              className="group relative block"
            >
              <motion.div
                custom={index}
                variants={cardVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                whileHover={{ scale: 1.03 }}
                className="flex flex-col items-center backdrop-blur-md bg-white/5 bg-opacity-10 p-6 rounded-2xl border border-cosmic-gold/10 hover:border-cosmic-gold/30 transition-all duration-300 overflow-hidden shadow-md hover:shadow-cosmic-gold/20 relative"
              >
                {/* Ripple effect */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition duration-1000 ease-in-out pointer-events-none">
                  <div className="w-full h-full bg-gradient-to-tr from-cosmic-gold/10 to-cosmic-gold/5 blur-3xl" />
                </div>

                {/* Cocktail Image */}
                <div className="relative w-full h-64 rounded-xl overflow-hidden transform group-hover:scale-105 transition duration-500">
                  <Image
                    src={cocktail.image}
                    alt={cocktail.name}
                    fill
                    className="object-cover"
                  />
                </div>

                {/* Text content */}
                <div className="mt-6 z-10 text-center">
                  <h3 className="text-2xl font-[--font-unica] text-cosmic-gold mb-2">
                    {cocktail.name}
                  </h3>
                  <p className="text-cosmic-silver text-sm mb-4 max-w-xs mx-auto">
                    {cocktail.description}
                  </p>
                  <span className="text-cosmic-silver text-xs italic">
                    {cocktail.price}
                  </span>
                </div>
              </motion.div>
            </Link>
          ))}
        </div>

        {/* CTA Final */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4, duration: 0.8 }}
          className="mt-20"
        >
          <Link
            href="/shop"
            className="inline-block px-10 py-5 rounded-full border border-cosmic-gold text-cosmic-gold hover:bg-cosmic-gold hover:text-black transition-all font-[--font-josefin] tracking-wide text-lg md:text-xl shadow-md hover:shadow-lg hover:shadow-cosmic-gold/30 hover:scale-110 duration-300 ease-in-out"
          >
            View all cocktails
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
