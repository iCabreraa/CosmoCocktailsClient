"use client";

import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useAuthUnified } from "@/hooks/useAuthUnified";

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
export type FavoriteDetailsResponse = {
  favorites: FavoriteDetails[];
  meta?: {
    total_favorites?: number;
    page?: number | null;
    page_size?: number | null;
    has_next?: boolean | null;
  };
};

type FavoritesMode = "ids" | "details";
type FavoritesResult<M extends FavoritesMode> = M extends "details"
  ? FavoriteDetailsResponse
  : Favorite[];
export type FavoritesOptions<M extends FavoritesMode> = {
  enabled?: boolean;
  mode?: M;
  page?: number;
  pageSize?: number;
  userId?: string | null;
};
const FAVORITES_IDS_CACHE_KEY = "cosmic-favorites-ids";
const buildIdsCacheKey = (userId: string) =>
  `${FAVORITES_IDS_CACHE_KEY}:${userId}`;

const readCachedIds = (userId: string | null) => {
  if (typeof window === "undefined") return undefined;
  if (!userId) return undefined;
  try {
    const raw = window.localStorage.getItem(buildIdsCacheKey(userId));
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

const writeCachedIds = (favorites: Favorite[], userId: string | null) => {
  if (typeof window === "undefined") return;
  if (!userId) return;
  try {
    const ids = favorites.map(favorite => favorite.cocktail_id);
    window.localStorage.setItem(
      buildIdsCacheKey(userId),
      JSON.stringify(ids)
    );
  } catch {
    // ignore storage errors
  }
};

const buildFavoritesUrl = <M extends FavoritesMode>({
  mode,
  page,
  pageSize,
}: FavoritesOptions<M>) => {
  const params = new URLSearchParams({ mode: mode ?? "ids" });
  if (typeof page === "number") {
    params.set("page", String(page));
  }
  if (typeof pageSize === "number") {
    params.set("pageSize", String(pageSize));
  }
  return `/api/favorites?${params.toString()}`;
};

export const buildFavoritesQueryKey = <M extends FavoritesMode>({
  mode = "ids" as M,
  page,
  pageSize,
  userId,
}: FavoritesOptions<M>) =>
  [
    "favorites",
    userId ?? "anon",
    mode,
    page ?? 1,
    pageSize ?? null,
  ] as const;

export const fetchFavorites = async <M extends FavoritesMode>(
  options: FavoritesOptions<M>
): Promise<FavoritesResult<M>> => {
  const { mode = "ids" as M, userId } = options;
  const res = await fetch(buildFavoritesUrl(options));
  if (res.status === 401) {
    const error = new Error("Unauthorized");
    (error as { status?: number }).status = 401;
    throw error;
  }
  if (!res.ok) {
    let message = "Failed to load favorites";
    try {
      const payload = await res.json();
      if (payload?.error) message = payload.error;
    } catch {
      // ignore parsing errors
    }
    throw new Error(message);
  }
  const data = await res.json();
  if (mode === "ids") {
    const favoritesData = (data.favorites ?? []) as Array<{
      cocktail_id: string;
    }>;
    const normalized = favoritesData.map(favorite => ({
      id: favorite.cocktail_id,
      cocktail_id: favorite.cocktail_id,
    }));
    writeCachedIds(normalized, userId ?? null);
    return normalized as FavoritesResult<M>;
  }
  return {
    favorites: (data.favorites ?? []) as FavoriteDetails[],
    meta: data.meta,
  } as FavoritesResult<M>;
};

export function useFavorites<M extends FavoritesMode = "ids">(
  options: FavoritesOptions<M> = {}
) {
  const { enabled = true, mode = "ids", page, pageSize, userId } = options;
  const { user } = useAuthUnified();
  const queryClient = useQueryClient();
  const effectiveUserId = userId ?? user?.id ?? null;
  const baseQueryKey = ["favorites", effectiveUserId ?? "anon"] as const;
  const queryKey = buildFavoritesQueryKey({
    ...options,
    mode,
    page,
    pageSize,
    userId: effectiveUserId,
  });
  const supabase = createClient();
  const favoritesTable = supabase.from("user_favorites") as any;

  const favoritesQuery = useQuery<FavoritesResult<M>>({
    queryKey,
    queryFn: () =>
      fetchFavorites<M>({
        ...options,
        mode,
        page,
        pageSize,
        userId: effectiveUserId,
      } as FavoritesOptions<M>),
    enabled: enabled && Boolean(effectiveUserId),
    staleTime: mode === "ids" ? 10 * 60 * 1000 : 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    placeholderData: keepPreviousData,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    initialData:
      mode === "ids"
        ? ((readCachedIds(effectiveUserId) ?? []) as FavoritesResult<M>)
        : undefined,
  });

  const addFavorite = useMutation({
    mutationFn: async (cocktailId: string) => {
      if (!effectiveUserId) {
        throw new Error("Unauthorized");
      }
      const { error } = await favoritesTable.insert({
        user_id: effectiveUserId,
        cocktail_id: cocktailId,
      });
      if (error) {
        throw new Error(error.message);
      }
    },
    onMutate: async cocktailId => {
      await queryClient.cancelQueries({ queryKey: baseQueryKey });
      const previous = queryClient.getQueryData<
        Favorite[] | FavoriteDetailsResponse | FavoriteDetails[]
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
          writeCachedIds(next, effectiveUserId);
        }
      }
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKey, context.previous);
      }
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: baseQueryKey }),
  });

  const removeFavorite = useMutation({
    mutationFn: async (cocktailId: string) => {
      if (!effectiveUserId) {
        throw new Error("Unauthorized");
      }
      const { error } = await favoritesTable
        .delete()
        .eq("user_id", effectiveUserId)
        .eq("cocktail_id", cocktailId);
      if (error) {
        throw new Error(error.message);
      }
    },
    onMutate: async cocktailId => {
      await queryClient.cancelQueries({ queryKey: baseQueryKey });
      const previous = queryClient.getQueryData<
        Favorite[] | FavoriteDetailsResponse | FavoriteDetails[]
      >(queryKey);
      if (previous) {
        if (mode === "ids") {
          const next = (previous as Favorite[]).filter(
            favorite => favorite.cocktail_id !== cocktailId
          );
          queryClient.setQueryData(queryKey, next);
          writeCachedIds(next, effectiveUserId);
        } else {
          queryClient.setQueryData(
            queryKey,
            {
              ...(previous as FavoriteDetailsResponse),
              favorites: (previous as FavoriteDetailsResponse).favorites.filter(
                favorite => favorite.id !== cocktailId
              ),
            }
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
    onSettled: () => queryClient.invalidateQueries({ queryKey: baseQueryKey }),
  });

  return { favoritesQuery, addFavorite, removeFavorite };
}
