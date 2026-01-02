"use client";

import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  buildOrdersQueryKey,
  fetchOrders,
} from "@/hooks/queries/useOrders";
import {
  buildFavoritesQueryKey,
  fetchFavorites,
} from "@/hooks/queries/useFavorites";
import { getQueryConfig } from "@/lib/query-client";

export function useAccountPrefetch(userId: string | null) {
  const queryClient = useQueryClient();
  const prefetchedFor = useRef<string | null>(null);

  useEffect(() => {
    if (!userId) return;
    if (prefetchedFor.current === userId) return;
    prefetchedFor.current = userId;

    const ordersOptions = {
      userId,
      summary: true,
      includeItems: false,
      page: 1,
      pageSize: 5,
    };

    void queryClient.prefetchQuery({
      queryKey: buildOrdersQueryKey(ordersOptions),
      queryFn: () => fetchOrders(ordersOptions),
      ...getQueryConfig("orders"),
    });

    const favoritesOptions = {
      userId,
      mode: "details" as const,
      page: 1,
      pageSize: 5,
    };

    void queryClient.prefetchQuery({
      queryKey: buildFavoritesQueryKey(favoritesOptions),
      queryFn: () => fetchFavorites(favoritesOptions),
      staleTime: 5 * 60 * 1000,
      gcTime: 30 * 60 * 1000,
    });
  }, [queryClient, userId]);
}
