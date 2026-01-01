"use client";

import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";

export type Favorite = { id: string; cocktail_id: string };
export type FavoriteDetails = {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  alcohol_percentage: number;
  category: string;
  added_at: string;
  sizes?: Array<{
    id: string;
    sizes_id: string;
    name: string;
    volume_ml: number;
    price: number;
    available?: boolean;
    stock_quantity?: number | null;
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
  options: {
    enabled?: boolean;
    mode?: FavoritesMode;
    page?: number;
    pageSize?: number;
    userId?: string | null;
  } = {}
) {
  const { enabled = true, mode = "ids", page, pageSize, userId } = options;
  const queryClient = useQueryClient();
  const queryKey = ["favorites", mode, userId ?? "anon", page ?? 1, pageSize ?? null];
  const supabase = createClient();
  const favoritesTable = supabase.from("user_favorites") as any;
  const getSessionUserId = async () => {
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      throw error;
    }
    return data.session?.user?.id ?? null;
  };

  const favoritesQuery = useQuery<Favorite[] | FavoriteDetails[]>({
    queryKey,
    queryFn: async () => {
      if (mode === "ids") {
        const sessionUserId = await getSessionUserId();
        if (!sessionUserId) return [];
        const { data, error } = await favoritesTable
          .select("cocktail_id")
          .eq("user_id", sessionUserId);

        if (error) {
          throw error;
        }

        const favoritesData = (data ?? []) as Array<{ cocktail_id: string }>;
        const normalized = favoritesData.map(favorite => ({
          id: favorite.cocktail_id,
          cocktail_id: favorite.cocktail_id,
        }));
        writeCachedIds(normalized);
        return normalized;
      }
      const params = new URLSearchParams({ mode });
      if (typeof page === "number") {
        params.set("page", String(page));
      }
      if (typeof pageSize === "number") {
        params.set("pageSize", String(pageSize));
      }
      const res = await fetch(`/api/favorites?${params.toString()}`);
      if (res.status === 401) {
        throw new Error("Unauthorized");
      }
      if (!res.ok) {
        const payload = await res.json().catch(() => null);
        const message =
          payload?.error ?? "Failed to load favorites";
        throw new Error(message);
      }
      const data = await res.json();
      const favorites = data.favorites ?? [];
      return favorites as FavoriteDetails[];
    },
    enabled,
    staleTime: mode === "ids" ? 10 * 60 * 1000 : 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    placeholderData: keepPreviousData,
    refetchOnWindowFocus: false,
    refetchOnMount: "always",
    initialData: mode === "ids" ? readCachedIds() ?? [] : undefined,
  });

  const addFavorite = useMutation({
    mutationFn: async (cocktailId: string) => {
      const sessionUserId = await getSessionUserId();
      if (!sessionUserId) {
        throw new Error("Unauthorized");
      }
      const { error } = await favoritesTable.insert({
        user_id: sessionUserId,
        cocktail_id: cocktailId,
      });
      if (error) {
        throw new Error(error.message);
      }
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
      const sessionUserId = await getSessionUserId();
      if (!sessionUserId) {
        throw new Error("Unauthorized");
      }
      const { error } = await favoritesTable
        .delete()
        .eq("user_id", sessionUserId)
        .eq("cocktail_id", cocktailId);
      if (error) {
        throw new Error(error.message);
      }
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
