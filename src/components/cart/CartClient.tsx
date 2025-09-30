"use client";
import CartItem from "./CartItem";
import { useCart } from "@/store/cart";
import Link from "next/link";
import { ShoppingCart, Trash2 } from "lucide-react";

export default function CartClient() {
  const {
    items,
    subtotal,
    vat_amount,
    shipping_cost,
    total,
    item_count,
    clearCart,
    isLoading,
    error,
  } = useCart();

  if (isLoading) {
    return (
      <main className="py-20 px-6 min-h-[70vh] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cosmic-gold mx-auto mb-4"></div>
          <p className="text-cosmic-fog">Loading cart...</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="py-20 px-6 min-h-[70vh] flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">Error loading cart: {error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-cosmic-gold text-black rounded-full hover:bg-cosmic-gold/80 transition"
          >
            Retry
          </button>
        </div>
      </main>
    );
  }

  if (items.length === 0) {
    return (
      <main className="py-20 px-6 min-h-[70vh] flex items-center justify-center">
        <div className="text-center">
          <ShoppingCart className="w-16 h-16 text-cosmic-fog mx-auto mb-4" />
          <h1 className="text-3xl font-[--font-unica] text-cosmic-text mb-2">
            Your cart is empty
          </h1>
          <p className="text-cosmic-fog mb-6">
            Add some delicious cocktails to get started!
          </p>
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-cosmic-gold text-black hover:bg-cosmic-gold/80 transition font-medium"
          >
            <ShoppingCart className="w-4 h-4" />
            Start Shopping
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="py-20 px-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-[--font-unica] text-cosmic-gold mb-2">
          Shopping Cart
        </h1>
        <p className="text-cosmic-fog">
          {item_count} {item_count === 1 ? "item" : "items"} in your cart
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Items List */}
        <div className="lg:col-span-2">
          <div className="bg-white/5 backdrop-blur-sm rounded-lg p-6 border border-cosmic-gold/10">
            {items.map((item, index) => (
              <CartItem
                key={`${item.cocktail_id}-${item.sizes_id}-${index}`}
                item={item}
              />
            ))}
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white/5 backdrop-blur-sm rounded-lg p-6 border border-cosmic-gold/10 sticky top-6">
            <h2 className="text-xl font-[--font-unica] text-cosmic-gold mb-4">
              Order Summary
            </h2>

            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-cosmic-text">
                <span>Subtotal ({item_count} items)</span>
                <span>€{subtotal.toFixed(2)}</span>
              </div>

              <div className="flex justify-between text-cosmic-text">
                <span>VAT (21%)</span>
                <span>€{vat_amount.toFixed(2)}</span>
              </div>

              <div className="flex justify-between text-cosmic-text">
                <span>Shipping</span>
                <span>
                  {shipping_cost > 0 ? `€${shipping_cost.toFixed(2)}` : "Free"}
                </span>
              </div>

              <div className="border-t border-cosmic-fog/30 pt-3">
                <div className="flex justify-between text-lg font-semibold text-cosmic-gold">
                  <span>Total</span>
                  <span>€{total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <Link
                href="/checkout"
                className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-cosmic-gold text-black hover:bg-cosmic-gold/80 transition font-medium"
              >
                <ShoppingCart className="w-4 h-4" />
                Proceed to Checkout
              </Link>

              <button
                onClick={clearCart}
                className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full border border-red-500 text-red-500 hover:bg-red-500 hover:text-white transition"
              >
                <Trash2 className="w-4 h-4" />
                Clear Cart
              </button>
            </div>

            {shipping_cost > 0 && (
              <p className="text-xs text-cosmic-fog mt-4 text-center">
                Free shipping on orders over €50
              </p>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
