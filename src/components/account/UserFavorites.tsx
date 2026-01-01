"use client";

import Link from "next/link";
import {
  HiOutlineHeart,
  HiOutlineTrash,
  HiOutlineEye,
  HiOutlineSparkles,
} from "react-icons/hi2";
import { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import Image from "next/image";
import { useAuthUnified } from "@/hooks/useAuthUnified";
import {
  useFavorites,
  FavoriteDetails,
} from "@/hooks/queries/useFavorites";
import { useCart } from "@/store/cart";
import { useToast } from "@/components/feedback/ToastProvider";

export default function UserFavorites() {
  const { t } = useLanguage();
  const { user, loading: authLoading } = useAuthUnified();
  const addToCart = useCart(state => state.addToCart);
  const { notify } = useToast();
  const [page, setPage] = useState(1);
  const pageSize = 5;
  const { favoritesQuery, removeFavorite } = useFavorites({
    enabled: Boolean(user),
    mode: "details",
    page,
    pageSize,
    userId: user?.id ?? null,
  });
  const favorites = (favoritesQuery.data ?? []) as FavoriteDetails[];
  const loading = favoritesQuery.isLoading;
  const error =
    favoritesQuery.error instanceof Error
      ? favoritesQuery.error.message
      : "";

  const sizeSlots = [
    { key: "shot", label: t("sizes.shot"), volume: 20 },
    { key: "small_bottle", label: t("sizes.small_bottle"), volume: 200 },
  ];

  const resolveSlotKey = (
    size: NonNullable<FavoriteDetails["sizes"]>[number]
  ) => {
    const rawName = (size.name ?? "").toLowerCase();
    if (rawName.includes("shot") || rawName.includes("chupito")) return "shot";
    if (rawName.includes("small") || rawName.includes("bottle")) {
      return "small_bottle";
    }
    if (typeof size.volume_ml === "number") {
      return size.volume_ml <= 60 ? "shot" : "small_bottle";
    }
    return null;
  };

  const isOutOfStock = (
    size: NonNullable<FavoriteDetails["sizes"]>[number]
  ) =>
    size.available === false ||
    (typeof size.stock_quantity === "number" && size.stock_quantity <= 0);

  const handleAddToCart = (
    cocktail: FavoriteDetails,
    size: NonNullable<FavoriteDetails["sizes"]>[number] | undefined
  ) => {
    if (!size || !size.sizes_id) return;
    addToCart({
      cocktail_id: cocktail.id,
      sizes_id: size.sizes_id,
      quantity: 1,
      unit_price: size.price,
      cocktail_name: cocktail.name,
      size_name: size.name ?? `${size.volume_ml ?? 0}ml`,
      volume_ml: size.volume_ml ?? 0,
      image_url: cocktail.image_url,
      is_alcoholic: cocktail.alcohol_percentage > 0,
    });
    notify({
      type: "success",
      title: t("feedback.cart_added_title"),
      message: t("feedback.cart_added_message", { name: cocktail.name }),
    });
  };

  useEffect(() => {
    setPage(1);
  }, [user?.id]);

  const canPrev = page > 1;
  const canNext = favorites.length === pageSize;

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white/5 border border-rose-500/30 rounded-lg p-6 text-center">
        <HiOutlineHeart className="h-12 w-12 text-rose-300 mx-auto mb-4" />
        <p className="text-rose-200 font-medium">
          {t("favorites.error_loading")}
        </p>
        <p className="text-rose-200/80 text-sm mt-2">{error}</p>
        <button
          onClick={() => favoritesQuery.refetch()}
          className="mt-4 px-4 py-2 bg-rose-500/20 text-rose-200 border border-rose-400/40 rounded-lg hover:bg-rose-500/30 transition-colors"
        >
          {t("common.retry")}
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
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {favorites.map(cocktail => {
              const sizeMap = sizeSlots.reduce<
                Record<
                  string,
                  NonNullable<FavoriteDetails["sizes"]>[number] | undefined
                >
              >((acc, slot) => {
                acc[slot.key] = undefined;
                return acc;
              }, {});

              (cocktail.sizes ?? []).forEach(size => {
                const slotKey = resolveSlotKey(size);
                if (!slotKey || sizeMap[slotKey]) return;
                sizeMap[slotKey] = size;
              });
              const imageSrc =
                cocktail.image_url || "/images/placeholder.webp";

              return (
                <div
                  key={cocktail.id}
                  className="group overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md transition hover:border-cosmic-gold/40 hover:shadow-[0_0_24px_rgba(219,184,99,.12)]"
                >
                <div className="relative h-52">
                  <Image
                    src={imageSrc}
                    alt={cocktail.name}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
                  <button
                    onClick={() => removeFavorite.mutate(cocktail.id)}
                    className="absolute top-4 right-4 rounded-full border border-white/15 bg-slate-900/70 p-2 text-rose-200 transition hover:border-rose-400/50 hover:text-rose-100"
                  >
                    <HiOutlineTrash className="h-4 w-4" />
                  </button>
                  <span className="absolute left-4 top-4 inline-flex items-center gap-1 rounded-full border border-cosmic-gold/30 bg-cosmic-gold/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-cosmic-gold/80">
                    <HiOutlineSparkles className="h-3 w-3" />
                    {cocktail.alcohol_percentage > 0
                      ? `${cocktail.alcohol_percentage}% ABV`
                      : t("shop.non_alcoholic")}
                  </span>
                </div>

                <div className="flex flex-col gap-4 p-6">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-100">
                      {cocktail.name}
                    </h3>
                    <p className="text-sm text-slate-300 line-clamp-2">
                      {cocktail.description}
                    </p>
                  </div>

                  <div className="grid gap-2">
                    {sizeSlots.map(slot => {
                      const size = sizeMap[slot.key];
                      const missing = !size;
                      const outOfStock = size ? isOutOfStock(size) : false;
                      const disabled = missing || outOfStock;
                      const volumeValue =
                        size?.volume_ml ?? slot.volume ?? 0;
                      const volumeLabel = `${volumeValue}ml`.toUpperCase();
                      const priceLabel = missing
                        ? t("shop.price_placeholder")
                        : `€${size?.price.toFixed(2)}`;

                      return (
                        <button
                          key={slot.key}
                          type="button"
                          onClick={() => handleAddToCart(cocktail, size)}
                          disabled={disabled}
                          className={`group/button relative flex items-center justify-between gap-3 overflow-hidden rounded-xl border px-4 py-2 text-left text-[11px] uppercase tracking-[0.12em] transition ${
                            disabled
                              ? "cursor-not-allowed border-cosmic-gold/20 bg-white/5 text-cosmic-silver/60"
                              : "border-cosmic-gold/30 bg-white/5 text-cosmic-silver hover:border-cosmic-gold hover:bg-cosmic-gold/10 hover:text-white"
                          }`}
                        >
                          <span className="flex flex-col gap-0.5">
                            <span
                              className={`text-[10px] ${
                                disabled
                                  ? "text-cosmic-gold/60"
                                  : "text-cosmic-gold/80 group-hover/button:text-white"
                              }`}
                            >
                              {slot.label}
                            </span>
                            <span
                              className={`text-[9px] uppercase tracking-[0.2em] ${
                                disabled
                                  ? "text-cosmic-silver/50"
                                  : "text-cosmic-silver/70 group-hover/button:text-white/80"
                              }`}
                            >
                              {volumeLabel}
                            </span>
                          </span>
                          <span
                            className={`${
                              disabled
                                ? "text-cosmic-gold/60"
                                : "text-cosmic-gold group-hover/button:text-white"
                            }`}
                            >
                              {priceLabel}
                            </span>
                            {outOfStock && (
                              <span className="pointer-events-none absolute -right-6 top-2 rotate-45 whitespace-nowrap bg-red-500/90 px-8 py-0.5 text-[9px] uppercase tracking-[0.2em] text-white">
                                {t("shop.out_of_stock_short")}
                              </span>
                            )}
                            {missing && (
                              <span className="pointer-events-none absolute -right-6 top-2 rotate-45 whitespace-nowrap bg-gradient-to-r from-cosmic-gold/80 via-sky-200/80 to-cosmic-gold/80 px-8 py-0.5 text-[9px] uppercase tracking-[0.2em] text-black">
                                {t("shop.coming_soon_short")}
                              </span>
                            )}
                        </button>
                      );
                    })}
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>
                      {t("favorites.added_on").replace(
                        "{date}",
                        new Date(cocktail.added_at).toLocaleDateString("es-ES")
                      )}
                    </span>
                    <Link
                      href={`/shop/${cocktail.id}`}
                      prefetch={false}
                      className="inline-flex items-center gap-1 text-cosmic-gold/80 hover:text-cosmic-gold"
                    >
                      <HiOutlineEye className="h-4 w-4" />
                      {t("shop.view_details")}
                    </Link>
                  </div>
                </div>
              </div>
            );
            })}
          </div>

          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => setPage(prev => Math.max(1, prev - 1))}
              disabled={!canPrev}
              className={`px-4 py-2 rounded-full border text-xs font-semibold uppercase tracking-[0.2em] transition ${
                canPrev
                  ? "border-cosmic-gold/40 text-cosmic-gold hover:bg-cosmic-gold/10"
                  : "border-white/10 text-slate-500 cursor-not-allowed"
              }`}
            >
              {t("common.prev")}
            </button>
            <span className="text-xs text-slate-400">{page}</span>
            <button
              type="button"
              onClick={() => setPage(prev => prev + 1)}
              disabled={!canNext}
              className={`px-4 py-2 rounded-full border text-xs font-semibold uppercase tracking-[0.2em] transition ${
                canNext
                  ? "border-cosmic-gold/40 text-cosmic-gold hover:bg-cosmic-gold/10"
                  : "border-white/10 text-slate-500 cursor-not-allowed"
              }`}
            >
              {t("common.next")}
            </button>
          </div>
        </>
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
