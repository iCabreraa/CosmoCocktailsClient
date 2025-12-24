"use client";

import { motion } from "framer-motion";
import React from "react";
import Image from "next/image";
import Link from "next/link";
import { CocktailWithPrice } from "@/types";
import { useCart } from "@/store/cart";
import { Plus } from "lucide-react";
import { useToast } from "@/components/feedback/ToastProvider";
import { useLanguage } from "@/contexts/LanguageContext";

interface CocktailCardProps {
  cocktail: CocktailWithPrice;
}

export default function CocktailCard({ cocktail }: CocktailCardProps) {
  const { t } = useLanguage();
  const { notify } = useToast();
  const addToCart = useCart(state => state.addToCart);
  const imageSrc = cocktail.image_url || "/images/placeholder.webp";
  const halfInset = "calc(50% - 0.5px)";
  const imageSizes =
    "(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 25vw";
  const formatSizeLabel = (
    size: NonNullable<CocktailWithPrice["sizes"]>[number]
  ) => {
    if (size.size_name) {
      return size.size_name;
    }

    if (typeof size.volume_ml === "number") {
      return size.volume_ml <= 60 ? "Shot" : "Small Bottle";
    }

    return "Size";
  };

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
    notify({
      type: "success",
      title: t("feedback.cart_added_title"),
      message: t("feedback.cart_added_message", { name: cocktail.name }),
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
          <div className="absolute inset-0 bg-gradient-to-br from-slate-950/90 via-slate-900/70 to-slate-950/90" />
          <div
            className="absolute inset-0 origin-right transition-transform duration-700 ease-out group-hover:-translate-x-full"
            style={{ clipPath: `inset(0 ${halfInset} 0 0)` }}
          >
            <Image
              src={imageSrc}
              alt={cocktail.name}
              fill
              className="object-cover"
              sizes={imageSizes}
              quality={75}
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
              sizes={imageSizes}
              quality={75}
            />
          </div>
          {cocktail.sizes && cocktail.sizes.length > 0 && (
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
              <div className="pointer-events-auto w-[82%] max-w-[280px] rounded-2xl border border-cosmic-gold/30 bg-black/55 backdrop-blur-xl px-4 py-3 shadow-[0_0_24px_rgba(219,184,99,0.18)]">
                <div className="flex flex-col gap-2">
                  {cocktail.sizes.map(size => (
                    <button
                      key={size.id}
                      type="button"
                      onClick={event => handleAddToCart(event, size)}
                      className="group/button flex items-center justify-between gap-3 rounded-xl border border-cosmic-gold/30 bg-white/5 px-4 py-2 text-left text-[11px] uppercase tracking-[0.12em] text-cosmic-silver transition hover:border-cosmic-gold hover:bg-cosmic-gold/10 hover:text-white"
                    >
                      <span className="flex flex-col">
                        <span className="text-[10px] text-cosmic-gold/80 group-hover/button:text-white">
                          {formatSizeLabel(size)}
                        </span>
                        <span className="text-[9px] uppercase tracking-[0.2em] text-cosmic-silver/70 group-hover/button:text-white/80">
                          {size.volume_ml ? `${size.volume_ml}ml` : "Limited"}
                        </span>
                      </span>
                      <span className="flex items-center gap-1 text-cosmic-gold group-hover/button:text-white">
                        €{size.price.toFixed(2)}
                        <Plus className="h-3 w-3" />
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Información */}
            <div className="text-center">
              <h3 className="text-2xl font-[--font-unica] text-cosmic-gold mb-2">
                {cocktail.name}
              </h3>
              <p className="text-cosmic-silver text-sm mb-2 line-clamp-2">
                {cocktail.description}
              </p>
            </div>

      </motion.div>
    </Link>
  );
}
