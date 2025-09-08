"use client";

import { useCart } from "@/store/cart";
import { useState } from "react";

const VAT_RATE = 0.21; // 21% IVA
const SHIPPING_COST = 4.99; // example flat shipping

export default function CheckoutClient() {
  const items = useCart(state => state.items);
  const clearCart = useCart(state => state.clearCart);

  const subtotal = items.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );
  const vat = subtotal * VAT_RATE;
  const total = subtotal + vat + SHIPPING_COST;

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    address1: "",
    address2: "",
    city: "",
    state: "",
    zip: "",
    country: "",
  });

  function handleChange(field: string, value: string) {
    setForm(prev => ({ ...prev, [field]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    alert("Order submitted! (Payment processing pending)");
    clearCart();
  }

  if (items.length === 0) {
    return (
      <main className="py-20 px-6 min-h-[70vh] flex items-center justify-center">
        <h1 className="text-3xl font-[--font-unica] text-cosmic-fog">
          Your cart is empty
        </h1>
      </main>
    );
  }

  return (
    <main className="py-20 px-6">
      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10">
        {/* Left column: form */}
        <div className="md:col-span-2 space-y-6">
          <h1 className="text-3xl font-[--font-unica] text-cosmic-gold">
            Checkout
          </h1>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              required
              placeholder="Full name"
              className="w-full bg-transparent border border-cosmic-fog rounded-md p-3"
              value={form.name}
              onChange={e => handleChange("name", e.target.value)}
            />
            <input
              type="email"
              required
              placeholder="Email"
              className="w-full bg-transparent border border-cosmic-fog rounded-md p-3"
              value={form.email}
              onChange={e => handleChange("email", e.target.value)}
            />
            <input
              type="tel"
              required
              placeholder="Phone"
              className="w-full bg-transparent border border-cosmic-fog rounded-md p-3"
              value={form.phone}
              onChange={e => handleChange("phone", e.target.value)}
            />
            <input
              type="text"
              required
              placeholder="Address line 1"
              className="w-full bg-transparent border border-cosmic-fog rounded-md p-3"
              value={form.address1}
              onChange={e => handleChange("address1", e.target.value)}
            />
            <input
              type="text"
              placeholder="Address line 2"
              className="w-full bg-transparent border border-cosmic-fog rounded-md p-3"
              value={form.address2}
              onChange={e => handleChange("address2", e.target.value)}
            />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <input
                type="text"
                required
                placeholder="City"
                className="w-full bg-transparent border border-cosmic-fog rounded-md p-3"
                value={form.city}
                onChange={e => handleChange("city", e.target.value)}
              />
              <input
                type="text"
                required
                placeholder="ZIP"
                className="w-full bg-transparent border border-cosmic-fog rounded-md p-3"
                value={form.zip}
                onChange={e => handleChange("zip", e.target.value)}
              />
            </div>
            <input
              type="text"
              required
              placeholder="Country"
              className="w-full bg-transparent border border-cosmic-fog rounded-md p-3"
              value={form.country}
              onChange={e => handleChange("country", e.target.value)}
            />
            <button
              type="submit"
              className="px-6 py-3 rounded-full border border-cosmic-gold text-cosmic-gold hover:bg-cosmic-gold hover:text-black transition"
            >
              Continue to Payment
            </button>
          </form>
        </div>

        {/* Right column: summary */}
        <div className="md:col-span-1 bg-white/5 backdrop-blur-md border border-cosmic-gold/10 rounded-lg p-4 space-y-4 h-fit">
          <h2 className="text-xl font-[--font-josefin] text-cosmic-text">
            Order Summary
          </h2>
          <div className="divide-y divide-cosmic-fog/20 text-sm">
            {items.map(item => (
              <div key={item.id} className="flex justify-between py-2">
                <span>
                  {item.name} x{item.quantity}
                </span>
                <span>€{(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>
          <div className="space-y-1 text-sm pt-2">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>€{subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>VAT (21%)</span>
              <span>€{vat.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping</span>
              <span>€{SHIPPING_COST.toFixed(2)}</span>
            </div>
            <hr className="my-1 border-cosmic-fog/20" />
            <div className="flex justify-between font-[--font-josefin] text-base">
              <span>Total</span>
              <span>€{total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
