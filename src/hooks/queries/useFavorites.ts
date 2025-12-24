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
const FAVORITES_IDS_CACHE_KEY = "cosmic-favorites-ids";

const readCachedIds = (): Favorite[] | undefined => {
  if (typeof window === "undefined") return undefined;
  try {
    const raw = window.localStorage.getItem(FAVORITES_IDS_CACHE_KEY);
    if (!raw) return undefined;
    const ids = JSON.parse(raw);
    if (!Array.isArray(ids)) return undefined;
    return ids
      .filter((id: unknown) => typeof id === "string" && id.length > 0)
      .map(id => ({ id, cocktail_id: id }));
  } catch {
    return undefined;
  }
};

const writeCachedIds = (favorites: Favorite[]) => {
  if (typeof window === "undefined") return;
  try {
    const ids = favorites.map(favorite => favorite.cocktail_id);
    window.localStorage.setItem(
      FAVORITES_IDS_CACHE_KEY,
      JSON.stringify(ids)
    );
  } catch {
    // ignore storage errors
  }
};

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
        const normalized = favorites.map((favorite: any) => ({
          id: favorite.id ?? favorite.cocktail_id,
          cocktail_id: favorite.cocktail_id ?? favorite.id,
        }));
        writeCachedIds(normalized);
        return normalized;
      }
      return favorites as FavoriteDetails[];
    },
    enabled,
    staleTime: mode === "ids" ? 10 * 60 * 1000 : 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: mode === "ids" ? false : "always",
    initialData: mode === "ids" ? readCachedIds() : undefined,
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
        if (next) {
          writeCachedIds(next);
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
          const next = (previous as Favorite[]).filter(
            favorite => favorite.cocktail_id !== cocktailId
          );
          queryClient.setQueryData(queryKey, next);
          writeCachedIds(next);
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
