"use client";

import Image from "next/image";
import { Minus, Plus, Trash2 } from "lucide-react";
import { useCart } from "@/store/cart";
import { CartItem as CartItemType } from "@/types/shared";

interface CartItemProps {
  item: CartItemType;
}

export default function CartItem({ item }: CartItemProps) {
  const remove = useCart(state => state.removeFromCart);
  const update = useCart(state => state.updateQuantity);

  // Validación de datos para prevenir errores
  const safePrice = item.unit_price || 0;
  const safeImage = item.image_url || "/images/default-cocktail.webp";
  const safeName = item.cocktail_name || "Unknown Cocktail";

  return (
    <div className="flex items-center gap-4 py-4 border-b border-cosmic-fog/30">
      <div className="relative w-20 h-20 flex-shrink-0">
        <Image
          src={safeImage}
          alt={safeName}
          fill
          className="object-cover rounded-md"
          sizes="80px"
        />
      </div>
      <div className="flex-1">
        <h3 className="font-[--font-josefin] text-cosmic-text">{safeName}</h3>
        <p className="text-sm text-cosmic-fog">
          {item.size_name} - €{safePrice.toFixed(2)}
        </p>
        <div className="flex items-center gap-2 mt-2">
          <button
            onClick={() =>
              update(
                item.cocktail_id,
                item.sizes_id,
                Math.max(1, item.quantity - 1)
              )
            }
            className="p-1 border border-cosmic-fog rounded hover:bg-cosmic-gold hover:text-black transition"
            aria-label="Decrease quantity"
          >
            <Minus size={12} />
          </button>
          <span className="px-2 min-w-[2rem] text-center">{item.quantity}</span>
          <button
            onClick={() =>
              update(item.cocktail_id, item.sizes_id, item.quantity + 1)
            }
            className="p-1 border border-cosmic-fog rounded hover:bg-cosmic-gold hover:text-black transition"
            aria-label="Increase quantity"
          >
            <Plus size={12} />
          </button>
        </div>
      </div>
      <div className="text-right">
        <p className="font-semibold text-cosmic-gold">
          €{(item.item_total || 0).toFixed(2)}
        </p>
        <button
          onClick={() => remove(item.cocktail_id, item.sizes_id)}
          className="text-cosmic-fog hover:text-red-600 transition mt-1"
          aria-label="Remove from cart"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
}
