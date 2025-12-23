"use client";

import { useLanguage } from "@/contexts/LanguageContext";

const ROW_COUNT = 3;
const CARD_COUNT = 4;

export default function ShopLoadingState() {
  const { t } = useLanguage();

  return (
    <section className="py-24 px-6">
      <div className="max-w-7xl mx-auto space-y-12">
        <div className="flex items-center gap-3 text-cosmic-silver">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-cosmic-gold border-t-transparent" />
          <p className="text-lg">{t("shop.loading")}</p>
        </div>

        <div className="h-56 w-full rounded-xl bg-cosmic-silver/10 animate-pulse" />

        {Array.from({ length: ROW_COUNT }).map((_, rowIndex) => (
          <div key={`shop-loading-row-${rowIndex}`} className="space-y-6">
            <div className="h-6 w-48 rounded-full bg-cosmic-silver/10 animate-pulse" />
            <div className="flex gap-6 overflow-x-auto pb-6">
              {Array.from({ length: CARD_COUNT }).map((__, cardIndex) => (
                <div
                  key={`shop-loading-card-${rowIndex}-${cardIndex}`}
                  className="min-w-[220px] rounded-lg border border-cosmic-gold/10 bg-white/5 p-4"
                >
                  <div className="h-40 w-full rounded-lg bg-cosmic-silver/10 animate-pulse" />
                  <div className="mt-4 h-4 w-3/4 rounded-full bg-cosmic-silver/10 animate-pulse" />
                  <div className="mt-2 h-4 w-1/2 rounded-full bg-cosmic-silver/10 animate-pulse" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
