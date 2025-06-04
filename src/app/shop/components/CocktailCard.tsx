"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { CocktailWithPrice } from "@/types";

interface CocktailCardProps {
  cocktail: CocktailWithPrice;
}

export default function CocktailCard({ cocktail }: CocktailCardProps) {
  return (
    <Link href={`/shop/${cocktail.id}`} className="group relative">
      <motion.div
        whileHover={{ scale: 1.03 }}
        transition={{ type: "spring", stiffness: 200, damping: 20 }}
        className="flex flex-col items-center bg-cosmic-bg/50 border border-cosmic-gold/20 hover:border-cosmic-gold/50 rounded-2xl overflow-hidden shadow-md hover:shadow-cosmic-gold/30 transition-all duration-300 cursor-pointer p-6"
      >
        {/* Imagen del cóctel */}
        <div className="relative w-full h-64 rounded-xl overflow-hidden mb-6">
          <Image
            src={cocktail.image_url || "/images/placeholder.webp"}
            alt={cocktail.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </div>

        {/* Información */}
        <div className="text-center">
          <h3 className="text-2xl font-[--font-unica] text-cosmic-gold mb-2">
            {cocktail.name}
          </h3>
          <p className="text-cosmic-silver text-sm mb-2 line-clamp-2">
            {cocktail.description}
          </p>
          {cocktail.min_price !== null && (
            <span className="text-cosmic-silver text-xs italic">
              from €{cocktail.min_price}
            </span>
          )}
        </div>
      </motion.div>
    </Link>
  );
}
