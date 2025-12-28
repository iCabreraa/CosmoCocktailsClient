"use client";

import { useState } from "react";
import { useCart } from "@/store/cart";
import { Minus, Plus, ShoppingCart } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/components/feedback/ToastProvider";

interface AddToCartProps {
  cocktailId: string;
  cocktailName: string;
  cocktailImage: string;
  sizeId: string;
  sizeName: string;
  volumeMl: number;
  price: number;
  cocktailSizeId: string; // ID de la tabla cocktail_sizes
  isAlcoholic?: boolean;
}

export default function AddToCartWithQuantity({
  cocktailId,
  cocktailName,
  cocktailImage,
  sizeId,
  sizeName,
  volumeMl,
  price,
  cocktailSizeId,
  isAlcoholic = false,
}: AddToCartProps) {
  const { t } = useLanguage();
  const { notify } = useToast();
  const [qty, setQty] = useState(1);
  const addToCart = useCart(state => state.addToCart);

  function increase() {
    setQty(q => q + 1);
  }

  function decrease() {
    setQty(q => Math.max(1, q - 1));
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="flex items-center gap-1 rounded-full border border-cosmic-gold/30 bg-black/40 px-2 py-1">
        <button
          type="button"
          onClick={decrease}
          className="flex h-7 w-7 items-center justify-center rounded-full border border-cosmic-gold/30 text-cosmic-gold/90 transition hover:border-cosmic-gold hover:bg-cosmic-gold/20 hover:text-white focus:outline-none focus:ring-2 focus:ring-cosmic-gold/60"
          aria-label="Decrease quantity"
        >
          <Minus size={12} />
        </button>
        <span className="min-w-6 text-center text-sm text-cosmic-gold">
          {qty}
        </span>
        <button
          type="button"
          onClick={increase}
          className="flex h-7 w-7 items-center justify-center rounded-full border border-cosmic-gold/30 text-cosmic-gold/90 transition hover:border-cosmic-gold hover:bg-cosmic-gold/20 hover:text-white focus:outline-none focus:ring-2 focus:ring-cosmic-gold/60"
          aria-label="Increase quantity"
        >
          <Plus size={12} />
        </button>
      </div>
      <button
        onClick={() => {
          addToCart({
            cocktail_id: cocktailId,
            sizes_id: sizeId,
            quantity: qty,
            unit_price: price,
            cocktail_name: cocktailName,
            size_name: sizeName,
            volume_ml: volumeMl,
            image_url: cocktailImage,
            is_alcoholic: isAlcoholic,
          });
          notify({
            type: "success",
            title: t("feedback.cart_added_title"),
            message: t("feedback.cart_added_message", { name: cocktailName }),
          });
        }}
        className="inline-flex items-center gap-2 rounded-full border border-cosmic-gold/40 bg-white/5 px-4 py-2 text-[11px] uppercase tracking-[0.2em] text-cosmic-gold transition hover:border-cosmic-gold hover:bg-cosmic-gold/15 hover:text-white focus:outline-none focus:ring-2 focus:ring-cosmic-gold/60"
      >
        <ShoppingCart className="h-4 w-4" />
        {t("shop.add_to_cart")}
      </button>
    </div>
  );
}
