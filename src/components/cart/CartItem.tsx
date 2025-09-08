"use client";

import Image from "next/image";
import { Minus, Plus, Trash2 } from "lucide-react";
import { useCart } from "@/store/cart";
import { Product } from "@/types";

interface CartItemProps {
  item: Product & { quantity: number };
}

export default function CartItem({ item }: CartItemProps) {
  const remove = useCart(state => state.removeFromCart);
  const update = useCart(state => state.updateQuantity);

  return (
    <div className="flex items-center gap-4 py-4 border-b border-cosmic-fog/30">
      <div className="relative w-20 h-20 flex-shrink-0">
        <Image
          src={item.image}
          alt={item.name}
          fill
          className="object-cover rounded-md"
        />
      </div>
      <div className="flex-1">
        <h3 className="font-[--font-josefin] text-cosmic-text">{item.name}</h3>
        <p className="text-sm text-cosmic-fog">€{item.price.toFixed(2)}</p>
        <div className="flex items-center gap-2 mt-2">
          <button
            onClick={() => update(item.id, Math.max(1, item.quantity - 1))}
            className="p-1 border border-cosmic-fog rounded hover:bg-cosmic-gold hover:text-black transition"
          >
            <Minus size={12} />
          </button>
          <span className="px-2">{item.quantity}</span>
          <button
            onClick={() => update(item.id, item.quantity + 1)}
            className="p-1 border border-cosmic-fog rounded hover:bg-cosmic-gold hover:text-black transition"
          >
            <Plus size={12} />
          </button>
        </div>
      </div>
      <button
        onClick={() => remove(item.id)}
        className="text-cosmic-fog hover:text-red-600 transition"
        aria-label="Remove from cart"
      >
        <Trash2 />
      </button>
    </div>
  );
}
