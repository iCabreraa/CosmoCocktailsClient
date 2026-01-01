"use client";

import { useState, useEffect } from "react";
import { User } from "@/types/user-system";

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
  const [stats, setStats] = useState<UserStats>({
    totalOrders: 0,
    totalSpent: 0,
    favoriteCocktails: 0,
    recentOrders: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchUserStats = async () => {
    try {
      setLoading(true);
      setError("");

      const [ordersResponse, favoritesResponse] = await Promise.all([
        fetch("/api/orders?summary=1&limit=3"),
        fetch("/api/favorites?mode=ids"),
      ]);

      if (!ordersResponse.ok) throw new Error("Error al cargar pedidos");
      const ordersData = await ordersResponse.json();
      const orders = ordersData.orders || [];
      const ordersMeta = ordersData.meta || {};

      const favoritesData = favoritesResponse.ok
        ? await favoritesResponse.json()
        : { favorites: [] };
      const favorites = favoritesData.favorites || [];

      // Calculate stats
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
      const recentOrders = orders.slice(0, 5);

      setStats({
        totalOrders,
        totalSpent,
        favoriteCocktails,
        recentOrders,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
      console.error("Error fetching user stats:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserStats();
  }, [user.id]);

  return <>{children({ ...stats, loading, error, refresh: fetchUserStats })}</>;
}
