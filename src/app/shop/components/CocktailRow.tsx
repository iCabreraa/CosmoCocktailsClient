"use client";

import { CocktailWithPrice } from "@/types";
import Link from "next/link";
import Image from "next/image";
import FavoriteButton from "@/components/ui/FavoriteButton";
import { useLanguage } from "@/contexts/LanguageContext";
import clsx from "clsx";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useCart } from "@/store/cart";
import { useToast } from "@/components/feedback/ToastProvider";

type CocktailRowProps = {
  title: string;
  cocktails: CocktailWithPrice[];
  showTitle?: boolean;
  showFavorites?: boolean;
};

export default function CocktailRow({
  title,
  cocktails,
  showTitle = true,
  showFavorites = false,
}: CocktailRowProps) {
  const { t } = useLanguage();
  const { notify } = useToast();
  const addToCart = useCart(state => state.addToCart);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [pageCount, setPageCount] = useState(0);
  const [activePage, setActivePage] = useState(0);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const sizeSlots = [
    { key: "shot", label: t("sizes.shot"), volume: 20 },
    { key: "small_bottle", label: t("sizes.small_bottle"), volume: 200 },
  ];

  const resolveSlotKey = (
    size: NonNullable<CocktailWithPrice["sizes"]>[number]
  ) => {
    const rawName = (size.size_name ?? "").toLowerCase();
    if (rawName.includes("shot")) return "shot";
    if (rawName.includes("small") || rawName.includes("bottle")) {
      return "small_bottle";
    }
    if (typeof size.volume_ml === "number") {
      return size.volume_ml <= 60 ? "shot" : "small_bottle";
    }
    return null;
  };

  const isOutOfStock = (
    size: NonNullable<CocktailWithPrice["sizes"]>[number]
  ) =>
    size.available === false ||
    (typeof size.stock_quantity === "number" && size.stock_quantity <= 0);

  const handleAddToCart = (
    event: React.MouseEvent<HTMLButtonElement>,
    cocktail: CocktailWithPrice,
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
      is_alcoholic: cocktail.alcohol_percentage > 0,
    });
    notify({
      type: "success",
      title: t("feedback.cart_added_title"),
      message: t("feedback.cart_added_message", { name: cocktail.name }),
    });
  };

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
                      {(() => {
                        const hasSizes = (cocktail.sizes ?? []).length > 0;
                        const hasAvailable = (cocktail.sizes ?? []).some(
                          size => !isOutOfStock(size)
                        );
                        if (hasAvailable && cocktail.min_price !== null) {
                          return t("shop.from_price").replace(
                            "{price}",
                            cocktail.min_price.toString()
                          );
                        }
                        return hasSizes
                          ? t("shop.out_of_stock")
                          : t("shop.coming_soon");
                      })()}
                    </p>
                  </Link>
                  {/* Botón de favoritos */}
                  <div className="absolute top-2 right-2">
                    <FavoriteButton
                      cocktailId={cocktail.id}
                      show={showFavorites}
                    />
                  </div>
                </div>
                {(() => {
                  const sizeMap = sizeSlots.reduce<
                    Record<string, NonNullable<CocktailWithPrice["sizes"]>[number] | undefined>
                  >((acc, slot) => {
                    acc[slot.key] = undefined;
                    return acc;
                  }, {});

                  (cocktail.sizes ?? []).forEach(size => {
                    const slotKey = resolveSlotKey(size);
                    if (!slotKey || sizeMap[slotKey]) return;
                    sizeMap[slotKey] = size;
                  });

                  return (
                    <div className="mt-3 space-y-2">
                      {sizeSlots.map(slot => {
                        const size = sizeMap[slot.key];
                        const missing = !size;
                        const outOfStock = size ? isOutOfStock(size) : false;
                        const disabled = missing || outOfStock;
                        const volumeValue =
                          size?.volume_ml ?? slot.volume ?? 0;
                        const volumeLabel = `${volumeValue}ml`.toUpperCase();
                        const priceLabel = missing
                          ? t("shop.price_placeholder")
                          : `€${size?.price.toFixed(2)}`;

                        return (
                          <button
                            key={slot.key}
                            type="button"
                            aria-disabled={disabled}
                            onClick={event => {
                              if (!size || disabled) {
                                event.preventDefault();
                                event.stopPropagation();
                                return;
                              }
                              handleAddToCart(event, cocktail, size);
                            }}
                            className={`group/button relative flex w-full items-center justify-between gap-3 overflow-hidden rounded-xl border px-3 py-2 text-left text-[11px] uppercase tracking-[0.12em] transition ${
                              disabled
                                ? "cursor-not-allowed border-cosmic-gold/20 bg-white/5 text-cosmic-silver/60"
                                : "border-cosmic-gold/30 bg-white/5 text-cosmic-silver hover:border-cosmic-gold hover:bg-cosmic-gold/10 hover:text-white"
                            }`}
                          >
                            <span className="flex flex-col">
                              <span
                                className={`text-[10px] ${
                                  disabled
                                    ? "text-cosmic-gold/60"
                                    : "text-cosmic-gold/80 group-hover/button:text-white"
                                }`}
                              >
                                {slot.label}
                              </span>
                              <span
                                className={`text-[9px] uppercase tracking-[0.2em] ${
                                  disabled
                                    ? "text-cosmic-silver/50"
                                    : "text-cosmic-silver/70 group-hover/button:text-white/80"
                                }`}
                              >
                                {volumeLabel}
                              </span>
                            </span>
                            <span
                              className={`flex items-center gap-1 ${
                                disabled
                                  ? "text-cosmic-gold/60"
                                  : "text-cosmic-gold group-hover/button:text-white"
                              }`}
                            >
                              {priceLabel}
                              <Plus
                                className={`h-3 w-3 ${
                                  disabled ? "opacity-40" : ""
                                }`}
                              />
                            </span>
                            {outOfStock && (
                              <span className="pointer-events-none absolute -right-6 top-2 rotate-45 whitespace-nowrap bg-red-500/90 px-8 py-0.5 text-[9px] uppercase tracking-[0.2em] text-white">
                                {t("shop.out_of_stock_short")}
                              </span>
                            )}
                            {missing && (
                              <span className="pointer-events-none absolute -right-6 top-2 rotate-45 whitespace-nowrap bg-gradient-to-r from-cosmic-gold/80 via-sky-200/80 to-cosmic-gold/80 px-8 py-0.5 text-[9px] uppercase tracking-[0.2em] text-black">
                                {t("shop.coming_soon_short")}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  );
                })()}
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
