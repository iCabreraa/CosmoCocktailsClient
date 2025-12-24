"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export type Favorite = { id: string; cocktail_id: string };

export function useFavorites(options: { enabled?: boolean } = {}) {
  const { enabled = true } = options;
  const queryClient = useQueryClient();

  const favoritesQuery = useQuery<Favorite[]>({
    queryKey: ["favorites"],
    queryFn: async () => {
      const res = await fetch("/api/favorites");
      if (!res.ok) return [];
      const data = await res.json();
      return (data.favorites as Favorite[]) ?? [];
    },
    enabled,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const addFavorite = useMutation({
    mutationFn: async (cocktailId: string) => {
      const res = await fetch("/api/favorites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cocktail_id: cocktailId }),
      });
      if (!res.ok) throw new Error("Failed to add favorite");
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["favorites"] }),
  });

  const removeFavorite = useMutation({
    mutationFn: async (cocktailId: string) => {
      const res = await fetch(`/api/favorites?cocktail_id=${cocktailId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to remove favorite");
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["favorites"] }),
  });

  return { favoritesQuery, addFavorite, removeFavorite };
}
