"use client";

import { useCart } from "@/store/cart";
import { Product } from "@/types";
import { ShoppingCart } from "lucide-react";

export default function AddToCartButton({ product }: { product: Product }) {
  const addToCart = useCart((state) => state.addToCart);
  return (
    <button
      onClick={() => addToCart(product)}
      className="mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-full border border-cosmic-gold text-cosmic-gold hover:bg-cosmic-gold hover:text-black transition-all text-sm"
    >
      <ShoppingCart className="w-4 h-4" />
      Add to Cart
    </button>
  );
}
