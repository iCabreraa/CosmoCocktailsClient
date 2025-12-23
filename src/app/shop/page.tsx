"use client";

import { createClient } from "@/lib/supabase/client";
import { useEffect, useRef, useState } from "react";
import type { KeyboardEvent } from "react";
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
  Search,
  X,
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
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategories, setActiveCategories] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<"lazy" | "pagination">(
    "pagination"
  );
  const supabase = createClient();
  const hasFetchedRef = useRef(false);

  const PAGE_SIZE = 12;
  const categoryFilters = [
    { id: "classic", label: t("shop.filter_classic") },
    { id: "tropical", label: t("shop.filter_tropical") },
  ];
  const typeFilters = [
    { id: "non-alcoholic", label: t("shop.filter_non_alcoholic") },
  ];

  async function fetchCocktailsPage(
    page: number,
    append: boolean,
    options: {
      query?: string;
      categories?: string[];
      silent?: boolean;
    } = {}
  ) {
    const query = options.query ?? searchQuery;
    const categories = options.categories ?? activeCategories;
    try {
      if (append) {
        setLoadingMore(true);
      } else {
        setError(null);
        if (options.silent) {
          setSearching(true);
        } else {
          setLoading(true);
        }
      }
      // Intentar conectar con Supabase primero
      const trimmedQuery = query.trim();
      let queryBuilder = supabase.from("cocktails").select(
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
      );

      if (trimmedQuery) {
        queryBuilder = queryBuilder.ilike("name", `%${trimmedQuery}%`);
      }

      if (categories.length > 0) {
        const orFilters: string[] = [];
        const keywordFilters = {
          classic: ["classic", "martini", "negroni", "margarita"],
          tropical: ["tropical", "tiki", "pina", "coconut", "colada"],
        } satisfies Record<string, string[]>;

        if (categories.includes("classic")) {
          keywordFilters.classic.forEach(keyword => {
            orFilters.push(`name.ilike.%${keyword}%`);
            orFilters.push(`description.ilike.%${keyword}%`);
          });
        }

        if (categories.includes("tropical")) {
          keywordFilters.tropical.forEach(keyword => {
            orFilters.push(`name.ilike.%${keyword}%`);
            orFilters.push(`description.ilike.%${keyword}%`);
          });
        }

        if (categories.includes("non-alcoholic")) {
          orFilters.push("alcohol_percentage.eq.0");
          orFilters.push("has_non_alcoholic_version.eq.true");
        }

        if (orFilters.length > 0) {
          queryBuilder = queryBuilder.or(orFilters.join(","));
        }
      }

      const { data: cocktailRows, error, count } = await queryBuilder
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
      setSearching(false);
    }
  }

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setSearchQuery(searchInput.trim());
    }, 300);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [searchInput]);

  useEffect(() => {
    if (!hasFetchedRef.current) {
      hasFetchedRef.current = true;
      fetchCocktailsPage(1, false, { query: searchQuery });
      return;
    }

    setCurrentPage(1);
    setTotalCount(0);
    fetchCocktailsPage(1, false, {
      query: searchQuery,
      categories: activeCategories,
      silent: true,
    });
  }, [searchQuery, activeCategories]);

  const handleRetry = () => {
    setCurrentPage(1);
    setCocktails([]);
    fetchCocktailsPage(1, false, {
      query: searchQuery,
      categories: activeCategories,
    });
  };

  const handleViewModeChange = (mode: "lazy" | "pagination") => {
    if (mode === viewMode) return;
    setViewMode(mode);
    setCurrentPage(1);
    setCocktails([]);
    fetchCocktailsPage(1, false, {
      query: searchQuery,
      categories: activeCategories,
    });
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
    fetchCocktailsPage(page, false, {
      query: searchQuery,
      categories: activeCategories,
    });
  };

  const handleSearchClear = () => {
    setSearchInput("");
    setSearchQuery("");
  };

  const handleSearchKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      setSearchQuery(searchInput.trim());
    }
    if (event.key === "Escape") {
      event.preventDefault();
      handleSearchClear();
    }
  };

  const handleCategoryToggle = (category: string) => {
    setActiveCategories(prev =>
      prev.includes(category)
        ? prev.filter(item => item !== category)
        : [...prev, category]
    );
  };

  const handleClearFilters = () => {
    setActiveCategories([]);
  };

  const handleClearAll = () => {
    setActiveCategories([]);
    setSearchInput("");
    setSearchQuery("");
  };

  const normalizedSearch = searchQuery.trim();
  const hasSearch = normalizedSearch.length > 0;
  const hasCategoryFilters = activeCategories.length > 0;
  const hasActiveFilters = hasSearch || hasCategoryFilters;

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
            {hasSearch
              ? t("shop.search_empty_title")
              : hasCategoryFilters
                ? t("shop.filter_empty_title")
                : t("shop.empty_title")}
          </h1>
          <p className="text-cosmic-silver">
            {hasSearch
              ? t("shop.search_empty_description", {
                  query: normalizedSearch,
                })
              : hasCategoryFilters
                ? t("shop.filter_empty_description")
                : t("shop.empty_description")}
          </p>
          {hasSearch && (
            <p className="text-sm text-cosmic-silver">
              {t("shop.search_empty_hint")}
            </p>
          )}
          <button
            onClick={hasActiveFilters ? handleClearAll : handleRetry}
            className="inline-flex items-center justify-center px-5 py-2 rounded-full border border-cosmic-gold text-cosmic-gold hover:bg-cosmic-gold hover:text-black transition-colors"
          >
            {hasActiveFilters ? t("shop.clear_filters") : t("common.retry")}
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

        <div className="flex flex-col items-center gap-4 text-sm text-cosmic-silver">
          <h2 className="text-2xl md:text-3xl font-[--font-unica] text-cosmic-gold">
            {t("shop.all_cocktails")}
          </h2>
          <div className="flex w-full flex-col items-center gap-4">
            <div className="relative w-full max-w-xl">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-cosmic-silver" />
              <input
                type="text"
                value={searchInput}
                onChange={event => setSearchInput(event.target.value)}
                onKeyDown={handleSearchKeyDown}
                placeholder={t("shop.search_placeholder")}
                aria-label={t("shop.search_label")}
                className="w-full rounded-full border border-cosmic-gold/20 bg-white/5 py-3 pl-11 pr-12 text-sm text-cosmic-silver placeholder:text-cosmic-silver/60 transition focus:border-cosmic-gold focus:outline-none focus:ring-2 focus:ring-cosmic-gold/20"
              />
              <div className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center gap-2">
                {searching && (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-cosmic-gold border-t-transparent" />
                )}
                {searchInput.length > 0 && (
                  <button
                    type="button"
                    onClick={handleSearchClear}
                    aria-label={t("shop.clear_search")}
                    title={t("shop.clear_search")}
                    className="flex h-7 w-7 items-center justify-center rounded-full border border-cosmic-gold/20 text-cosmic-silver transition hover:border-cosmic-gold hover:text-white"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2 text-[11px] uppercase tracking-[0.18em] text-cosmic-silver/70">
              <span className="mr-2 text-[10px] text-cosmic-silver/50">
                {t("shop.filter_category")}
              </span>
              {categoryFilters.map(filter => {
                const isActive = activeCategories.includes(filter.id);
                return (
                  <button
                    key={filter.id}
                    type="button"
                    onClick={() => handleCategoryToggle(filter.id)}
                    className={`rounded-full border px-3 py-1 transition ${
                      isActive
                        ? "border-cosmic-gold bg-cosmic-gold/20 text-white"
                        : "border-cosmic-gold/20 text-cosmic-silver hover:border-cosmic-gold hover:text-white"
                    }`}
                  >
                    {filter.label}
                  </button>
                );
              })}

              <span className="mx-2 text-[10px] text-cosmic-silver/50">
                {t("shop.filter_type")}
              </span>
              {typeFilters.map(filter => {
                const isActive = activeCategories.includes(filter.id);
                return (
                  <button
                    key={filter.id}
                    type="button"
                    onClick={() => handleCategoryToggle(filter.id)}
                    className={`rounded-full border px-3 py-1 transition ${
                      isActive
                        ? "border-cosmic-gold bg-cosmic-gold/20 text-white"
                        : "border-cosmic-gold/20 text-cosmic-silver hover:border-cosmic-gold hover:text-white"
                    }`}
                  >
                    {filter.label}
                  </button>
                );
              })}

              {hasCategoryFilters && (
                <button
                  type="button"
                  onClick={handleClearFilters}
                  className="rounded-full border border-cosmic-gold/20 px-3 py-1 text-[10px] text-cosmic-silver transition hover:border-cosmic-gold hover:text-white"
                >
                  {t("shop.clear_filters")}
                </button>
              )}
            </div>

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
              {hasActiveFilters ? (
                <CocktailGrid cocktails={cocktails} />
              ) : (
                <>
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
                </>
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
