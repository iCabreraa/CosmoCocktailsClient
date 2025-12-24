"use client";

import { useEffect, useState } from "react";
import {
  CheckCircle,
  Package,
  Home,
  ShoppingBag,
  Receipt,
} from "lucide-react";
import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";

type SuccessSummary = {
  orderId: string;
  orderRef?: string;
  orderDate?: string;
  items?: Array<{
    cocktail_name: string;
    size_name: string;
    quantity: number;
    item_total?: number;
  }>;
  subtotal?: number;
  vat_amount?: number;
  shipping_cost?: number;
  total?: number;
};

const STORAGE_KEY = "checkout-success";

export default function CheckoutSuccess() {
  const [orderId, setOrderId] = useState<string | null>(null);
  const [orderRef, setOrderRef] = useState<string | null>(null);
  const [summary, setSummary] = useState<SuccessSummary | null>(null);
  const { t, language } = useLanguage();

  useEffect(() => {
    // Obtener el ID del pedido de la URL o localStorage
    const urlParams = new URLSearchParams(window.location.search);
    const orderIdFromUrl = urlParams.get("order_id");
    const orderRefFromUrl = urlParams.get("order_ref");

    if (orderIdFromUrl) {
      setOrderId(orderIdFromUrl);
      setOrderRef(orderRefFromUrl);
    }

    try {
      const stored = sessionStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as SuccessSummary;
        if (!orderIdFromUrl || parsed.orderId === orderIdFromUrl) {
          setSummary(parsed);
        }
        sessionStorage.removeItem(STORAGE_KEY);
      }
    } catch (error) {
      console.warn("Failed to load checkout summary:", error);
    }
  }, []);

  const getDeliveryRange = () => {
    const baseDate = summary?.orderDate
      ? new Date(summary.orderDate)
      : new Date();
    const minDate = new Date(baseDate);
    minDate.setDate(minDate.getDate() + 1);
    const maxDate = new Date(baseDate);
    maxDate.setDate(maxDate.getDate() + 2);

    const locale = language === "nl" ? "nl-NL" : language === "en" ? "en-US" : "es-ES";
    const format = (date: Date) =>
      date.toLocaleDateString(locale, {
        day: "2-digit",
        month: "short",
      });

    return `${format(minDate)} · ${format(maxDate)}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-6">
      <div className="max-w-2xl w-full">
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 text-center">
          {/* Success Icon */}
          <div className="mb-6">
            <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-12 h-12 text-green-400" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">
              {t("checkout.success.title")}
            </h1>
            <p className="text-purple-300 text-lg">
              {t("checkout.success.subtitle")}
            </p>
          </div>

          {/* Order Details */}
          <div className="bg-white/5 rounded-xl p-6 mb-6">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Package className="w-5 h-5 text-purple-400" />
              <h2 className="text-xl font-semibold text-white">
                {t("checkout.success.order_details_title")}
              </h2>
            </div>

            <div className="space-y-2 text-sm text-purple-300">
              {orderId && (
                <div>
                  <span className="font-medium">
                    {t("checkout.success.order_id_label")}
                  </span>{" "}
                  {orderId}
                </div>
              )}
              {(orderRef || summary?.orderRef) && (
                <div>
                  <span className="font-medium">
                    {t("checkout.order_number")}:
                  </span>{" "}
                  {orderRef || summary?.orderRef}
                </div>
              )}
              <div>
                <span className="font-medium">
                  {t("checkout.estimated_delivery")}:
                </span>{" "}
                {getDeliveryRange()}
              </div>
            </div>

            <div className="text-sm text-purple-300">
              {t("checkout.success.confirmation_note")}
            </div>
          </div>

          {/* Order Summary */}
          <div className="bg-white/5 rounded-xl p-6 mb-6 text-left">
            <div className="flex items-center gap-2 mb-4">
              <Receipt className="w-5 h-5 text-purple-400" />
              <h2 className="text-lg font-semibold text-white">
                {t("checkout.success.summary_title")}
              </h2>
            </div>

            {summary?.items?.length ? (
              <div className="space-y-4">
                <div className="space-y-3">
                  {summary.items.map((item, index) => (
                    <div
                      key={`${item.cocktail_name}-${index}`}
                      className="flex items-center justify-between text-sm text-purple-200"
                    >
                      <div>
                        <div className="font-medium text-white">
                          {item.cocktail_name}
                        </div>
                        <div className="text-xs text-purple-300">
                          {item.size_name} · {t("order.quantity")}:{" "}
                          {item.quantity}
                        </div>
                      </div>
                      <div className="text-purple-100">
                        €{Number(item.item_total || 0).toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t border-white/10 pt-3 space-y-2 text-sm text-purple-200">
                  <div className="flex items-center justify-between">
                    <span>{t("checkout.subtotal")}</span>
                    <span>€{Number(summary.subtotal || 0).toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>{t("checkout.vat")} (21%)</span>
                    <span>€{Number(summary.vat_amount || 0).toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>{t("checkout.shipping")}</span>
                    <span>
                      {summary.shipping_cost
                        ? `€${Number(summary.shipping_cost).toFixed(2)}`
                        : t("checkout.free")}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-white font-semibold">
                    <span>{t("checkout.total")}</span>
                    <span>€{Number(summary.total || 0).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-sm text-purple-300">
                {t("checkout.success.summary_empty")}
              </p>
            )}
          </div>

          {/* Next Steps */}
          <div className="bg-white/5 rounded-xl p-6 mb-8">
            <h3 className="text-lg font-semibold text-white mb-4">
              {t("checkout.success.next_steps_title")}
            </h3>
            <div className="space-y-3 text-left">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-purple-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-purple-400">1</span>
                </div>
                <div>
                  <p className="text-white font-medium">
                    {t("checkout.success.step1_title")}
                  </p>
                  <p className="text-purple-300 text-sm">
                    {t("checkout.success.step1_description")}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-purple-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-purple-400">2</span>
                </div>
                <div>
                  <p className="text-white font-medium">
                    {t("checkout.success.step2_title")}
                  </p>
                  <p className="text-purple-300 text-sm">
                    {t("checkout.success.step2_description")}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-purple-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-purple-400">3</span>
                </div>
                <div>
                  <p className="text-white font-medium">
                    {t("checkout.success.step3_title")}
                  </p>
                  <p className="text-purple-300 text-sm">
                    {t("checkout.success.step3_description")}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {orderId && (
              <Link
                href={`/order/${orderId}`}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-medium rounded-lg transition-all duration-200 border border-white/20"
              >
                <Package className="w-4 h-4" />
                {t("checkout.success.view_order")}
              </Link>
            )}
            <Link
              href="/account?tab=orders"
              className="flex items-center justify-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-medium rounded-lg transition-all duration-200 border border-white/20"
            >
              <Receipt className="w-4 h-4" />
              {t("checkout.success.view_orders")}
            </Link>
            <Link
              href="/shop"
              className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium rounded-lg transition-all duration-200"
            >
              <ShoppingBag className="w-4 h-4" />
              {t("checkout.success.continue_shopping")}
            </Link>

            <Link
              href="/"
              className="flex items-center justify-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-medium rounded-lg transition-all duration-200 border border-white/20"
            >
              <Home className="w-4 h-4" />
              {t("checkout.success.go_home")}
            </Link>
          </div>

          {/* Support Info */}
          <div className="mt-8 pt-6 border-t border-white/10">
            <p className="text-sm text-purple-300">
              {t("checkout.success.support_text")}{" "}
              <a
                href="mailto:support@cosmococktails.com"
                className="text-purple-400 hover:text-purple-300 underline"
              >
                {t("checkout.success.contact_us")}
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
