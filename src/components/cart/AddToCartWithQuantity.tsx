"use client";

import { useState } from "react";
import { Product } from "@/types";
import { useCart } from "@/store/cart";
import { Minus, Plus, ShoppingCart } from "lucide-react";

export default function AddToCartWithQuantity({
  product,
}: {
  product: Product;
}) {
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
        onClick={() => addToCart(product, qty)}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-cosmic-gold text-cosmic-gold hover:bg-cosmic-gold hover:text-black focus:outline-none focus:ring-2 focus:ring-cosmic-gold transition-all text-sm"
      >
        <ShoppingCart className="w-4 h-4" />
        Add to Cart
      </button>
    </div>
  );
}
