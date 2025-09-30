"use client";

import { useEffect, useState } from "react";
import { useCart } from "@/store/cart";
import { CocktailSize, Cocktail } from "@/types/shared";
import { ShoppingCart, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

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
    console.log("🔍 Fetching sizes for cocktail:", cocktail.id);

    const { data: rawSizes, error: sizeErr } = await (supabase as any)
      .from("cocktail_sizes")
      .select("id, price, available, sizes_id, stock_quantity")
      .eq("cocktail_id", cocktail.id);

    console.log("📦 Raw sizes response:", { rawSizes, sizeErr });

    if (sizeErr) {
      console.error("❌ Error fetching sizes:", sizeErr);
      setError("Failed to load sizes");
      setLoading(false);
      return;
    }

    const typedRawSizes = rawSizes as any[];
    if (!typedRawSizes || typedRawSizes.length === 0) {
      console.log("⚠️ No sizes found for cocktail:", cocktail.id);
      setError("No sizes available");
      setLoading(false);
      return;
    }

    const sizeIds = typedRawSizes.map(s => s.sizes_id).filter(Boolean);
    const { data: sizeDetails } = await (supabase as any)
      .from("sizes")
      .select("id, name, volume_ml")
      .in("id", sizeIds);

    const finalSizes: CocktailSize[] = typedRawSizes.map(s => {
      const sizeDetail = (sizeDetails as any)?.find((d: any) => d.id === s.sizes_id);
      console.log("🔍 Mapping size:", {
        cocktail_id: cocktail.id,
        sizes_id: s.sizes_id,
        sizeDetail: sizeDetail,
        stock_quantity: s.stock_quantity,
      });

      return {
        ...s,
        cocktail_id: cocktail.id,
        size_id: s.sizes_id, // Asegurar que size_id = sizes_id
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
    console.log("🛒 Adding to cart:", {
      cocktail_id: cocktail.id,
      size_id: size.sizes_id, // Usar sizes_id que es el campo real de la BD
      cocktail_name: cocktail.name,
      size_name: size.size?.name ?? `${size.size?.volume_ml ?? 0}ml`,
      price: size.price,
    });

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
    setOpen(false);
  }

  return (
    <>
      <button
        onClick={handleOpen}
        className="mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-full border border-cosmic-gold text-cosmic-gold hover:bg-cosmic-gold hover:text-black focus:outline-none focus:ring-2 focus:ring-cosmic-gold transition-all text-sm"
      >
        <ShoppingCart className="w-4 h-4" />
        Add to Cart
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
              Choose a size
            </h2>

            {loading && <p className="text-cosmic-fog">Loading...</p>}
            {error && <p className="text-red-500 text-sm">{error}</p>}
            {!loading && sizes.length === 0 && (
              <p className="text-cosmic-fog">No sizes available.</p>
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
