"use client";

import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";
import { CocktailWithPrice } from "@/types";
import dynamic from "next/dynamic";
import { useLanguage } from "@/contexts/LanguageContext";
import ShopLoadingState from "./components/ShopLoadingState";

const FeaturedBanner = dynamic(() => import("./components/FeaturedBanner"), {
  ssr: true,
  loading: () => (
    <div className="h-56 w-full animate-pulse bg-cosmic-silver/10 rounded-xl" />
  ),
});

const CocktailRow = dynamic(() => import("./components/CocktailRow"), {
  ssr: true,
  loading: () => (
    <div className="h-72 w-full animate-pulse bg-cosmic-silver/10 rounded-xl" />
  ),
});

export default function ShopPage() {
  const { t } = useLanguage();
  const [cocktails, setCocktails] = useState<CocktailWithPrice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  async function fetchCocktails() {
    try {
      setLoading(true);
      setError(null);
      // Intentar conectar con Supabase primero
      const { data: cocktailRows, error } = await supabase
        .from("cocktails")
        .select(
          `
          id,
          name,
          description,
          image_url,
          is_available,
          alcohol_percentage,
          has_non_alcoholic_version
        `
        )
        .eq("is_available", true);

      if (error) {
        throw error;
      }

      const typedCocktails = (cocktailRows ?? []) as Array<{
        id: string;
        name: string;
        description: string | null;
        image_url: string | null;
        alcohol_percentage: number;
        has_non_alcoholic_version: boolean;
      }>;

      if (typedCocktails.length === 0) {
        setCocktails([]);
        return;
      }

      const cocktailIds = typedCocktails.map(cocktail => cocktail.id);
      const { data: sizes, error: sizeError } = await (supabase as any)
        .from("cocktail_sizes")
        .select("id, price, cocktail_id")
        .eq("available", true)
        .in("cocktail_id", cocktailIds);

      if (sizeError) {
        console.error(sizeError);
      }

      const priceByCocktail = new Map<
        string,
        { minPrice: number | null; minSizeId: string | null }
      >();

      (sizes as Array<{
        id: string;
        price: number;
        cocktail_id: string;
      }> | null)?.forEach(size => {
        const current = priceByCocktail.get(size.cocktail_id);
        if (!current || current.minPrice === null || size.price < current.minPrice) {
          priceByCocktail.set(size.cocktail_id, {
            minPrice: size.price,
            minSizeId: size.id,
          });
        }
      });

      const cocktailsWithPrices = typedCocktails.map(cocktail => {
        const price = priceByCocktail.get(cocktail.id);

        return {
          id: cocktail.id,
          name: cocktail.name,
          description: cocktail.description,
          image_url: cocktail.image_url,
          min_price: price?.minPrice ?? null,
          min_size_id: price?.minSizeId ?? null,
          alcohol_percentage: cocktail.alcohol_percentage,
          has_non_alcoholic_version: cocktail.has_non_alcoholic_version,
        };
      });

      setCocktails(cocktailsWithPrices);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : t("shop.error_description")
      );
      setCocktails([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchCocktails();
  }, []);

  if (loading) {
    return <ShopLoadingState />;
  }

  if (error) {
    return (
      <section className="min-h-[60vh] flex items-center justify-center px-6 py-24 text-center">
        <div className="max-w-xl space-y-4">
          <h1 className="text-3xl font-[--font-unica] text-[#D8DAE3]">
            {t("shop.error_title")}
          </h1>
          <p className="text-cosmic-silver">{t("shop.error_description")}</p>
          <button
            onClick={fetchCocktails}
            className="inline-flex items-center justify-center px-5 py-2 rounded-full border border-cosmic-gold text-cosmic-gold hover:bg-cosmic-gold hover:text-black transition-colors"
          >
            {t("common.retry")}
          </button>
        </div>
      </section>
    );
  }

  if (cocktails.length === 0) {
    return (
      <section className="min-h-[60vh] flex items-center justify-center px-6 py-24 text-center">
        <div className="max-w-xl space-y-4">
          <h1 className="text-3xl font-[--font-unica] text-[#D8DAE3]">
            {t("shop.empty_title")}
          </h1>
          <p className="text-cosmic-silver">{t("shop.empty_description")}</p>
          <button
            onClick={fetchCocktails}
            className="inline-flex items-center justify-center px-5 py-2 rounded-full border border-cosmic-gold text-cosmic-gold hover:bg-cosmic-gold hover:text-black transition-colors"
          >
            {t("common.retry")}
          </button>
        </div>
      </section>
    );
  }

  // Agrupar cócteles por categorías
  const nonAlcoholicCocktails = cocktails.filter(
    c => c.alcohol_percentage === 0
  );
  const strongCocktails = cocktails.filter(c => c.alcohol_percentage >= 18);
  const lightCocktails = cocktails.filter(
    c => c.alcohol_percentage > 0 && c.alcohol_percentage <= 14
  );
  const tropicalCocktails = cocktails.filter(
    c =>
      c.name.toLowerCase().includes("tropical") ||
      c.name.toLowerCase().includes("tiki") ||
      c.name.toLowerCase().includes("pina") ||
      c.name.toLowerCase().includes("coconut")
  );

  return (
    <section className="py-24 px-6">
      <div className="max-w-7xl mx-auto space-y-20">
        {/* Banner Principal */}
        <FeaturedBanner />

        {/* Sección Principal - Todos los Cócteles */}
        <CocktailRow title={t("shop.all_cocktails")} cocktails={cocktails} />

        {/* Secciones Agrupadas - Solo mostrar si hay cócteles */}
        {nonAlcoholicCocktails.length > 0 && (
          <CocktailRow
            title={t("shop.non_alcoholic")}
            cocktails={nonAlcoholicCocktails}
          />
        )}

        {strongCocktails.length > 0 && (
          <CocktailRow
            title={t("shop.strong_drinks")}
            cocktails={strongCocktails}
          />
        )}

        {lightCocktails.length > 0 && (
          <CocktailRow
            title={t("shop.light_fresh")}
            cocktails={lightCocktails}
          />
        )}

        {tropicalCocktails.length > 0 && (
          <CocktailRow
            title={t("shop.tropical")}
            cocktails={tropicalCocktails}
          />
        )}
      </div>
    </section>
  );
}
