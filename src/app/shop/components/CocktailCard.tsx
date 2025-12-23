"use client";

import { motion } from "framer-motion";
import React from "react";
import Image from "next/image";
import Link from "next/link";
import { CocktailWithPrice } from "@/types";
import { useCart } from "@/store/cart";
import { Plus } from "lucide-react";

interface CocktailCardProps {
  cocktail: CocktailWithPrice;
}

export default function CocktailCard({ cocktail }: CocktailCardProps) {
  const addToCart = useCart(state => state.addToCart);
  const imageSrc = cocktail.image_url || "/images/placeholder.webp";
  const halfInset = "calc(50% - 0.5px)";

  const handleAddToCart = (
    event: React.MouseEvent<HTMLButtonElement>,
    size: NonNullable<CocktailWithPrice["sizes"]>[number]
  ) => {
    event.preventDefault();
    event.stopPropagation();

    addToCart({
      cocktail_id: cocktail.id,
      sizes_id: size.sizes_id,
      quantity: 1,
      unit_price: size.price,
      cocktail_name: cocktail.name,
      size_name: size.size_name ?? `${size.volume_ml ?? 0}ml`,
      volume_ml: size.volume_ml ?? 0,
      image_url: cocktail.image_url,
    });
  };

  return (
    <Link href={`/shop/${cocktail.id}`} className="group relative">
      <motion.div
        whileHover={{ scale: 1.03 }}
        transition={{ type: "spring", stiffness: 200, damping: 20 }}
        className="flex flex-col items-center bg-cosmic-bg/50 border border-cosmic-gold/20 hover:border-cosmic-gold/50 rounded-2xl overflow-hidden shadow-md hover:shadow-cosmic-gold/30 transition-all duration-300 cursor-pointer p-6"
      >
        {/* Imagen del cóctel con efecto cortina */}
        <div className="relative w-full h-64 rounded-xl overflow-hidden mb-6">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900/90 via-slate-900/60 to-slate-950/90" />
          <div
            className="absolute inset-0 origin-right transition-transform duration-700 ease-out group-hover:-translate-x-full"
            style={{ clipPath: `inset(0 ${halfInset} 0 0)` }}
          >
            <Image
              src={imageSrc}
              alt={cocktail.name}
              fill
              className="object-cover"
            />
          </div>
          <div
            className="absolute inset-0 origin-left transition-transform duration-700 ease-out group-hover:translate-x-full"
            style={{ clipPath: `inset(0 0 0 ${halfInset})` }}
            aria-hidden="true"
          >
            <Image
              src={imageSrc}
              alt=""
              fill
              className="object-cover"
            />
          </div>
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

            {cocktail.sizes && cocktail.sizes.length > 0 && (
              <div className="mt-4 grid grid-cols-2 gap-2 w-full">
                {cocktail.sizes.map(size => (
                  <button
                    key={size.id}
                    type="button"
                    onClick={event => handleAddToCart(event, size)}
                    className="flex items-center justify-between gap-2 rounded-full border border-cosmic-gold/30 px-3 py-1 text-[11px] uppercase tracking-[0.14em] text-cosmic-silver hover:border-cosmic-gold hover:text-white transition"
                  >
                    <span className="truncate">
                      {size.size_name ?? `${size.volume_ml ?? 0}ml`}
                    </span>
                    <span className="flex items-center gap-1">
                      €{size.price.toFixed(2)}
                      <Plus className="h-3 w-3" />
                    </span>
                  </button>
                ))}
              </div>
            )}
      </motion.div>
    </Link>
  );
}
