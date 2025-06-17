"use client";

import { supabase } from "@/lib/supabaseClient";
import { useEffect, useState } from "react";
import { CocktailWithPrice } from "@/types";

import FeaturedBanner from "./components/FeaturedBanner";
import CocktailRow from "./components/CocktailRow";

export default function ShopPage() {
  const [cocktails, setCocktails] = useState<CocktailWithPrice[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchCocktails() {
    try {
      const { data: cocktails, error } = await supabase
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

      if (error) throw error;

      if (!cocktails || cocktails.length === 0) {
        console.warn("No cocktails found in database");
        setCocktails([]);
        return;
      }

      const cocktailsWithPrices = await Promise.all(
        cocktails.map(async (cocktail) => {
          const { data: sizes, error: sizeError } = await supabase
            .from("cocktail_sizes")
            .select("id, price")
            .eq("cocktail_id", cocktail.id)
            .eq("available", true);

          if (sizeError) console.error(sizeError);

          const minPrice =
            sizes && sizes.length > 0
              ? Math.min(...sizes.map((s) => s.price))
              : null;
          const minSizeId =
            sizes && sizes.length > 0
              ? sizes.reduce((prev, curr) =>
                  curr.price < prev.price ? curr : prev
                ).id
              : null;

          return {
            id: cocktail.id,
            name: cocktail.name,
            description: cocktail.description,
            image_url: cocktail.image_url,
            min_price: minPrice,
            min_size_id: minSizeId,
            alcohol_percentage: cocktail.alcohol_percentage,
            has_non_alcoholic_version: cocktail.has_non_alcoholic_version,
          };
        })
      );

      setCocktails(cocktailsWithPrices);
    } catch (err) {
      console.error("Error fetching cocktails:", err);
      setCocktails([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchCocktails();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex justify-center items-center">
        <p className="text-cosmic-silver text-lg">Loading cocktails...</p>
      </div>
    );
  }

  return (
    <section className="py-24 px-6">
      <div className="max-w-7xl mx-auto space-y-20">
        {/* Banner Principal */}
        <FeaturedBanner />

        {/* Sección de Cartelera de Cócteles */}
        <CocktailRow title="All Cocktails" cocktails={cocktails} />

        <CocktailRow
          title="Non-Alcoholic Magic"
          cocktails={cocktails.filter((c) => c.has_non_alcoholic_version)}
        />

        <CocktailRow
          title="Strong Drinks"
          cocktails={cocktails.filter((c) => c.alcohol_percentage >= 18)}
        />

        <CocktailRow
          title="Light & Fresh"
          cocktails={cocktails.filter((c) => c.alcohol_percentage <= 14)}
        />

        <CocktailRow
          title="Tropical Tiki"
          cocktails={cocktails.filter((c) =>
            c.name.toLowerCase().includes("tiki")
          )}
        />
        {/* Aquí luego añadimos más CocktailRow por categorías específicas */}
      </div>
    </section>
  );
}
