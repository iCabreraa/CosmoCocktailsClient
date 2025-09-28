"use client";

import { useCart } from "@/store/cart";
import { ShoppingCart } from "lucide-react";

export default function TestAddToCartButton() {
  const addToCart = useCart(state => state.addToCart);

  const handleTestAdd = () => {
    console.log("Testing add to cart...");
    addToCart({
      cocktail_id: "test-1",
      sizes_id: "test-size-1",
      quantity: 1,
      unit_price: 12.99,
      cocktail_name: "Test Cocktail",
      size_name: "Large",
      volume_ml: 300,
      image_url: "/images/default-cocktail.webp",
    });
    console.log("Added to cart!");
  };

  return (
    <button
      onClick={handleTestAdd}
      className="mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-full border border-cosmic-gold text-cosmic-gold hover:bg-cosmic-gold hover:text-black focus:outline-none focus:ring-2 focus:ring-cosmic-gold transition-all text-sm"
    >
      <ShoppingCart className="w-4 h-4" />
      TEST Add to Cart
    </button>
  );
}
