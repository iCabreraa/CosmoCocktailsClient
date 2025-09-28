"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { CocktailWithPrice } from "@/types";
import { useCocktailPagination } from "@/hooks/useCocktailPagination";

import FeaturedBanner from "./components/FeaturedBanner";
import CocktailGridOptimized from "@/components/shop/CocktailGridOptimized";
import CocktailFilters from "@/components/filters/CocktailFilters";
import SortSelector from "@/components/filters/SortSelector";
import PaginationControls from "@/components/pagination/PaginationControls";
import PaginationInfo from "@/components/pagination/PaginationInfo";
import ItemsPerPageSelector from "@/components/pagination/ItemsPerPageSelector";

export default function ShopPageOptimized() {
  const [cocktails, setCocktails] = useState<CocktailWithPrice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Paginación y filtros
  const {
    paginatedCocktails,
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    filters,
    searchQuery,
    setSearchQuery,
    setFilters,
    clearFilters,
    sortOptions,
    setSortOptions,
    goToPage,
    nextPage,
    prevPage,
    goToFirst,
    goToLast,
    setItemsPerPage,
    loading: paginationLoading,
    hasResults,
    hasFilters,
    stats,
  } = useCocktailPagination(cocktails, {
    initialPage: 1,
    itemsPerPage: 12,
  });

  // Cargar cócteles
  useEffect(() => {
    async function fetchCocktails() {
      try {
        setLoading(true);
        setError(null);

        const { data: cocktailsData, error: cocktailsError } = await supabase
          .from("cocktails")
          .select(
            `
            id,
            name,
            description,
            image_url,
            is_available,
            alcohol_percentage,
            has_non_alcoholic_version,
            created_at
          `
          )
          .eq("is_available", true)
          .order("name");

        if (cocktailsError) {
          console.warn(
            "Error conectando con Supabase:",
            cocktailsError.message
          );
          throw cocktailsError;
        }

        if (!cocktailsData || cocktailsData.length === 0) {
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
              tags: ["tropical", "classic"],
              created_at: new Date().toISOString(),
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
              tags: ["modern", "featured"],
              created_at: new Date().toISOString(),
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
              tags: ["tropical", "classic"],
              created_at: new Date().toISOString(),
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
              tags: ["classic", "refreshing"],
              created_at: new Date().toISOString(),
            },
            {
              id: "5",
              name: "Cosmic Margarita",
              description:
                "A stellar margarita with cosmic flavors and premium tequila.",
              image_url: "/images/cocktailsImages/cosmic-margarita.webp",
              min_price: 13.99,
              min_size_id: "5",
              alcohol_percentage: 16,
              has_non_alcoholic_version: false,
              tags: ["featured", "premium"],
              created_at: new Date().toISOString(),
            },
            {
              id: "6",
              name: "Stellar Martini",
              description:
                "An elegant martini with stellar presentation and smooth finish.",
              image_url: "/images/cocktailsImages/stellar-martini.webp",
              min_price: 15.99,
              min_size_id: "6",
              alcohol_percentage: 20,
              has_non_alcoholic_version: true,
              tags: ["premium", "elegant"],
              created_at: new Date().toISOString(),
            },
          ];
          setCocktails(mockCocktails);
          return;
        }

        // Procesar cócteles con precios
        const cocktailsWithPrices = await Promise.all(
          cocktailsData.map(async cocktail => {
            const { data: sizes, error: sizeError } = await supabase
              .from("cocktail_sizes")
              .select("id, price")
              .eq("cocktail_id", cocktail.id)
              .eq("available", true);

            if (sizeError) console.error(sizeError);

            const minPrice =
              sizes && sizes.length > 0
                ? Math.min(...sizes.map(s => s.price))
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
              tags: [], // No hay columna tags en la BD
              created_at: cocktail.created_at,
            };
          })
        );

        setCocktails(cocktailsWithPrices);
      } catch (err) {
        console.error("Error fetching cocktails:", err);
        setError("Error al cargar los cócteles");

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
            tags: ["tropical", "classic"],
            created_at: new Date().toISOString(),
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
            tags: ["modern", "featured"],
            created_at: new Date().toISOString(),
          },
        ];
        setCocktails(mockCocktails);
      } finally {
        setLoading(false);
      }
    }

    fetchCocktails();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-cosmic-bg">
        <FeaturedBanner />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cosmic-gold mx-auto"></div>
            <p className="text-cosmic-silver text-lg mt-4">
              Cargando cócteles...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-cosmic-bg">
        <FeaturedBanner />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-[--font-unica] text-cosmic-gold mb-2">
              Error al cargar los cócteles
            </h2>
            <p className="text-cosmic-silver mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-cosmic-gold text-cosmic-bg rounded-lg hover:bg-cosmic-gold/90 transition-colors duration-200"
            >
              Reintentar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cosmic-bg">
      <FeaturedBanner />

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-cosmic-gold mb-4 font-[--font-unica]">
            Nuestra Colección Cósmica
          </h1>
          <p className="text-cosmic-silver text-lg max-w-2xl mx-auto">
            Descubre nuestros cócteles premium, cuidadosamente seleccionados
            para ofrecerte una experiencia única en cada sorbo.
          </p>
        </div>

        {/* Filtros */}
        <CocktailFilters
          filters={filters}
          onFiltersChange={setFilters}
          onClearFilters={clearFilters}
          stats={stats}
          className="mb-8"
        />

        {/* Controles de ordenamiento y paginación */}
        <div className="flex flex-col sm:flex-row items-center justify-between mb-6 space-y-4 sm:space-y-0">
          <div className="flex items-center space-x-4">
            <SortSelector
              sortOptions={sortOptions}
              onSortChange={setSortOptions}
            />
          </div>

          <div className="flex items-center space-x-4">
            <ItemsPerPageSelector
              currentItemsPerPage={itemsPerPage}
              onItemsPerPageChange={setItemsPerPage}
            />
          </div>
        </div>

        {/* Grid de cócteles */}
        <CocktailGridOptimized
          cocktails={paginatedCocktails}
          loading={paginationLoading}
          className="mb-8"
        />

        {/* Información de paginación */}
        <PaginationInfo
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          itemsPerPage={itemsPerPage}
          startIndex={(currentPage - 1) * itemsPerPage}
          endIndex={Math.min(currentPage * itemsPerPage, totalItems)}
          loading={paginationLoading}
          className="mb-6"
        />

        {/* Controles de paginación */}
        <PaginationControls
          currentPage={currentPage}
          totalPages={totalPages}
          visiblePages={Array.from(
            { length: Math.min(5, totalPages) },
            (_, i) => i + 1
          )}
          hasNextPage={currentPage < totalPages}
          hasPrevPage={currentPage > 1}
          isFirstPage={currentPage === 1}
          isLastPage={currentPage === totalPages}
          onPageChange={goToPage}
          onNext={nextPage}
          onPrev={prevPage}
          onFirst={goToFirst}
          onLast={goToLast}
        />
      </div>
    </div>
  );
}
