"use client";

import { useState } from "react";
import { useCart } from "@/store/cart";
import { Product } from "@/types";
import { ShoppingCart, X } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

interface CocktailSize {
  id: string;
  price: number;
  sizes: {
    name: string | null;
    volume_ml: number | null;
  } | null;
}

export default function AddToCartButton({ product }: { product: Product }) {
  const addToCart = useCart((state) => state.addToCart);
  const [open, setOpen] = useState(false);
  const [sizes, setSizes] = useState<CocktailSize[]>([]);
  const [loading, setLoading] = useState(false);

  async function fetchSizes() {
    setLoading(true);
    const { data, error } = await supabase
      .from("cocktail_sizes")
      .select(`id, price, sizes ( name, volume_ml )`)
      .eq("cocktail_id", product.slug)
      .eq("available", true);
    if (!error && data) setSizes(data);
    setLoading(false);
  }

  function handleOpen() {
    fetchSizes();
    setOpen(true);
  }

  function handleSelect(size: CocktailSize) {
    addToCart({
      id: size.id,
      name: `${product.name} (${
        size.sizes?.name ?? `${size.sizes?.volume_ml ?? 0}ml`
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
        className="mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-full border border-cosmic-gold text-cosmic-gold hover:bg-cosmic-gold hover:text-black transition-all text-sm"
      >
        <ShoppingCart className="w-4 h-4" />
        Add to Cart
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="bg-cosmic-bg rounded-lg p-6 max-w-sm w-full relative">
            <button
              onClick={() => setOpen(false)}
              className="absolute right-3 top-3 text-cosmic-fog hover:text-white"
              aria-label="Close"
            >
              <X size={18} />
            </button>
            <h2 className="text-lg font-[--font-unica] text-cosmic-gold mb-4">
              Choose a size
            </h2>
            {loading && (
              <p className="text-cosmic-fog">Loading...</p>
            )}
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
                    {size.sizes?.name ?? `${size.sizes?.volume_ml ?? 0}ml`}
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
