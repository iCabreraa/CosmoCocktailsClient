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
    <div className="flex items-center gap-2 mt-3">
      <div className="flex items-center border border-cosmic-gold rounded">
        <button
          type="button"
          onClick={decrease}
          className="px-2 py-1 hover:bg-cosmic-gold hover:text-black focus:outline-none focus:ring-2 focus:ring-cosmic-gold transition"
          aria-label="Decrease quantity"
        >
          <Minus size={12} />
        </button>
        <span className="px-2 min-w-4 text-center">{qty}</span>
        <button
          type="button"
          onClick={increase}
          className="px-2 py-1 hover:bg-cosmic-gold hover:text-black focus:outline-none focus:ring-2 focus:ring-cosmic-gold transition"
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
          });
          notify({
            type: "success",
            title: t("feedback.cart_added_title"),
            message: t("feedback.cart_added_message", { name: cocktailName }),
          });
        }}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-cosmic-gold text-cosmic-gold hover:bg-cosmic-gold hover:text-black focus:outline-none focus:ring-2 focus:ring-cosmic-gold transition-all text-sm"
      >
        <ShoppingCart className="w-4 h-4" />
        {t("shop.add_to_cart")}
      </button>
    </div>
  );
}
