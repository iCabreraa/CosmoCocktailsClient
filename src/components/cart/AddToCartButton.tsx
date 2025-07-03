"use client";

import { useEffect, useState } from "react";
import { useCart } from "@/store/cart";
import { CocktailSize, Product } from "@/types";
import { ShoppingCart, X } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

export default function AddToCartButton({ product }: { product: Product }) {
  const addToCart = useCart((state) => state.addToCart);
  const [open, setOpen] = useState(false);
  const [sizes, setSizes] = useState<CocktailSize[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      .select("id, price, available, sizes_id")
      .eq("cocktail_id", product.slug)
      .eq("available", true);

    if (sizeErr || !rawSizes) {
      setError("Failed to load sizes");
      setLoading(false);
      return;
    }

    const sizeIds = rawSizes.map((s) => s.sizes_id).filter(Boolean);
    const { data: sizeDetails } = await supabase
      .from("sizes")
      .select("id, name, volume_ml")
      .in("id", sizeIds);

    const finalSizes: CocktailSize[] = rawSizes.map((s) => ({
      ...s,
      size: sizeDetails?.find((d) => d.id === s.sizes_id) ?? null,
    }));

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
      id: size.id,
      name: `${product.name} (${
        size.size?.name ?? `${size.size?.volume_ml ?? 0}ml`
      })`,
      slug: product.slug,
      image: product.image,
      description: product.description,
      price: size.price,
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
            onClick={(e) => e.stopPropagation()}
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
              {sizes.map((size) => (
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
