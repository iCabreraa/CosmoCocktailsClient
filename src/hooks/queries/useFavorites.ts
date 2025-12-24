"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export type Favorite = { id: string; cocktail_id: string };
export type FavoriteDetails = {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  category: string;
  added_at: string;
  sizes?: Array<{
    id: string;
    name: string;
    volume_ml: number;
    price: number;
  }>;
};

type FavoritesMode = "ids" | "details";

export function useFavorites(
  options: { enabled?: boolean; mode?: FavoritesMode } = {}
) {
  const { enabled = true, mode = "ids" } = options;
  const queryClient = useQueryClient();
  const queryKey = ["favorites", mode];

  const favoritesQuery = useQuery<Favorite[] | FavoriteDetails[]>({
    queryKey,
    queryFn: async () => {
      const res = await fetch(`/api/favorites?mode=${mode}`);
      if (!res.ok) return [];
      const data = await res.json();
      const favorites = data.favorites ?? [];
      if (mode === "ids") {
        return favorites.map((favorite: any) => ({
          id: favorite.id ?? favorite.cocktail_id,
          cocktail_id: favorite.cocktail_id ?? favorite.id,
        }));
      }
      return favorites as FavoriteDetails[];
    },
    enabled,
    staleTime: mode === "ids" ? 5 * 60 * 1000 : 2 * 60 * 1000,
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
    onMutate: async cocktailId => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<
        Favorite[] | FavoriteDetails[]
      >(queryKey);
      if (mode === "ids") {
        const typedPrevious = previous as Favorite[] | undefined;
        const next = typedPrevious?.some(
          favorite => favorite.cocktail_id === cocktailId
        )
          ? typedPrevious
          : [
              ...(typedPrevious ?? []),
              { id: cocktailId, cocktail_id: cocktailId },
            ];
        queryClient.setQueryData(queryKey, next);
      }
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKey, context.previous);
      }
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey }),
  });

  const removeFavorite = useMutation({
    mutationFn: async (cocktailId: string) => {
      const res = await fetch(`/api/favorites?cocktail_id=${cocktailId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to remove favorite");
    },
    onMutate: async cocktailId => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<
        Favorite[] | FavoriteDetails[]
      >(queryKey);
      if (previous) {
        if (mode === "ids") {
          queryClient.setQueryData(
            queryKey,
            (previous as Favorite[]).filter(
              favorite => favorite.cocktail_id !== cocktailId
            )
          );
        } else {
          queryClient.setQueryData(
            queryKey,
            (previous as FavoriteDetails[]).filter(
              favorite => favorite.id !== cocktailId
            )
          );
        }
      }
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKey, context.previous);
      }
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey }),
  });

  return { favoritesQuery, addFavorite, removeFavorite };
}
