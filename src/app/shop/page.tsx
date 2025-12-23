"use client";

import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";
import { CocktailWithPrice } from "@/types";
import dynamic from "next/dynamic";
import { useLanguage } from "@/contexts/LanguageContext";
import ShopLoadingState from "./components/ShopLoadingState";
import CocktailGrid from "./components/CocktailGrid";
import { AnimatePresence, motion } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsDown,
  LayoutGrid,
  Rows2,
} from "lucide-react";

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
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<"lazy" | "pagination">(
    "pagination"
  );
  const supabase = createClient();

  const PAGE_SIZE = 12;

  async function fetchCocktailsPage(page: number, append: boolean) {
    try {
      if (append) {
        setLoadingMore(true);
      } else {
        setLoading(true);
        setError(null);
      }
      // Intentar conectar con Supabase primero
      const { data: cocktailRows, error, count } = await supabase
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
        `,
          { count: "exact" }
        )
        .eq("is_available", true)
        .order("name", { ascending: true })
        .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);

      if (error) {
        throw error;
      }

      if (typeof count === "number") {
        setTotalCount(count);
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
        if (!append) {
          setCocktails([]);
        }
        return;
      }

      const cocktailIds = typedCocktails.map(cocktail => cocktail.id);
      const { data: sizes, error: sizeError } =
        cocktailIds.length > 0
          ? await (supabase as any)
              .from("cocktail_sizes")
              .select("id, price, cocktail_id, sizes_id")
              .eq("available", true)
              .in("cocktail_id", cocktailIds)
          : { data: [], error: null };

      if (sizeError) {
        console.error(sizeError);
      }

      const sizeIds = (sizes as Array<{
        sizes_id: string | null;
      }> | null)
        ?.map(size => size.sizes_id)
        .filter((id): id is string => Boolean(id)) ?? [];

      const { data: sizeDetails } =
        sizeIds.length > 0
          ? await supabase
              .from("sizes")
              .select("id, name, volume_ml")
              .in("id", sizeIds)
          : { data: [] };

      const sizeDetailById = new Map<
        string,
        { name: string | null; volume_ml: number | null }
      >(
        (sizeDetails as Array<{
          id: string;
          name: string | null;
          volume_ml: number | null;
        }> | null)?.map(detail => [
          detail.id,
          { name: detail.name, volume_ml: detail.volume_ml },
        ]) ?? []
      );

      const priceByCocktail = new Map<
        string,
        { minPrice: number | null; minSizeId: string | null }
      >();
      const sizesByCocktail = new Map<
        string,
        Array<{
          id: string;
          price: number;
          sizes_id: string;
          size_name: string | null;
          volume_ml: number | null;
        }>
      >();

      (sizes as Array<{
        id: string;
        price: number;
        cocktail_id: string;
        sizes_id: string | null;
      }> | null)?.forEach(size => {
        const current = priceByCocktail.get(size.cocktail_id);
        if (
          !current ||
          current.minPrice === null ||
          size.price < current.minPrice
        ) {
          priceByCocktail.set(size.cocktail_id, {
            minPrice: size.price,
            minSizeId: size.id,
          });
        }

        if (size.sizes_id) {
          const detail = sizeDetailById.get(size.sizes_id);
          const list = sizesByCocktail.get(size.cocktail_id) ?? [];
          list.push({
            id: size.id,
            price: size.price,
            sizes_id: size.sizes_id,
            size_name: detail?.name ?? null,
            volume_ml: detail?.volume_ml ?? null,
          });
          sizesByCocktail.set(size.cocktail_id, list);
        }
      });

      const cocktailsWithPrices = typedCocktails.map(cocktail => {
        const price = priceByCocktail.get(cocktail.id);
        const sizeOptions = sizesByCocktail.get(cocktail.id) ?? [];
        sizeOptions.sort((a, b) => a.price - b.price);

        return {
          id: cocktail.id,
          name: cocktail.name,
          description: cocktail.description,
          image_url: cocktail.image_url,
          min_price: price?.minPrice ?? null,
          min_size_id: price?.minSizeId ?? null,
          alcohol_percentage: cocktail.alcohol_percentage,
          has_non_alcoholic_version: cocktail.has_non_alcoholic_version,
          sizes: sizeOptions,
        };
      });

      if (append) {
        setCocktails(prev => {
          const next = [...prev];
          const existingIds = new Set(prev.map(item => item.id));
          cocktailsWithPrices.forEach(item => {
            if (!existingIds.has(item.id)) {
              next.push(item);
            }
          });
          return next;
        });
      } else {
        setCocktails(cocktailsWithPrices);
      }
    } catch (err) {
      if (!append) {
        setError(
          err instanceof Error ? err.message : t("shop.error_description")
        );
        setCocktails([]);
      } else {
        console.error(err);
      }
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }

  useEffect(() => {
    fetchCocktailsPage(1, false);
  }, []);

  const handleRetry = () => {
    setCurrentPage(1);
    setCocktails([]);
    fetchCocktailsPage(1, false);
  };

  const handleViewModeChange = (mode: "lazy" | "pagination") => {
    if (mode === viewMode) return;
    setViewMode(mode);
    setCurrentPage(1);
    setCocktails([]);
    fetchCocktailsPage(1, false);
  };

  const handleLoadMore = () => {
    if (loadingMore) return;
    const nextPage = currentPage + 1;
    setCurrentPage(nextPage);
    fetchCocktailsPage(nextPage, true);
  };

  const handlePageChange = (page: number) => {
    if (page === currentPage || loading) return;
    setCurrentPage(page);
    fetchCocktailsPage(page, false);
  };

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        <ShopLoadingState />
      </motion.div>
    );
  }

  if (error) {
    return (
      <motion.section
        className="min-h-[60vh] flex items-center justify-center px-6 py-24 text-center"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        <div className="max-w-xl space-y-4">
          <h1 className="text-3xl font-[--font-unica] text-[#D8DAE3]">
            {t("shop.error_title")}
          </h1>
          <p className="text-cosmic-silver">{t("shop.error_description")}</p>
          <button
            onClick={handleRetry}
            className="inline-flex items-center justify-center px-5 py-2 rounded-full border border-cosmic-gold text-cosmic-gold hover:bg-cosmic-gold hover:text-black transition-colors"
          >
            {t("common.retry")}
          </button>
        </div>
      </motion.section>
    );
  }

  if (cocktails.length === 0) {
    return (
      <motion.section
        className="min-h-[60vh] flex items-center justify-center px-6 py-24 text-center"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        <div className="max-w-xl space-y-4">
          <h1 className="text-3xl font-[--font-unica] text-[#D8DAE3]">
            {t("shop.empty_title")}
          </h1>
          <p className="text-cosmic-silver">{t("shop.empty_description")}</p>
          <button
            onClick={handleRetry}
            className="inline-flex items-center justify-center px-5 py-2 rounded-full border border-cosmic-gold text-cosmic-gold hover:bg-cosmic-gold hover:text-black transition-colors"
          >
            {t("common.retry")}
          </button>
        </div>
      </motion.section>
    );
  }

  const totalPages =
    totalCount > 0 ? Math.ceil(totalCount / PAGE_SIZE) : 1;
  const hasMore = totalCount > 0 && cocktails.length < totalCount;

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
    <motion.section
      className="py-24 px-6"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
    >
      <div className="max-w-7xl mx-auto space-y-20">
        {/* Banner Principal */}
        <FeaturedBanner />

        <div className="flex flex-col items-center gap-3 text-sm text-cosmic-silver">
          <h2 className="text-2xl md:text-3xl font-[--font-unica] text-cosmic-gold">
            {t("shop.all_cocktails")}
          </h2>
          <div className="inline-flex items-center gap-2 rounded-full border border-cosmic-gold/20 bg-white/5 p-1">
            <button
              type="button"
              onClick={() => handleViewModeChange("pagination")}
              aria-pressed={viewMode === "pagination"}
              title={t("shop.view_mode_pagination")}
              className={`flex h-9 w-9 items-center justify-center rounded-full transition ${
                viewMode === "pagination"
                  ? "bg-cosmic-gold text-black"
                  : "text-cosmic-silver hover:text-white"
              }`}
            >
              <LayoutGrid className="h-4 w-4" />
              <span className="sr-only">
                {t("shop.view_mode_pagination")}
              </span>
            </button>
            <button
              type="button"
              onClick={() => handleViewModeChange("lazy")}
              aria-pressed={viewMode === "lazy"}
              title={t("shop.view_mode_lazy")}
              className={`flex h-9 w-9 items-center justify-center rounded-full transition ${
                viewMode === "lazy"
                  ? "bg-cosmic-gold text-black"
                  : "text-cosmic-silver hover:text-white"
              }`}
            >
              <Rows2 className="h-4 w-4" />
              <span className="sr-only">{t("shop.view_mode_lazy")}</span>
            </button>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {viewMode === "pagination" ? (
            <motion.div
              key="pagination"
              className="space-y-8"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.3 }}
              layout
            >
              <CocktailGrid cocktails={cocktails} />

              {totalPages > 1 && (
                <div className="flex flex-wrap items-center justify-center gap-6">
                  <button
                    type="button"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1 || loading}
                    title={t("shop.prev_page")}
                    aria-label={t("shop.prev_page")}
                    className="flex h-11 w-11 items-center justify-center rounded-full border border-cosmic-gold text-cosmic-gold hover:bg-cosmic-gold hover:text-black transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <span className="text-sm text-cosmic-silver">
                    {t("shop.pagination_status", {
                      current: currentPage,
                      total: totalPages,
                    })}
                  </span>
                  <button
                    type="button"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages || loading}
                    title={t("shop.next_page")}
                    aria-label={t("shop.next_page")}
                    className="flex h-11 w-11 items-center justify-center rounded-full border border-cosmic-gold text-cosmic-gold hover:bg-cosmic-gold hover:text-black transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="lazy"
              className="space-y-10"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.3 }}
              layout
            >
              {/* Sección Principal - Todos los Cócteles */}
              <CocktailRow
                title={t("shop.all_cocktails")}
                cocktails={cocktails}
                showTitle={false}
              />

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

              {hasMore && (
                <div className="flex flex-col items-center gap-2">
                  <button
                    type="button"
                    onClick={handleLoadMore}
                    disabled={loadingMore}
                    title={t("shop.load_more")}
                    aria-label={t("shop.load_more")}
                    className="flex h-12 w-12 items-center justify-center rounded-full border border-cosmic-gold text-cosmic-gold hover:bg-cosmic-gold hover:text-black transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {loadingMore ? (
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    ) : (
                      <ChevronsDown className="h-5 w-5" />
                    )}
                  </button>
                  <span className="text-xs uppercase tracking-[0.2em] text-cosmic-silver">
                    {loadingMore ? t("shop.loading_more") : t("shop.load_more")}
                  </span>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.section>
  );
}
