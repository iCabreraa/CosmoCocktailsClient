"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  HiOutlineHeart,
  HiOutlineShoppingBag,
  HiOutlineTrash,
  HiOutlineStar,
  HiOutlineEye,
} from "react-icons/hi2";
import { useLanguage } from "@/contexts/LanguageContext";

interface FavoriteCocktail {
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
}

export default function UserFavorites() {
  const [favorites, setFavorites] = useState<FavoriteCocktail[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { t } = useLanguage();

  useEffect(() => {
    fetchFavorites();
  }, [t]);

  const fetchFavorites = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/favorites");
      if (!res.ok) throw new Error("No se pudieron cargar favoritos");
      const data = await res.json();
      setFavorites(data.favorites || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  };

  const removeFavorite = async (cocktailId: string) => {
    try {
      await fetch(`/api/favorites?cocktail_id=${cocktailId}`, {
        method: "DELETE",
      });
      setFavorites(prev => prev.filter(fav => fav.id !== cocktailId));
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al remover favorito"
      );
    }
  };

  const addToCart = async (cocktail: FavoriteCocktail) => {
    try {
      // Aquí implementarías la lógica para añadir al carrito
      console.log("Añadiendo al carrito:", cocktail);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al añadir al carrito"
      );
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <HiOutlineHeart className="h-12 w-12 text-red-400 mx-auto mb-4" />
        <p className="text-red-800 font-medium">Error al cargar favoritos</p>
        <p className="text-red-600 text-sm mt-2">{error}</p>
        <button
          onClick={fetchFavorites}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white/5 backdrop-blur-md rounded-lg border border-rose-500/30 shadow-[0_0_24px_rgba(244,63,94,.12)] p-6">
        <h2 className="text-2xl font-bold text-slate-100 flex items-center">
          <HiOutlineHeart className="h-6 w-6 mr-3 text-red-600" />
          {t("favorites.title")}
        </h2>
        <p className="text-slate-300 mt-2">{t("favorites.subtitle")}</p>
      </div>

      {/* Favorites Grid */}
      {favorites.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {favorites.map(cocktail => (
            <div
              key={cocktail.id}
              className="bg-white/5 backdrop-blur-md rounded-lg border border-slate-700/40 overflow-hidden hover:shadow-[0_0_24px_rgba(59,130,246,.12)] transition-shadow"
            >
              {/* Image */}
              <div className="relative h-48 bg-gray-200">
                <img
                  src={cocktail.image_url}
                  alt={cocktail.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-4 right-4">
                  <button
                    onClick={() => removeFavorite(cocktail.id)}
                    className="p-2 bg-white rounded-full shadow-md hover:bg-red-50 transition-colors"
                  >
                    <HiOutlineTrash className="h-4 w-4 text-red-600" />
                  </button>
                </div>
                <div className="absolute top-4 left-4">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                    {cocktail.category}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <h3 className="text-lg font-semibold text-slate-100 mb-2">
                  {cocktail.name}
                </h3>
                <p className="text-slate-300 text-sm mb-4 line-clamp-2">
                  {cocktail.description}
                </p>

                {/* Botones por tamaño y precio */}
                <div className="mb-4">
                  {cocktail.sizes && cocktail.sizes.length > 0 ? (
                    <div className="grid grid-cols-2 gap-2">
                      {cocktail.sizes.map(size => (
                        <button
                          key={size.id}
                          onClick={() => addToCart(cocktail)}
                          className="flex flex-col items-center justify-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                        >
                          <span className="font-semibold">{size.name}</span>
                          <span className="text-xs opacity-90">
                            €{size.price}
                          </span>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-2xl font-bold text-sky-300">
                        €{cocktail.price}
                      </span>
                      <div className="flex items-center text-sm text-gray-500">
                        <HiOutlineStar className="h-4 w-4 text-yellow-500 mr-1" />
                        <span>Favorito</span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex space-x-2">
                  <Link
                    href={`/shop/${cocktail.id}`}
                    className="flex-1 flex items-center justify-center px-4 py-2 border border-slate-600 text-slate-200 rounded-lg hover:bg-white/10 transition-colors"
                  >
                    <HiOutlineEye className="h-4 w-4 mr-2" />
                    {t("shop.view_details")}
                  </Link>
                </div>

                <div className="mt-4 text-xs text-gray-500">
                  <span className="text-slate-300">
                    {t("favorites.added_on").replace(
                      "{date}",
                      new Date(cocktail.added_at).toLocaleDateString("es-ES")
                    )}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white/5 backdrop-blur-md rounded-lg border border-slate-700/40 p-12 text-center">
          <HiOutlineHeart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-100 mb-2">
            {t("favorites.empty")}
          </h3>
          <p className="text-slate-300 mb-6">
            ¡{t("favorites.explore")} y guarda tus cocktails espaciales
            favoritos!
          </p>
          <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            {t("favorites.explore")}
          </button>
        </div>
      )}
    </div>
  );
}
