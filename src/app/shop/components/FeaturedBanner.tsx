"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import Image from "next/image";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

type FeaturedSlide = {
  title: string;
  description: string;
  image: string;
};

export default function FeaturedBanner() {
  const { t } = useLanguage();
  const [activeIndex, setActiveIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const prevRef = useRef<HTMLButtonElement>(null);
  const nextRef = useRef<HTMLButtonElement>(null);

  const featuredCocktails = useMemo<FeaturedSlide[]>(
    () => [
      {
        title: t("shop.tropical"),
        description: t("shop.tropical_description"),
        image: "/images/featured/tropical.webp",
      },
      {
        title: t("shop.cosmic_classics"),
        description: t("shop.cosmic_classics_description"),
        image: "/images/featured/classics.webp",
      },
      {
        title: t("shop.non_alcoholic"),
        description: t("shop.non_alcoholic_description"),
        image: "/images/featured/nonalcoholic.webp",
      },
    ],
    [t]
  );

  const activeSlide = featuredCocktails[activeIndex] ?? featuredCocktails[0];

  useEffect(() => {
    if (!isModalOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsModalOpen(false);
      }
    };

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isModalOpen]);

  const handleExplore = () => {
    setIsModalOpen(false);
    const target = document.getElementById("shop-catalog");
    if (!target) return;
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    const behavior: ScrollBehavior = prefersReducedMotion ? "auto" : "smooth";
    target.scrollIntoView({ behavior, block: "start" });
  };

  return (
    <>
      <div className="relative w-full overflow-hidden rounded-2xl border border-cosmic-gold/20 bg-[url('/images/hero-bg.webp')] bg-cover bg-center shadow-[0_30px_120px_rgba(0,0,0,0.55)]">
        <Swiper
          modules={[Autoplay, Navigation, Pagination]}
          autoplay={{ delay: 5200, disableOnInteraction: false }}
          pagination={{ clickable: true }}
          loop={true}
          onSlideChange={swiper => setActiveIndex(swiper.realIndex)}
          navigation={{
            prevEl: prevRef.current,
            nextEl: nextRef.current,
          }}
          onBeforeInit={swiper => {
            if (typeof swiper.params.navigation !== "boolean") {
              swiper.params.navigation.prevEl = prevRef.current;
              swiper.params.navigation.nextEl = nextRef.current;
            }
          }}
          onSwiper={swiper => {
            if (typeof swiper.params.navigation === "boolean") return;
            if (prevRef.current && nextRef.current) {
              swiper.params.navigation.prevEl = prevRef.current;
              swiper.params.navigation.nextEl = nextRef.current;
              swiper.navigation.init();
              swiper.navigation.update();
            }
          }}
          className="featured-swiper h-[420px] md:h-[560px]"
        >
          {featuredCocktails.map((cocktail, index) => (
            <SwiperSlide key={cocktail.title}>
              <div className="relative h-full w-full">
                <Image
                  src={cocktail.image}
                  alt={cocktail.title}
                  fill
                  className="object-cover"
                  priority={index === 0}
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/30 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                <div className="relative z-10 flex h-full items-end md:items-center">
                  <div className="max-w-2xl px-6 pb-12 md:px-16 md:pb-0">
                    <span className="inline-flex items-center rounded-full border border-cosmic-gold/40 bg-black/40 px-3 py-1 text-[11px] uppercase tracking-[0.22em] text-cosmic-gold">
                      {cocktail.title}
                    </span>
                    <h2 className="mt-4 text-3xl md:text-5xl font-[--font-unica] text-white drop-shadow-lg">
                      {cocktail.title}
                    </h2>
                    <p className="mt-4 text-base md:text-lg text-cosmic-silver/90 leading-relaxed drop-shadow">
                      {cocktail.description}
                    </p>
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(true)}
                      className="mt-6 inline-flex items-center justify-center rounded-full border border-cosmic-gold px-4 py-2 text-xs md:text-sm font-[--font-josefin] text-cosmic-gold transition hover:bg-cosmic-gold hover:text-black focus:outline-none focus-visible:ring-2 focus-visible:ring-cosmic-gold"
                    >
                      {t("shop.explore_now")}
                    </button>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>

        <button
          type="button"
          ref={prevRef}
          aria-label="Previous featured slide"
          className="absolute left-4 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-cosmic-gold/40 bg-black/40 text-cosmic-gold backdrop-blur-sm transition hover:border-cosmic-gold hover:text-white"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button
          type="button"
          ref={nextRef}
          aria-label="Next featured slide"
          className="absolute right-4 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-cosmic-gold/40 bg-black/40 text-cosmic-gold backdrop-blur-sm transition hover:border-cosmic-gold hover:text-white"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      {isModalOpen && activeSlide && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-6"
          onClick={() => setIsModalOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="featured-collection-title"
        >
          <div
            className="w-full max-w-3xl overflow-hidden rounded-2xl border border-cosmic-gold/30 bg-[#0B0F17]/95 shadow-2xl"
            onClick={event => event.stopPropagation()}
          >
            <div className="flex items-start justify-between border-b border-white/10 px-6 py-4">
              <h3
                id="featured-collection-title"
                className="text-lg md:text-xl font-[--font-unica] text-white"
              >
                {activeSlide.title}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="rounded-full p-2 text-white/70 transition hover:text-white hover:bg-white/10"
                aria-label={t("common.close")}
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="grid gap-6 px-6 py-6 md:grid-cols-[1.1fr_1fr] md:items-center">
              <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl border border-cosmic-gold/10">
                <Image
                  src={activeSlide.image}
                  alt={activeSlide.title}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="space-y-4 text-sm text-cosmic-silver">
                <p className="text-base text-white/90">
                  {activeSlide.description}
                </p>
                <p className="text-sm text-cosmic-silver/80">
                  {t("shop.explore_now")}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-end gap-3 border-t border-white/10 px-6 py-4">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="rounded-full border border-white/20 px-4 py-2 text-sm text-white/80 transition hover:text-white hover:border-white/40"
              >
                {t("common.close")}
              </button>
              <button
                type="button"
                onClick={handleExplore}
                className="rounded-full bg-cosmic-gold px-5 py-2 text-sm font-semibold text-black transition hover:bg-cosmic-gold/85"
              >
                {t("shop.explore_now")}
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        .featured-swiper .swiper-pagination-bullet {
          width: 10px;
          height: 10px;
          opacity: 1;
          background: rgba(209, 184, 127, 0.35);
          border: 1px solid rgba(209, 184, 127, 0.6);
          transition: transform 0.2s ease, background 0.2s ease;
        }

        .featured-swiper .swiper-pagination-bullet-active {
          background: rgba(209, 184, 127, 0.95);
          transform: scale(1.1);
          box-shadow: 0 0 8px rgba(209, 184, 127, 0.6);
        }
      `}</style>
    </>
  );
}
