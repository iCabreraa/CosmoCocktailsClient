"use client";

import { createClient } from "@/lib/supabase/client";
import { useEffect, useMemo, useRef, useState } from "react";
import type { KeyboardEvent } from "react";
import { CocktailWithPrice } from "@/types";
import dynamic from "next/dynamic";
import { useLanguage } from "@/contexts/LanguageContext";
import ShopLoadingState from "./components/ShopLoadingState";
import CocktailGrid from "./components/CocktailGrid";
import { mapCocktailsWithPrices } from "./utils";
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

type ShopClientProps = {
  initialCocktails: CocktailWithPrice[];
  initialTotalCount: number;
  initialHasMore: boolean;
};

export default function ShopClient({
  initialCocktails,
  initialTotalCount,
  initialHasMore,
}: ShopClientProps) {
  const { t } = useLanguage();
  const [cocktails, setCocktails] =
    useState<CocktailWithPrice[]>(initialCocktails);
  const [loading, setLoading] = useState(initialCocktails.length === 0);
  const [loadingMore, setLoadingMore] = useState(false);
  const [softLoading, setSoftLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(initialTotalCount);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"lazy" | "pagination">(
    "pagination"
  );
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [showFavorites, setShowFavorites] = useState(false);
  const supabase = useMemo(() => createClient(), []);
  const hasMountedRef = useRef(false);

  const PAGE_SIZE = 12;

  useEffect(() => {
    let isMounted = true;

    const loadSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (!isMounted) return;
      setShowFavorites(Boolean(data.session?.user));
    };

    loadSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!isMounted) return;
      setShowFavorites(Boolean(session?.user));
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  async function fetchCocktailsPage(
    page: number,
    append: boolean,
    query = searchQuery,
    options: {
      silent?: boolean;
      withCount?: boolean;
      reason?: "search" | "view";
    } = {}
  ) {
    try {
      if (append) {
        setLoadingMore(true);
      } else {
        setError(null);
        if (options.silent) {
          if (options.reason === "search") {
            setSearching(true);
          } else {
            setSoftLoading(true);
          }
        } else {
          setLoading(true);
        }
      }
      const trimmedQuery = query.trim();
      const shouldCount =
        options.withCount ?? (!append && viewMode === "pagination");
      let queryBuilder = supabase.from("cocktails").select(
        `
          id,
          name,
          description,
          image_url,
          is_available,
          alcohol_percentage,
          has_non_alcoholic_version,
          cocktail_sizes (
            id,
            price,
            sizes_id,
            available,
            sizes (
              id,
              name,
              volume_ml
            )
          )
        `,
        { count: shouldCount ? "exact" : undefined }
      );

      if (trimmedQuery) {
        queryBuilder = queryBuilder.ilike("name", `%${trimmedQuery}%`);
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
        has_non_alcoholic_version: boolean | null;
        cocktail_sizes: Array<{
          id: string;
          price: number;
          sizes_id: string | null;
          available: boolean | null;
          sizes: {
            id: string;
            name: string | null;
            volume_ml: number | null;
          } | null;
        }> | null;
      }>;

      if (typedCocktails.length === 0) {
        if (!append) {
          setCocktails([]);
        }
        setHasMore(false);
        return;
      }
      const cocktailsWithPrices = mapCocktailsWithPrices(typedCocktails);

      if (append) {
        let nextLength = 0;
        setCocktails(prev => {
          const next = [...prev];
          const existingIds = new Set(prev.map(item => item.id));
          cocktailsWithPrices.forEach(item => {
            if (!existingIds.has(item.id)) {
              next.push(item);
            }
          });
          nextLength = next.length;
          return next;
        });
        if (typeof count === "number") {
          setHasMore(nextLength < count);
        } else {
          setHasMore(cocktailsWithPrices.length === PAGE_SIZE);
        }
      } else {
        setCocktails(cocktailsWithPrices);
        if (typeof count === "number") {
          setHasMore(cocktailsWithPrices.length < count);
        } else {
          setHasMore(cocktailsWithPrices.length === PAGE_SIZE);
        }
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
      setSoftLoading(false);
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
    if (!hasMountedRef.current) {
      hasMountedRef.current = true;
      if (initialCocktails.length === 0) {
        fetchCocktailsPage(1, false, searchQuery, { withCount: true });
      }
      return;
    }

    setCurrentPage(1);
    setTotalCount(0);
    fetchCocktailsPage(1, false, searchQuery, {
      silent: true,
      withCount: true,
      reason: "search",
    });
  }, [searchQuery]);

  const handleRetry = () => {
    setCurrentPage(1);
    setCocktails([]);
    fetchCocktailsPage(1, false, searchQuery, { withCount: true });
  };

  const handleViewModeChange = (mode: "lazy" | "pagination") => {
    if (mode === viewMode) return;
    setViewMode(mode);
    setCurrentPage(1);
    fetchCocktailsPage(1, false, searchQuery, {
      silent: true,
      withCount: mode === "pagination",
      reason: "view",
    });
  };

  const handleLoadMore = () => {
    if (loadingMore) return;
    const nextPage = currentPage + 1;
    setCurrentPage(nextPage);
    fetchCocktailsPage(nextPage, true, searchQuery);
  };

  const handlePageChange = (page: number) => {
    if (page === currentPage || loading) return;
    setCurrentPage(page);
    fetchCocktailsPage(page, false, searchQuery, { withCount: false });
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

  const normalizedSearch = searchQuery.trim();
  const hasSearch = normalizedSearch.length > 0;
  const showFullLoader = loading && cocktails.length === 0;
  const showSoftLoader = (loading || softLoading) && cocktails.length > 0;

  if (showFullLoader) {
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
            {hasSearch ? t("shop.search_empty_title") : t("shop.empty_title")}
          </h1>
          <p className="text-cosmic-silver">
            {hasSearch
              ? t("shop.search_empty_description", {
                  query: normalizedSearch,
                })
              : t("shop.empty_description")}
          </p>
          {hasSearch && (
            <p className="text-sm text-cosmic-silver">
              {t("shop.search_empty_hint")}
            </p>
          )}
          <button
            onClick={hasSearch ? handleSearchClear : handleRetry}
            className="inline-flex items-center justify-center px-5 py-2 rounded-full border border-cosmic-gold text-cosmic-gold hover:bg-cosmic-gold hover:text-black transition-colors"
          >
            {hasSearch ? t("shop.clear_search") : t("common.retry")}
          </button>
        </div>
      </motion.section>
    );
  }

  const totalPages =
    totalCount > 0 ? Math.ceil(totalCount / PAGE_SIZE) : 1;

  // Agrupar cócteles por categorías
  const nonAlcoholicCocktails = useMemo(
    () => cocktails.filter(c => c.alcohol_percentage === 0),
    [cocktails]
  );
  const strongCocktails = useMemo(
    () => cocktails.filter(c => c.alcohol_percentage >= 18),
    [cocktails]
  );
  const lightCocktails = useMemo(
    () =>
      cocktails.filter(
        c => c.alcohol_percentage > 0 && c.alcohol_percentage <= 14
      ),
    [cocktails]
  );
  const tropicalCocktails = useMemo(
    () =>
      cocktails.filter(
        c =>
          c.name.toLowerCase().includes("tropical") ||
          c.name.toLowerCase().includes("tiki") ||
          c.name.toLowerCase().includes("pina") ||
          c.name.toLowerCase().includes("coconut")
      ),
    [cocktails]
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

        {showSoftLoader && (
          <div className="flex items-center justify-center gap-2 text-xs uppercase tracking-[0.2em] text-cosmic-silver">
            <span className="h-2 w-2 animate-pulse rounded-full bg-cosmic-gold/80" />
            <span>{t("shop.loading")}</span>
          </div>
        )}

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
              <CocktailGrid cocktails={cocktails} showFavorites={showFavorites} />

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
              {hasSearch ? (
                <CocktailGrid cocktails={cocktails} showFavorites={showFavorites} />
              ) : (
                <>
                  {/* Sección Principal - Todos los Cócteles */}
                  <CocktailRow
                    title={t("shop.all_cocktails")}
                    cocktails={cocktails}
                    showTitle={false}
                    showFavorites={showFavorites}
                  />

                  {/* Secciones Agrupadas - Solo mostrar si hay cócteles */}
                  {nonAlcoholicCocktails.length > 0 && (
                    <CocktailRow
                      title={t("shop.non_alcoholic")}
                      cocktails={nonAlcoholicCocktails}
                      showFavorites={showFavorites}
                    />
                  )}

                  {strongCocktails.length > 0 && (
                    <CocktailRow
                      title={t("shop.strong_drinks")}
                      cocktails={strongCocktails}
                      showFavorites={showFavorites}
                    />
                  )}

                  {lightCocktails.length > 0 && (
                    <CocktailRow
                      title={t("shop.light_fresh")}
                      cocktails={lightCocktails}
                      showFavorites={showFavorites}
                    />
                  )}

                  {tropicalCocktails.length > 0 && (
                    <CocktailRow
                      title={t("shop.tropical")}
                      cocktails={tropicalCocktails}
                      showFavorites={showFavorites}
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
