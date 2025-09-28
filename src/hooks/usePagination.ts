import { useState, useMemo, useCallback } from "react";

export interface PaginationState {
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
  totalPages: number;
}

export interface PaginationControls {
  goToPage: (page: number) => void;
  nextPage: () => void;
  prevPage: () => void;
  goToFirst: () => void;
  goToLast: () => void;
  setItemsPerPage: (items: number) => void;
}

export interface UsePaginationOptions {
  initialPage?: number;
  initialItemsPerPage?: number;
  itemsPerPage?: number;
  maxVisiblePages?: number;
}

export interface UsePaginationReturn
  extends PaginationState,
    PaginationControls {
  visiblePages: number[];
  hasNextPage: boolean;
  hasPrevPage: boolean;
  startIndex: number;
  endIndex: number;
  isFirstPage: boolean;
  isLastPage: boolean;
}

/**
 * Hook personalizado para manejar paginación de manera eficiente
 * Incluye controles avanzados y cálculos optimizados
 */
export function usePagination<T>(
  items: T[],
  options: UsePaginationOptions = {}
): UsePaginationReturn {
  const {
    initialPage = 1,
    initialItemsPerPage = 12,
    itemsPerPage: propItemsPerPage,
    maxVisiblePages = 5,
  } = options;

  const [currentPage, setCurrentPage] = useState(initialPage);
  const [itemsPerPage, setItemsPerPage] = useState(
    propItemsPerPage || initialItemsPerPage
  );

  // Cálculos derivados
  const totalItems = items.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);

  // Estados booleanos
  const hasNextPage = currentPage < totalPages;
  const hasPrevPage = currentPage > 1;
  const isFirstPage = currentPage === 1;
  const isLastPage = currentPage === totalPages;

  // Páginas visibles para la UI
  const visiblePages = useMemo(() => {
    if (totalPages <= maxVisiblePages) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const half = Math.floor(maxVisiblePages / 2);
    let start = Math.max(1, currentPage - half);
    let end = Math.min(totalPages, start + maxVisiblePages - 1);

    // Ajustar si estamos cerca del final
    if (end - start + 1 < maxVisiblePages) {
      start = Math.max(1, end - maxVisiblePages + 1);
    }

    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }, [currentPage, totalPages, maxVisiblePages]);

  // Controles de navegación
  const goToPage = useCallback(
    (page: number) => {
      const validPage = Math.max(1, Math.min(page, totalPages));
      setCurrentPage(validPage);
    },
    [totalPages]
  );

  const nextPage = useCallback(() => {
    if (hasNextPage) {
      setCurrentPage(prev => prev + 1);
    }
  }, [hasNextPage]);

  const prevPage = useCallback(() => {
    if (hasPrevPage) {
      setCurrentPage(prev => prev - 1);
    }
  }, [hasPrevPage]);

  const goToFirst = useCallback(() => {
    setCurrentPage(1);
  }, []);

  const goToLast = useCallback(() => {
    setCurrentPage(totalPages);
  }, [totalPages]);

  const handleSetItemsPerPage = useCallback((items: number) => {
    setItemsPerPage(items);
    setCurrentPage(1); // Reset to first page when changing items per page
  }, []);

  // Reset current page when items change
  useMemo(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  return {
    // Estado
    currentPage,
    itemsPerPage,
    totalItems,
    totalPages,
    startIndex,
    endIndex,

    // Estados booleanos
    hasNextPage,
    hasPrevPage,
    isFirstPage,
    isLastPage,

    // Páginas visibles
    visiblePages,

    // Controles
    goToPage,
    nextPage,
    prevPage,
    goToFirst,
    goToLast,
    setItemsPerPage: handleSetItemsPerPage,
  };
}

/**
 * Hook para paginación con datos asíncronos
 * Útil para paginación del lado del servidor
 */
export function useAsyncPagination<T>(
  fetchData: (
    page: number,
    itemsPerPage: number
  ) => Promise<{
    data: T[];
    totalItems: number;
  }>,
  options: UsePaginationOptions = {}
) {
  const [data, setData] = useState<T[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const pagination = usePagination(data, {
    ...options,
    initialItemsPerPage: options.initialItemsPerPage || 12,
  });

  const loadPage = useCallback(
    async (page: number, itemsPerPage: number) => {
      setLoading(true);
      setError(null);

      try {
        const result = await fetchData(page, itemsPerPage);
        setData(result.data);
        setTotalItems(result.totalItems);
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Error loading data"));
      } finally {
        setLoading(false);
      }
    },
    [fetchData]
  );

  // Cargar página inicial
  useMemo(() => {
    loadPage(pagination.currentPage, pagination.itemsPerPage);
  }, [pagination.currentPage, pagination.itemsPerPage, loadPage]);

  return {
    ...pagination,
    data,
    totalItems,
    loading,
    error,
    refetch: () => loadPage(pagination.currentPage, pagination.itemsPerPage),
  };
}
