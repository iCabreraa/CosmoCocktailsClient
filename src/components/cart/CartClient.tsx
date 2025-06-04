"use client";
import CartItem from "./CartItem";
import { useCart } from "@/store/cart";

export default function CartClient() {
  const items = useCart((state) => state.items);
  const clearCart = useCart((state) => state.clearCart);
  const total = items.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );

  if (items.length === 0) {
    return (
      <main className="py-20 px-6">
        <h1 className="text-center text-3xl font-[--font-unica] text-[#D8DAE3]">
          Your cart is empty
        </h1>
      </main>
    );
  }

  return (
    <main className="py-20 px-6 max-w-3xl mx-auto">
      {items.map((item) => (
        <CartItem key={item.id} item={item} />
      ))}
      <div className="flex justify-between items-center mt-6">
        <span className="text-lg font-[--font-josefin] text-cosmic-text">
          Total: €{total.toFixed(2)}
        </span>
        <button
          onClick={clearCart}
          className="px-5 py-2 rounded-full border border-cosmic-gold text-cosmic-gold hover:bg-cosmic-gold hover:text-black transition"
        >
          Clear Cart
        </button>
      </div>
    </main>
  );
}
