"use client";

import { CocktailWithPrice } from "@/types";
import Link from "next/link";
import Image from "next/image";
import AddToCartButton from "@/components/cart/AddToCartButton";
import FavoriteButton from "@/components/ui/FavoriteButton";
import { useLanguage } from "@/contexts/LanguageContext";
import clsx from "clsx";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

type CocktailRowProps = {
  title: string;
  cocktails: CocktailWithPrice[];
  showTitle?: boolean;
};

export default function CocktailRow({
  title,
  cocktails,
  showTitle = true,
}: CocktailRowProps) {
  const { t } = useLanguage();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [pageCount, setPageCount] = useState(0);
  const [activePage, setActivePage] = useState(0);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const pageIndexes = useMemo(
    () => Array.from({ length: pageCount }, (_, index) => index),
    [pageCount]
  );

  if (cocktails.length < 2) return null;

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    const updateState = () => {
      const { scrollLeft, scrollWidth, clientWidth } = container;
      const pages = Math.max(1, Math.ceil(scrollWidth / clientWidth));
      const nextActive = Math.min(
        pages - 1,
        Math.round(scrollLeft / clientWidth)
      );

      setPageCount(pages);
      setActivePage(nextActive);
      setCanScrollLeft(scrollLeft > 4);
      setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 4);
    };

    updateState();
    container.addEventListener("scroll", updateState, { passive: true });
    window.addEventListener("resize", updateState);

    return () => {
      container.removeEventListener("scroll", updateState);
      window.removeEventListener("resize", updateState);
    };
  }, [cocktails.length]);

  const scrollByPage = (direction: "left" | "right") => {
    const container = scrollRef.current;
    if (!container) return;
    const amount = direction === "left" ? -container.clientWidth : container.clientWidth;
    container.scrollBy({ left: amount, behavior: "smooth" });
  };

  const scrollToPage = (index: number) => {
    const container = scrollRef.current;
    if (!container) return;
    container.scrollTo({ left: index * container.clientWidth, behavior: "smooth" });
  };

  // Debug solo en desarrollo
  if (process.env.NODE_ENV === "development") {
    // eslint-disable-next-line no-console
    console.log(
      `CocktailRow ${title}:`,
      cocktails.map(c => ({
        id: c.id,
        name: c.name,
        min_price: c.min_price,
        min_size_id: c.min_size_id,
      }))
    );
  }

  return (
    <section className="py-12">
      <div className="max-w-7xl mx-auto px-6">
        {showTitle && (
          <h2 className="text-2xl md:text-3xl font-[--font-unica] text-cosmic-gold mb-6">
            {title}
          </h2>
        )}

        <div className="relative">
          <div
            ref={scrollRef}
            className="flex overflow-x-auto gap-6 pb-6 snap-x snap-mandatory scrollbar-hide px-4 py-2"
          >
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
                {cocktail.min_price !== null && cocktail.min_size_id ? (
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
                ) : (
                  <button
                    type="button"
                    disabled
                    className="mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-full border border-cosmic-gold/40 text-cosmic-gold/60 bg-cosmic-gold/10 cursor-not-allowed text-sm"
                  >
                    {t("shop.coming_soon")}
                  </button>
                )}
              </div>
            ))}
          </div>

          {pageCount > 1 && (
            <>
              <button
                type="button"
                onClick={() => scrollByPage("left")}
                disabled={!canScrollLeft}
                aria-label="Scroll left"
                className={clsx(
                  "absolute left-2 top-1/2 -translate-y-1/2 z-10 flex h-9 w-9 items-center justify-center rounded-full border border-cosmic-gold/30 bg-black/40 text-cosmic-gold transition hover:border-cosmic-gold hover:text-white",
                  !canScrollLeft && "opacity-40 cursor-not-allowed"
                )}
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => scrollByPage("right")}
                disabled={!canScrollRight}
                aria-label="Scroll right"
                className={clsx(
                  "absolute right-2 top-1/2 -translate-y-1/2 z-10 flex h-9 w-9 items-center justify-center rounded-full border border-cosmic-gold/30 bg-black/40 text-cosmic-gold transition hover:border-cosmic-gold hover:text-white",
                  !canScrollRight && "opacity-40 cursor-not-allowed"
                )}
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </>
          )}
        </div>

        {pageCount > 1 && (
          <div className="mt-4 flex items-center justify-center gap-2">
            {pageIndexes.map(index => (
              <button
                key={index}
                type="button"
                onClick={() => scrollToPage(index)}
                aria-label={`Go to page ${index + 1}`}
                className={clsx(
                  "h-2.5 w-2.5 rounded-full border border-cosmic-gold/40 transition",
                  index === activePage
                    ? "bg-cosmic-gold"
                    : "bg-transparent hover:bg-cosmic-gold/40"
                )}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
