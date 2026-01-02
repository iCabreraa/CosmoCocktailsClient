"use client";

import { useMemo } from "react";
import { User } from "@/types/user-system";
import { useFavorites } from "@/hooks/queries/useFavorites";
import { useOrders } from "@/hooks/queries/useOrders";

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
  const ordersQuery = useOrders({
    enabled: Boolean(user?.id),
    userId: user.id,
    summary: true,
    includeItems: false,
    limit: 3,
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
