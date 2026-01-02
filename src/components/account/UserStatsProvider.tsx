"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { User } from "@/types/user-system";
import { useFavorites } from "@/hooks/queries/useFavorites";
import { getQueryConfig } from "@/lib/query-client";

interface UserStats {
  totalOrders: number;
  totalSpent: number;
  favoriteCocktails: number;
  recentOrders: any[];
}

interface UserStatsProviderProps {
  user: User;
  children: (
    stats: UserStats & {
      loading: boolean;
      error: string;
      refresh: () => void;
    }
  ) => React.ReactNode;
}

export default function UserStatsProvider({
  user,
  children,
}: UserStatsProviderProps) {
  const ordersQuery = useQuery<{
    orders?: any[];
    meta?: Record<string, any>;
  }>({
    queryKey: ["account-stats", user.id, "orders-summary"],
    queryFn: async () => {
      const response = await fetch("/api/orders?summary=1&limit=3");
      if (response.status === 401) {
        const error = new Error("Unauthorized");
        (error as { status?: number }).status = 401;
        throw error;
      }
      if (!response.ok) {
        let message = "Error al cargar pedidos";
        try {
          const payload = await response.json();
          if (payload?.error) message = payload.error;
        } catch {
          // ignore parsing errors
        }
        throw new Error(message);
      }
      return response.json();
    },
    enabled: Boolean(user?.id),
    refetchOnWindowFocus: false,
    ...getQueryConfig("orders"),
  });

  const { favoritesQuery } = useFavorites({
    enabled: Boolean(user?.id),
    mode: "ids",
    userId: user.id,
  });

  const orders = ordersQuery.data?.orders ?? [];
  const ordersMeta = ordersQuery.data?.meta ?? {};
  const favorites = Array.isArray(favoritesQuery.data)
    ? favoritesQuery.data
    : [];

  const stats = useMemo(() => {
    const totalOrders =
      typeof ordersMeta.total_orders === "number"
        ? ordersMeta.total_orders
        : orders.length;
    const totalSpent =
      typeof ordersMeta.total_spent === "number"
        ? ordersMeta.total_spent
        : orders.reduce(
            (sum: number, order: any) =>
              sum + Number(order.total_amount ?? 0),
            0
          );
    const favoriteCocktails = favorites.length;
    const recentOrders = orders.slice(0, 3);
    return {
      totalOrders,
      totalSpent,
      favoriteCocktails,
      recentOrders,
    };
  }, [ordersMeta, orders, favorites.length]);

  const error =
    ordersQuery.error instanceof Error
      ? ordersQuery.error.message
      : favoritesQuery.error instanceof Error
        ? favoritesQuery.error.message
        : "";
  const loading = ordersQuery.isLoading || favoritesQuery.isLoading;
  const refresh = () => {
    void ordersQuery.refetch();
    void favoritesQuery.refetch();
  };

  return <>{children({ ...stats, loading, error, refresh })}</>;
}
