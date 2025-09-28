"use client";

import { useState, useEffect } from "react";
import { HiOutlineHeart, HiHeart } from "react-icons/hi2";

interface FavoriteButtonProps {
  cocktailId: string;
  isFavorite?: boolean;
  onToggle?: (cocktailId: string, isFavorite: boolean) => void;
  className?: string;
}

export default function FavoriteButton({
  cocktailId,
  isFavorite = false,
  onToggle,
  className = "",
}: FavoriteButtonProps) {
  const [loading, setLoading] = useState(false);
  const [favorite, setFavorite] = useState(isFavorite);
  const [initialized, setInitialized] = useState(false);

  // Verificar estado inicial de favoritos
  useEffect(() => {
    const checkFavoriteStatus = async () => {
      try {
        const response = await fetch("/api/favorites");
        if (response.ok) {
          const data = await response.json();
          const isCurrentlyFavorite = data.favorites?.some(
            (fav: any) => fav.id === cocktailId
          );
          setFavorite(isCurrentlyFavorite);
        }
      } catch (error) {
        console.error("Error checking favorite status:", error);
      } finally {
        setInitialized(true);
      }
    };

    checkFavoriteStatus();
  }, [cocktailId]);

  const handleToggle = async () => {
    if (loading) return;

    setLoading(true);
    try {
      if (favorite) {
        // Remover de favoritos
        const response = await fetch(
          `/api/favorites?cocktail_id=${cocktailId}`,
          {
            method: "DELETE",
          }
        );

        if (response.ok) {
          setFavorite(false);
          onToggle?.(cocktailId, false);
        }
      } else {
        // Añadir a favoritos
        const response = await fetch("/api/favorites", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ cocktail_id: cocktailId }),
        });

        if (response.ok) {
          setFavorite(true);
          onToggle?.(cocktailId, true);
        }
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleToggle}
      disabled={loading || !initialized}
      className={`p-2 rounded-full transition-all duration-200 ${
        favorite
          ? "bg-red-500 text-white hover:bg-red-600"
          : "bg-gray-800/50 text-gray-400 hover:bg-gray-700/50 hover:text-red-400"
      } ${loading || !initialized ? "opacity-50 cursor-not-allowed" : ""} ${className}`}
      title={favorite ? "Quitar de favoritos" : "Añadir a favoritos"}
    >
      {loading || !initialized ? (
        <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
      ) : favorite ? (
        <HiHeart className="h-4 w-4" />
      ) : (
        <HiOutlineHeart className="h-4 w-4" />
      )}
    </button>
  );
}
