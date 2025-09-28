import { useState, useMemo, useCallback, useEffect } from "react";
import { usePagination } from "./usePagination";
import { CocktailWithPrice } from "@/types";

export interface CocktailFilters {
  search: string;
  category: string;
  alcoholLevel: "all" | "non-alcoholic" | "light" | "strong";
  priceRange: [number, number];
  tags: string[];
}

export interface CocktailSortOptions {
  field: "name" | "price" | "alcohol_percentage" | "created_at";
  direction: "asc" | "desc";
}

export interface UseCocktailPaginationOptions {
  initialPage?: number;
  itemsPerPage?: number;
  initialFilters?: Partial<CocktailFilters>;
  initialSort?: CocktailSortOptions;
  debounceMs?: number;
}

export interface UseCocktailPaginationReturn {
  // Datos paginados
  paginatedCocktails: CocktailWithPrice[];

  // Estado de paginación
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;

  // Filtros y búsqueda
  filters: CocktailFilters;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  setFilters: (filters: Partial<CocktailFilters>) => void;
  clearFilters: () => void;

  // Ordenamiento
  sortOptions: CocktailSortOptions;
  setSortOptions: (sort: CocktailSortOptions) => void;

  // Controles de paginación
  goToPage: (page: number) => void;
  nextPage: () => void;
  prevPage: () => void;
  goToFirst: () => void;
  goToLast: () => void;
  setItemsPerPage: (items: number) => void;

  // Estados
  loading: boolean;
  hasResults: boolean;
  hasFilters: boolean;

  // Estadísticas
  stats: {
    totalCocktails: number;
    filteredCocktails: number;
    nonAlcoholicCount: number;
    strongDrinksCount: number;
    averagePrice: number;
  };
}

const DEFAULT_FILTERS: CocktailFilters = {
  search: "",
  category: "all",
  alcoholLevel: "all",
  priceRange: [0, 100],
  tags: [],
};

const DEFAULT_SORT: CocktailSortOptions = {
  field: "name",
  direction: "asc",
};

/**
 * Hook especializado para paginación de cócteles con filtros avanzados
 * Incluye búsqueda, filtros por categoría, nivel de alcohol, precio y tags
 */
export function useCocktailPagination(
  cocktails: CocktailWithPrice[],
  options: UseCocktailPaginationOptions = {}
): UseCocktailPaginationReturn {
  const {
    initialPage = 1,
    itemsPerPage = 12,
    initialFilters = {},
    initialSort = DEFAULT_SORT,
    debounceMs = 300,
  } = options;

  // Estado de filtros
  const [filters, setFiltersState] = useState<CocktailFilters>({
    ...DEFAULT_FILTERS,
    ...initialFilters,
  });

  // Estado de búsqueda con debounce
  const [searchQuery, setSearchQueryState] = useState(filters.search);
  const [debouncedSearch, setDebouncedSearch] = useState(filters.search);

  // Estado de ordenamiento
  const [sortOptions, setSortOptions] =
    useState<CocktailSortOptions>(initialSort);

  // Estado de carga
  const [loading, setLoading] = useState(false);

  // Debounce para búsqueda
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [searchQuery, debounceMs]);

  // Actualizar filtros cuando cambia la búsqueda
  useEffect(() => {
    setFiltersState(prev => ({
      ...prev,
      search: debouncedSearch,
    }));
  }, [debouncedSearch]);

  // Filtrar y ordenar cócteles
  const filteredAndSortedCocktails = useMemo(() => {
    setLoading(true);

    let filtered = [...cocktails];

    // Filtro por búsqueda
    if (filters.search.trim()) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(
        cocktail =>
          cocktail.name.toLowerCase().includes(searchLower) ||
          cocktail.description?.toLowerCase().includes(searchLower) ||
          cocktail.tags?.some(tag => tag.toLowerCase().includes(searchLower))
      );
    }

    // Filtro por categoría
    if (filters.category !== "all") {
      filtered = filtered.filter(cocktail => {
        switch (filters.category) {
          case "featured":
            return cocktail.tags?.includes("featured");
          case "tropical":
            return (
              cocktail.name.toLowerCase().includes("tiki") ||
              cocktail.tags?.some(tag => tag.toLowerCase().includes("tropical"))
            );
          case "classic":
            return cocktail.tags?.includes("classic");
          default:
            return true;
        }
      });
    }

    // Filtro por nivel de alcohol
    if (filters.alcoholLevel !== "all") {
      filtered = filtered.filter(cocktail => {
        switch (filters.alcoholLevel) {
          case "non-alcoholic":
            return cocktail.alcohol_percentage === 0;
          case "light":
            return (
              cocktail.alcohol_percentage > 0 &&
              cocktail.alcohol_percentage <= 14
            );
          case "strong":
            return cocktail.alcohol_percentage >= 18;
          default:
            return true;
        }
      });
    }

    // Filtro por rango de precio
    if (filters.priceRange[0] > 0 || filters.priceRange[1] < 100) {
      filtered = filtered.filter(cocktail => {
        if (!cocktail.min_price) return false;
        return (
          cocktail.min_price >= filters.priceRange[0] &&
          cocktail.min_price <= filters.priceRange[1]
        );
      });
    }

    // Filtro por tags
    if (filters.tags.length > 0) {
      filtered = filtered.filter(cocktail =>
        cocktail.tags?.some(tag => filters.tags.includes(tag))
      );
    }

    // Ordenamiento
    filtered.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortOptions.field) {
        case "name":
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case "price":
          aValue = a.min_price || 0;
          bValue = b.min_price || 0;
          break;
        case "alcohol_percentage":
          aValue = a.alcohol_percentage || 0;
          bValue = b.alcohol_percentage || 0;
          break;
        case "created_at":
          aValue = new Date(a.created_at || 0).getTime();
          bValue = new Date(b.created_at || 0).getTime();
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortOptions.direction === "asc" ? -1 : 1;
      if (aValue > bValue) return sortOptions.direction === "asc" ? 1 : -1;
      return 0;
    });

    setLoading(false);
    return filtered;
  }, [cocktails, filters, sortOptions]);

  // Paginación
  const pagination = usePagination(filteredAndSortedCocktails, {
    initialPage,
    itemsPerPage,
  });

  // Controles de filtros
  const setFilters = useCallback((newFilters: Partial<CocktailFilters>) => {
    setFiltersState(prev => ({
      ...prev,
      ...newFilters,
    }));
  }, []);

  const clearFilters = useCallback(() => {
    setFiltersState(DEFAULT_FILTERS);
    setSearchQueryState("");
  }, []);

  const setSearchQuery = useCallback((query: string) => {
    setSearchQueryState(query);
  }, []);

  // Estadísticas
  const stats = useMemo(() => {
    const totalCocktails = cocktails.length;
    const filteredCocktails = filteredAndSortedCocktails.length;
    const nonAlcoholicCount = cocktails.filter(
      c => c.alcohol_percentage === 0
    ).length;
    const strongDrinksCount = cocktails.filter(
      c => c.alcohol_percentage >= 18
    ).length;
    const prices = cocktails.filter(c => c.min_price).map(c => c.min_price!);
    const averagePrice =
      prices.length > 0
        ? prices.reduce((sum, price) => sum + price, 0) / prices.length
        : 0;

    return {
      totalCocktails,
      filteredCocktails,
      nonAlcoholicCount,
      strongDrinksCount,
      averagePrice: Math.round(averagePrice * 100) / 100,
    };
  }, [cocktails, filteredAndSortedCocktails]);

  // Estados derivados
  const hasResults = filteredAndSortedCocktails.length > 0;
  const hasFilters = Object.values(filters).some(value =>
    Array.isArray(value)
      ? value.length > 0
      : value !== "" && value !== "all" && value !== 0
  );

  return {
    // Datos paginados
    paginatedCocktails: filteredAndSortedCocktails.slice(
      pagination.startIndex,
      pagination.endIndex
    ),

    // Estado de paginación
    currentPage: pagination.currentPage,
    totalPages: pagination.totalPages,
    totalItems: pagination.totalItems,
    itemsPerPage: pagination.itemsPerPage,

    // Filtros y búsqueda
    filters,
    searchQuery,
    setSearchQuery,
    setFilters,
    clearFilters,

    // Ordenamiento
    sortOptions,
    setSortOptions,

    // Controles de paginación
    goToPage: pagination.goToPage,
    nextPage: pagination.nextPage,
    prevPage: pagination.prevPage,
    goToFirst: pagination.goToFirst,
    goToLast: pagination.goToLast,
    setItemsPerPage: pagination.setItemsPerPage,

    // Estados
    loading,
    hasResults,
    hasFilters,

    // Estadísticas
    stats,
  };
}
