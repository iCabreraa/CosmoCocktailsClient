"use client";

import { useMemo } from "react";
import { useFavorites } from "@/hooks/queries/useFavorites";
import { HiOutlineHeart, HiHeart } from "react-icons/hi2";
import { useAuthUnified } from "@/hooks/useAuthUnified";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/components/feedback/ToastProvider";

interface FavoriteButtonProps {
  cocktailId: string;
  className?: string;
}

export default function FavoriteButton({
  cocktailId,
  className = "",
}: FavoriteButtonProps) {
  const { user } = useAuthUnified();
  const { t } = useLanguage();
  const { notify } = useToast();
  const isAuthenticated = Boolean(user);
  const { favoritesQuery, addFavorite, removeFavorite } = useFavorites({
    enabled: isAuthenticated,
  });
  const favoriteIds = useMemo(() => {
    const data = favoritesQuery.data ?? [];
    return new Set(
      (data as Array<{ cocktail_id?: string; id?: string }>).map(
        favorite => favorite.cocktail_id ?? favorite.id ?? ""
      )
    );
  }, [favoritesQuery.data]);

  const isFavorite = favoriteIds.has(cocktailId);

  if (!isAuthenticated) {
    return null;
  }

  const isMutating = addFavorite.isPending || removeFavorite.isPending;
  const isInitialLoading = favoritesQuery.isLoading && favoriteIds.size === 0;

  const handleToggle = async () => {
    if (isMutating) return;
    if (isFavorite) {
      notify({
        type: "info",
        title: t("feedback.favorite_removed_title"),
        message: t("feedback.favorite_removed_message"),
      });
      removeFavorite.mutate(cocktailId, {
        onError: () => {
          notify({
            type: "error",
            title: t("common.error"),
            message: t("favorites.error_loading"),
          });
        },
      });
    } else {
      notify({
        type: "success",
        title: t("feedback.favorite_added_title"),
        message: t("feedback.favorite_added_message"),
        action: {
          label: t("feedback.undo"),
          onClick: () => removeFavorite.mutate(cocktailId),
        },
      });
      addFavorite.mutate(cocktailId, {
        onError: () => {
          notify({
            type: "error",
            title: t("common.error"),
            message: t("favorites.error_loading"),
          });
        },
      });
    }
  };

  return (
    <button
      onClick={handleToggle}
      disabled={isMutating}
      className={`p-2 rounded-full transition-all duration-200 ${
        isFavorite
          ? "bg-red-500 text-white hover:bg-red-600"
          : "bg-gray-800/50 text-gray-400 hover:bg-gray-700/50 hover:text-red-400"
      } ${isMutating ? "opacity-50 cursor-not-allowed" : ""} ${className}`}
      title={isFavorite ? "Quitar de favoritos" : "Añadir a favoritos"}
      aria-busy={isMutating || isInitialLoading}
    >
      {isInitialLoading ? (
        <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
      ) : isFavorite ? (
        <HiHeart className="h-4 w-4" />
      ) : (
        <HiOutlineHeart className="h-4 w-4" />
      )}
    </button>
  );
}
