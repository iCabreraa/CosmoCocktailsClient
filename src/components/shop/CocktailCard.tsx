"use client";

import { CocktailWithPrice } from "@/types";
import Link from "next/link";
import LazyImage from "@/components/images/LazyImage";
import { useMemo } from "react";
import AddToCartButton from "@/components/cart/AddToCartButton";
import FavoriteButton from "@/components/ui/FavoriteButton";
import { useLanguage } from "@/contexts/LanguageContext";

interface CocktailCardProps {
  cocktail: CocktailWithPrice;
  className?: string;
}

export default function CocktailCard({
  cocktail,
  className = "",
}: CocktailCardProps) {
  const { t } = useLanguage();
  const safeImageUrl = useMemo(() => {
    const url = cocktail.image_url || "/images/default-cocktail.webp";
    if (url.startsWith("http")) return url;
    return url.startsWith("/") ? url : `/${url}`;
  }, [cocktail.image_url]);
  return (
    <div
      className={`
      group relative bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-cosmic-gold/10
      hover:border-cosmic-gold/30 hover:scale-105 transition-all duration-300
      ${className}
    `}
    >
      <Link href={`/shop/${cocktail.id}`} className="block">
        {/* Imagen */}
        <div className="relative w-full h-48 rounded-lg overflow-hidden mb-4">
          <LazyImage
            src={safeImageUrl}
            alt={cocktail.name}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-300"
            type="cocktail"
            quality={85}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
            threshold={0.1}
            fallbackSrc="/images/default-cocktail.webp"
          />

          {/* Overlay de hover */}
          <div className="absolute inset-0 bg-cosmic-gold/0 group-hover:bg-cosmic-gold/10 transition-colors duration-300" />

          {/* Botón de favoritos */}
          <div className="absolute top-2 right-2">
            <FavoriteButton cocktailId={cocktail.id} />
          </div>
        </div>

        {/* Información */}
        <div className="space-y-2">
          <h3 className="text-cosmic-gold text-lg font-[--font-unica] group-hover:text-cosmic-silver transition-colors duration-200">
            {cocktail.name}
          </h3>

          <p className="text-cosmic-silver text-sm line-clamp-2">
            {cocktail.description}
          </p>

          {/* Precio */}
          <div className="flex items-center justify-between">
            <p className="text-cosmic-gold font-semibold">
              {cocktail.min_price
                ? `€${cocktail.min_price}`
                : t("shop.coming_soon")}
            </p>

            {/* Tags */}
            {cocktail.tags && cocktail.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {cocktail.tags.slice(0, 2).map((tag, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 text-xs bg-cosmic-gold/20 text-cosmic-gold rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Información adicional */}
          <div className="flex items-center justify-between text-xs text-cosmic-silver">
            <span>
              {cocktail.alcohol_percentage === 0
                ? t("cocktail.non_alcoholic")
                : `${cocktail.alcohol_percentage}% ${t("cocktail.alcohol")}`}
            </span>

            {cocktail.has_non_alcoholic_version && (
              <span className="text-cosmic-gold">
                {t("cocktail.non_alcoholic_version_available")}
              </span>
            )}
          </div>
        </div>
      </Link>

      {/* Botón de añadir al carrito */}
      {cocktail.min_price !== null && cocktail.min_size_id && (
        <div className="mt-4">
          <AddToCartButton
            cocktail={{
              id: cocktail.id,
              name: cocktail.name,
              description: cocktail.description,
              image_url: cocktail.image_url,
              alcohol_percentage: cocktail.alcohol_percentage,
              has_non_alcoholic_version: cocktail.has_non_alcoholic_version,
              tags: cocktail.tags || [],
              is_active: true,
              created_at: cocktail.created_at || new Date().toISOString(),
              updated_at: new Date().toISOString(),
            }}
            minPrice={cocktail.min_price}
            minSizeId={cocktail.min_size_id}
          />
        </div>
      )}
    </div>
  );
}
