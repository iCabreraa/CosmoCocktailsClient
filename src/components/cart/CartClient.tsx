"use client";
import CartItem from "./CartItem";
import { useCart } from "@/store/cart";
import Link from "next/link";
import { ShoppingCart, Trash2 } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useState } from "react";
import PrivacyModal from "@/components/privacy/PrivacyModal";

export default function CartClient() {
  const { t, isInitialized } = useLanguage();
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
    hasHydrated,
    privacyAccepted,
    setPrivacyAccepted,
  } = useCart();
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);

  // Wait for language context to be initialized
  if (!isInitialized || !hasHydrated) {
    return (
      <main className="py-20 px-6 min-h-[70vh] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cosmic-gold mx-auto mb-4"></div>
          <p className="text-cosmic-fog">{t("cart.loading")}</p>
        </div>
      </main>
    );
  }

  if (isLoading) {
    return (
      <main className="py-20 px-6 min-h-[70vh] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cosmic-gold mx-auto mb-4"></div>
          <p className="text-cosmic-fog">{t("cart.loading_cart")}</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="py-20 px-6 min-h-[70vh] flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">
            {t("cart.error_loading")}: {error}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-cosmic-gold text-black rounded-full hover:bg-cosmic-gold/80 transition"
          >
            {t("cart.retry")}
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
            {t("cart.empty_title")}
          </h1>
          <p className="text-cosmic-fog mb-6">{t("cart.empty_subtitle")}</p>
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-cosmic-gold text-black hover:bg-cosmic-gold/80 transition font-medium"
          >
            <ShoppingCart className="w-4 h-4" />
            {t("cart.start_shopping")}
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="py-20 px-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-[--font-unica] text-cosmic-gold mb-2">
          {t("cart.title")}
        </h1>
        <p className="text-cosmic-fog">
          {item_count}{" "}
          {item_count === 1 ? t("cart.item_singular") : t("cart.item_plural")}{" "}
          {t("cart.in_cart")}
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
              {t("cart.order_summary")}
            </h2>

            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-cosmic-text">
                <span>
                  {t("cart.subtotal")} ({item_count}{" "}
                  {item_count === 1
                    ? t("cart.item_singular")
                    : t("cart.item_plural")}
                  )
                </span>
                <span>€{subtotal.toFixed(2)}</span>
              </div>

              <div className="flex justify-between text-cosmic-text">
                <span>{t("cart.tax")} (21%)</span>
                <span>€{vat_amount.toFixed(2)}</span>
              </div>

              <div className="flex justify-between text-cosmic-text">
                <span>{t("cart.shipping")}</span>
                <span>
                  {shipping_cost > 0
                    ? `€${shipping_cost.toFixed(2)}`
                    : t("cart.free_shipping")}
                </span>
              </div>

              <div className="border-t border-cosmic-fog/30 pt-3">
                <div className="flex justify-between text-lg font-semibold text-cosmic-gold">
                  <span>{t("cart.total")}</span>
                  <span>€{total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <label className="flex items-start gap-2 text-sm text-cosmic-fog">
                <input
                  type="checkbox"
                  checked={privacyAccepted}
                  onChange={e => setPrivacyAccepted(e.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-cosmic-fog/50 bg-transparent text-cosmic-gold focus:ring-cosmic-gold"
                />
                <span>
                  {t("checkout.privacy_consent_prefix")}{" "}
                  <button
                    type="button"
                    onClick={() => setIsPrivacyOpen(true)}
                    className="text-cosmic-gold hover:text-cosmic-gold/80 underline"
                  >
                    {t("checkout.privacy_policy")}
                  </button>
                  {t("checkout.privacy_consent_suffix")}
                </span>
              </label>
              {!privacyAccepted && (
                <p className="text-xs text-red-400">
                  {t("checkout.privacy_consent_required")}
                </p>
              )}

              {privacyAccepted ? (
                <Link
                  href="/checkout"
                  className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-cosmic-gold text-black hover:bg-cosmic-gold/80 transition font-medium"
                >
                  <ShoppingCart className="w-4 h-4" />
                  {t("cart.checkout_button")}
                </Link>
              ) : (
                <button
                  type="button"
                  disabled
                  className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-cosmic-gold/40 text-black/50 cursor-not-allowed font-medium"
                >
                  <ShoppingCart className="w-4 h-4" />
                  {t("cart.checkout_button")}
                </button>
              )}

              <button
                onClick={clearCart}
                className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full border border-red-500 text-red-500 hover:bg-red-500 hover:text-white transition"
              >
                <Trash2 className="w-4 h-4" />
                {t("cart.clear_cart")}
              </button>
            </div>

            {shipping_cost > 0 && (
              <p className="text-xs text-cosmic-fog mt-4 text-center">
                {t("cart.free_shipping_note")}
              </p>
            )}
          </div>
        </div>
      </div>

      <PrivacyModal
        isOpen={isPrivacyOpen}
        onClose={() => setIsPrivacyOpen(false)}
      />
    </main>
  );
}
