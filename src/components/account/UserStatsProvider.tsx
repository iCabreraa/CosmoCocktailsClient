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
    stats: UserStats & { loading: boolean; error: string }
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

  useEffect(() => {
    fetchUserStats();
  }, [user.id]);

  const fetchUserStats = async () => {
    try {
      setLoading(true);
      setError("");

      // Fetch orders
      const ordersResponse = await fetch(`/api/orders?user_id=${user.id}`);
      if (!ordersResponse.ok) throw new Error("Error al cargar pedidos");
      const ordersData = await ordersResponse.json();
      const orders = ordersData.orders || [];

      // Fetch favorites
      const favoritesResponse = await fetch(
        `/api/favorites?user_id=${user.id}`
      );
      const favoritesData = favoritesResponse.ok
        ? await favoritesResponse.json()
        : { favorites: [] };
      const favorites = favoritesData.favorites || [];

      // Calculate stats
      const totalOrders = orders.length;
      const totalSpent = orders.reduce(
        (sum: number, order: any) => sum + Number(order.total_amount),
        0
      );
      const favoriteCocktails = favorites.length;
      const recentOrders = orders
        .sort(
          (a: any, b: any) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )
        .slice(0, 5);

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

  return <>{children({ ...stats, loading, error })}</>;
}

