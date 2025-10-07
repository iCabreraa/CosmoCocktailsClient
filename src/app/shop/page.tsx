"use client";

import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";
import { CocktailWithPrice } from "@/types";
import dynamic from "next/dynamic";

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
  const [cocktails, setCocktails] = useState<CocktailWithPrice[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  async function fetchCocktails() {
    try {
      // Intentar conectar con Supabase primero
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

      if (error) {
        console.warn("Error conectando con Supabase:", error.message);
        throw error;
      }

      if (!cocktails || cocktails.length === 0) {
        console.warn("No cocktails found in database, using mock data");
        // Usar datos de ejemplo si no hay datos en Supabase
        const mockCocktails: CocktailWithPrice[] = [
          {
            id: "1",
            name: "Sex on the Beach",
            description:
              "A tropical blend of vodka, peach schnapps, cranberry juice, and orange juice.",
            image_url: "/images/cocktailsImages/sex-on-the-beach.webp",
            min_price: 12.99,
            min_size_id: "1",
            alcohol_percentage: 15,
            has_non_alcoholic_version: true,
          },
          {
            id: "2",
            name: "Pornstar Martini",
            description:
              "A modern classic with vanilla vodka, passion fruit, and prosecco.",
            image_url: "/images/cocktailsImages/pornstar-martini.webp",
            min_price: 14.99,
            min_size_id: "2",
            alcohol_percentage: 18,
            has_non_alcoholic_version: true,
          },
          {
            id: "3",
            name: "Piña Colada",
            description:
              "A tropical delight with rum, coconut cream, and pineapple juice.",
            image_url: "/images/cocktailsImages/pina-colada.webp",
            min_price: 11.99,
            min_size_id: "3",
            alcohol_percentage: 12,
            has_non_alcoholic_version: true,
          },
          {
            id: "4",
            name: "Gin and Tonic",
            description:
              "A classic refreshing cocktail with gin and tonic water.",
            image_url: "/images/cocktailsImages/gin-and-tonic.webp",
            min_price: 9.99,
            min_size_id: "4",
            alcohol_percentage: 14,
            has_non_alcoholic_version: true,
          },
        ];
        setCocktails(mockCocktails);
        return;
      }

      // Si hay datos en Supabase, procesarlos normalmente
      const cocktailsWithPrices = await Promise.all(
        cocktails.map(async (cocktail: any) => {
          const { data: sizes, error: sizeError } = await (supabase as any)
            .from("cocktail_sizes")
            .select("id, price")
            .eq("cocktail_id", cocktail.id)
            .eq("available", true);

          if (sizeError) console.error(sizeError);

          const typedSizes = sizes as Array<{
            id: string;
            price: number;
          }> | null;
          const minPrice =
            typedSizes && typedSizes.length > 0
              ? Math.min(...typedSizes.map(s => s.price))
              : null;

          const minSizeId =
            typedSizes && typedSizes.length > 0
              ? typedSizes.reduce((prev, curr) =>
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
      // En caso de error, usar datos de ejemplo
      const mockCocktails: CocktailWithPrice[] = [
        {
          id: "1",
          name: "Sex on the Beach",
          description:
            "A tropical blend of vodka, peach schnapps, cranberry juice, and orange juice.",
          image_url: "/images/cocktailsImages/sex-on-the-beach.webp",
          min_price: 12.99,
          min_size_id: "1",
          alcohol_percentage: 15,
          has_non_alcoholic_version: true,
        },
        {
          id: "2",
          name: "Pornstar Martini",
          description:
            "A modern classic with vanilla vodka, passion fruit, and prosecco.",
          image_url: "/images/cocktailsImages/pornstar-martini.webp",
          min_price: 14.99,
          min_size_id: "2",
          alcohol_percentage: 18,
          has_non_alcoholic_version: true,
        },
        {
          id: "3",
          name: "Piña Colada",
          description:
            "A tropical delight with rum, coconut cream, and pineapple juice.",
          image_url: "/images/cocktailsImages/pina-colada.webp",
          min_price: 11.99,
          min_size_id: "3",
          alcohol_percentage: 12,
          has_non_alcoholic_version: true,
        },
        {
          id: "4",
          name: "Gin and Tonic",
          description:
            "A classic refreshing cocktail with gin and tonic water.",
          image_url: "/images/cocktailsImages/gin-and-tonic.webp",
          min_price: 9.99,
          min_size_id: "4",
          alcohol_percentage: 14,
          has_non_alcoholic_version: true,
        },
      ];
      setCocktails(mockCocktails);
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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cosmic-gold"></div>
        <p className="text-cosmic-silver text-lg ml-4">Loading cocktails...</p>
      </div>
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
        <CocktailRow title="All Cocktails" cocktails={cocktails} />

        {/* Secciones Agrupadas - Solo mostrar si hay cócteles */}
        {nonAlcoholicCocktails.length > 0 && (
          <CocktailRow
            title="Non-Alcoholic Magic"
            cocktails={nonAlcoholicCocktails}
          />
        )}

        {strongCocktails.length > 0 && (
          <CocktailRow title="Strong Drinks" cocktails={strongCocktails} />
        )}

        {lightCocktails.length > 0 && (
          <CocktailRow title="Light & Fresh" cocktails={lightCocktails} />
        )}

        {tropicalCocktails.length > 0 && (
          <CocktailRow
            title="Tropical Delights"
            cocktails={tropicalCocktails}
          />
        )}
      </div>
    </section>
  );
}
