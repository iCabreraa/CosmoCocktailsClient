"use client";

import { CocktailWithPrice } from "@/types";
import { Cocktail } from "@/types/shared";
import Link from "next/link";
import Image from "next/image";
import AddToCartButton from "@/components/cart/AddToCartButton";
import FavoriteButton from "@/components/ui/FavoriteButton";
import { useLanguage } from "@/contexts/LanguageContext";

type CocktailRowProps = {
  title: string;
  cocktails: CocktailWithPrice[];
};

export default function CocktailRow({ title, cocktails }: CocktailRowProps) {
  const { t } = useLanguage();

  if (cocktails.length < 2) return null;

  // Debug: Log para ver qué datos están llegando
  console.log(
    `CocktailRow ${title}:`,
    cocktails.map(c => ({
      id: c.id,
      name: c.name,
      min_price: c.min_price,
      min_size_id: c.min_size_id,
    }))
  );

  return (
    <section className="py-12">
      <div className="max-w-7xl mx-auto px-6">
        <h2 className="text-2xl md:text-3xl font-[--font-unica] text-cosmic-gold mb-6">
          {title}
        </h2>

        <div className="flex overflow-x-auto gap-6 pb-6 snap-x snap-mandatory scrollbar-hide px-4 py-2">
          {cocktails.map(cocktail => (
            <div
              key={cocktail.id}
              className="min-w-[220px] flex-shrink-0 snap-start rounded-lg bg-white/5 backdrop-blur-sm p-4 border border-cosmic-gold/10 hover:border-cosmic-gold/30 hover:scale-105 transition-all duration-300 hover:shadow-lg hover:shadow-cosmic-gold/20 transform-gpu"
            >
              <div className="relative">
                <Link href={`/shop/${cocktail.id}`}>
                  <div className="relative w-full h-48 rounded-lg overflow-hidden mb-4">
                    <Image
                      src={
                        cocktail.image_url ?? "/images/default-cocktail.webp"
                      }
                      alt={cocktail.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      quality={75}
                      loading="lazy"
                      placeholder="empty"
                      priority={false}
                    />
                  </div>
                  <h3 className="text-cosmic-gold text-lg font-[--font-unica] mb-1">
                    {cocktail.name}
                  </h3>
                  <p className="text-cosmic-silver text-sm italic">
                    {cocktail.min_price
                      ? t("shop.from_price").replace(
                          "{price}",
                          cocktail.min_price.toString()
                        )
                      : t("shop.coming_soon")}
                  </p>
                </Link>
                {/* Botón de favoritos */}
                <div className="absolute top-2 right-2">
                  <FavoriteButton cocktailId={cocktail.id} />
                </div>
              </div>
              {cocktail.min_price !== null && cocktail.min_size_id && (
                <AddToCartButton
                  cocktail={{
                    id: cocktail.id,
                    name: cocktail.name,
                    description: cocktail.description,
                    image_url: cocktail.image_url,
                    alcohol_percentage: cocktail.alcohol_percentage,
                    has_non_alcoholic_version:
                      cocktail.has_non_alcoholic_version,
                    tags: [],
                    is_active: true,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                  }}
                  minPrice={cocktail.min_price}
                  minSizeId={cocktail.min_size_id}
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
