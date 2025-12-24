"use client";

import { useEffect, useState } from "react";
import { useCart } from "@/store/cart";
import { CocktailSize, Cocktail } from "@/types/shared";
import { ShoppingCart, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { CocktailSize as SupabaseCocktailSize, Size } from "@/types/supabase";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/components/feedback/ToastProvider";

interface AddToCartButtonProps {
  cocktail: Cocktail;
  minPrice: number;
  minSizeId: string;
}

export default function AddToCartButton({
  cocktail,
  minPrice,
  minSizeId,
}: AddToCartButtonProps) {
  const { t } = useLanguage();
  const { notify } = useToast();
  const addToCart = useCart(state => state.addToCart);
  const [open, setOpen] = useState(false);
  const [sizes, setSizes] = useState<CocktailSize[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    if (open) window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  async function fetchSizes() {
    setLoading(true);

    const { data: rawSizes, error: sizeErr } = await supabase
      .from("cocktail_sizes")
      .select("id, price, available, sizes_id, stock_quantity")
      .eq("cocktail_id", cocktail.id);

    if (sizeErr) {
      console.error("❌ Error fetching sizes:", sizeErr);
      setError("Failed to load sizes");
      setLoading(false);
      return;
    }

    const typedRawSizes = rawSizes as SupabaseCocktailSize[];
    if (!typedRawSizes || typedRawSizes.length === 0) {
      setError("No sizes available");
      setLoading(false);
      return;
    }

    const sizeIds = typedRawSizes.map(s => s.sizes_id).filter(Boolean);
    const { data: sizeDetails } = await supabase
      .from("sizes")
      .select("id, name, volume_ml")
      .in("id", sizeIds);

    const finalSizes: CocktailSize[] = (typedRawSizes as any[])
      .filter(s => s.sizes_id !== null)
      .map(s => {
        const sizeDetail = (sizeDetails as Size[])?.find(
          (d: Size) => d.id === s.sizes_id
        );

        return {
          ...s,
          cocktail_id: cocktail.id,
          stock_quantity: s.stock_quantity || 0,
          created_at: new Date().toISOString(), // Generar timestamp ya que no existe en BD
          updated_at: new Date().toISOString(), // Generar timestamp ya que no existe en BD
          size: sizeDetail
            ? {
                id: sizeDetail.id,
                name: sizeDetail.name,
                volume_ml: sizeDetail.volume_ml,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              }
            : undefined,
        };
      });

    setSizes(finalSizes);
    setError(null);
    setLoading(false);
  }

  function handleOpen() {
    if (sizes.length === 0) fetchSizes();
    setOpen(true);
  }

  function handleSelect(size: CocktailSize) {
    addToCart({
      cocktail_id: cocktail.id,
      sizes_id: size.sizes_id, // Usar sizes_id que es el campo real de la BD
      quantity: 1,
      unit_price: size.price,
      cocktail_name: cocktail.name,
      size_name: size.size?.name ?? `${size.size?.volume_ml ?? 0}ml`,
      volume_ml: size.size?.volume_ml ?? 0,
      image_url: cocktail.image_url,
    });
    notify({
      type: "success",
      title: t("feedback.cart_added_title"),
      message: t("feedback.cart_added_message", { name: cocktail.name }),
    });
    setOpen(false);
  }

  return (
    <>
      <button
        onClick={handleOpen}
        className="mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-full border border-cosmic-gold text-cosmic-gold hover:bg-cosmic-gold hover:text-black focus:outline-none focus:ring-2 focus:ring-cosmic-gold transition-all text-sm"
      >
        <ShoppingCart className="w-4 h-4" />
        {t("shop.add_to_cart")}
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="bg-cosmic-bg rounded-lg p-6 max-w-sm w-full relative"
            onClick={e => e.stopPropagation()}
          >
            <button
              onClick={() => setOpen(false)}
              className="absolute right-3 top-3 text-cosmic-fog hover:text-white focus:outline-none focus:ring-2 focus:ring-cosmic-gold"
              aria-label="Close"
            >
              <X size={18} />
            </button>
            <h2 className="text-lg font-[--font-unica] text-cosmic-gold mb-4">
              {t("shop.choose_size")}
            </h2>

            {loading && (
              <p className="text-cosmic-fog">{t("common.loading")}</p>
            )}
            {error && <p className="text-red-500 text-sm">{error}</p>}
            {!loading && sizes.length === 0 && (
              <p className="text-cosmic-fog">{t("shop.no_sizes_available")}</p>
            )}

            <div className="space-y-2">
              {sizes.map(size => (
                <button
                  key={size.id}
                  onClick={() => handleSelect(size)}
                  className="w-full flex justify-between items-center border border-cosmic-gold rounded px-4 py-2 text-cosmic-text hover:bg-cosmic-gold/20"
                >
                  <span>
                    {size.size?.name ?? `${size.size?.volume_ml ?? 0}ml`}
                  </span>
                  <span>€{size.price.toFixed(2)}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
