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
import { useAuthUnified } from "@/hooks/useAuthUnified";
import { createClient } from "@/lib/supabase/client";
import { fromOrderItemRow, orderItemSelect } from "@/types/order-item-utils";

type SuccessSummary = {
  orderId: string;
  orderRef?: string;
  orderDate?: string;
  storedAt?: number;
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
const VAT_RATE = 0.21;
const SHIPPING_THRESHOLD = 50;
const SHIPPING_COST = 4.99;
const SUMMARY_TTL_MS = 2 * 60 * 60 * 1000;

export default function CheckoutSuccess() {
  const [orderId, setOrderId] = useState<string | null>(null);
  const [orderRef, setOrderRef] = useState<string | null>(null);
  const [paymentIntent, setPaymentIntent] = useState<string | null>(null);
  const [summary, setSummary] = useState<SuccessSummary | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const { t, language } = useLanguage();
  const { user } = useAuthUnified();

  useEffect(() => {
    // Obtener el ID del pedido de la URL o localStorage
    const urlParams = new URLSearchParams(window.location.search);
    const orderIdFromUrl = urlParams.get("order_id");
    const orderRefFromUrl = urlParams.get("order_ref");
    const paymentIntentFromUrl = urlParams.get("payment_intent");
    const clientSecretFromUrl = urlParams.get("payment_intent_client_secret");

    if (orderIdFromUrl) {
      setOrderId(orderIdFromUrl);
    }
    if (orderRefFromUrl) {
      setOrderRef(orderRefFromUrl);
    }
    if (paymentIntentFromUrl) {
      setPaymentIntent(paymentIntentFromUrl);
    }

    if (clientSecretFromUrl) {
      urlParams.delete("payment_intent_client_secret");
      const query = urlParams.toString();
      const cleanUrl = query
        ? `${window.location.pathname}?${query}`
        : window.location.pathname;
      window.history.replaceState({}, document.title, cleanUrl);
    }

    try {
      const stored = sessionStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as SuccessSummary;
        const isFresh =
          typeof parsed.storedAt === "number"
            ? Date.now() - parsed.storedAt < SUMMARY_TTL_MS
            : true;

        if (isFresh && (!orderIdFromUrl || parsed.orderId === orderIdFromUrl)) {
          setSummary(parsed);
          if (!orderIdFromUrl && parsed.orderId) {
            setOrderId(parsed.orderId);
          }
          if (!orderRefFromUrl && parsed.orderRef) {
            setOrderRef(parsed.orderRef);
          }
        }
        if (!isFresh) {
          sessionStorage.removeItem(STORAGE_KEY);
        }
      }
    } catch (error) {
      console.warn("Failed to load checkout summary:", error);
    }
  }, []);

  useEffect(() => {
    if (!orderId || summary || !user) return;

    const fetchSummary = async () => {
      try {
        const supabase = createClient();
        const { data: order, error: orderError } = await supabase
          .from("orders")
          .select("id, order_ref, total_amount, order_date")
          .eq("id", orderId)
          .single();

        if (orderError || !order) {
          return;
        }

        const orderData = order as {
          id: string;
          order_ref: string | null;
          total_amount: number | null;
          order_date: string | null;
        };

        const { data: itemsData } = await supabase
          .from("order_items")
          .select(orderItemSelect)
          .eq("order_id", orderId);

        const items = (itemsData || []).map((row: any) =>
          fromOrderItemRow(row)
        );
        const subtotal = items.reduce(
          (sum: number, item: any) => sum + Number(item.item_total || 0),
          0
        );
        const vat_amount = subtotal * VAT_RATE;
        const shipping_cost = subtotal >= SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;
        const total =
          orderData.total_amount ?? subtotal + vat_amount + shipping_cost;

        setSummary({
          orderId: orderData.id,
          orderRef: orderData.order_ref ?? undefined,
          orderDate: orderData.order_date ?? undefined,
          items: items.map((item: any) => ({
            cocktail_name: item.cocktail_name,
            size_name: item.size_name,
            quantity: item.quantity,
            item_total: item.item_total,
          })),
          subtotal,
          vat_amount,
          shipping_cost,
          total,
        });
      } catch (error) {
        console.warn("Failed to fetch order summary:", error);
      }
    };

    fetchSummary();
  }, [orderId, summary, user]);

  useEffect(() => {
    if (!user) return;
    if (summary || summaryLoading) return;
    if (!orderId && !paymentIntent) return;

    const controller = new AbortController();

    const fetchSummary = async () => {
      setSummaryLoading(true);
      try {
        const params = new URLSearchParams();
        if (orderId) {
          params.set("order_id", orderId);
        }
        if (orderRef) {
          params.set("order_ref", orderRef);
        }
        if (paymentIntent) {
          params.set("payment_intent", paymentIntent);
        }

        const response = await fetch(`/api/order-summary?${params.toString()}`, {
          signal: controller.signal,
        });

        if (!response.ok) {
          return;
        }

        const data = (await response.json()) as SuccessSummary;
        if (!controller.signal.aborted) {
          setSummary(data);
          if (!orderId && data.orderId) {
            setOrderId(data.orderId);
          }
          if (!orderRef && data.orderRef) {
            setOrderRef(data.orderRef);
          }
        }
      } catch (error) {
        if (!controller.signal.aborted) {
          console.warn("Failed to fetch order summary:", error);
        }
      } finally {
        if (!controller.signal.aborted) {
          setSummaryLoading(false);
        }
      }
    };

    fetchSummary();
    return () => controller.abort();
  }, [orderId, orderRef, paymentIntent, summary, summaryLoading, user]);

  const getDeliveryRange = () => {
    const baseDate = summary?.orderDate
      ? new Date(summary.orderDate)
      : new Date();
    const minDate = new Date(baseDate);
    minDate.setDate(minDate.getDate() + 1);
    const maxDate = new Date(baseDate);
    maxDate.setDate(maxDate.getDate() + 2);

    const locale =
      language === "nl" ? "nl-NL" : language === "en" ? "en-US" : "es-ES";
    const format = (date: Date) =>
      date.toLocaleDateString(locale, {
        day: "2-digit",
        month: "short",
      });

    return `${format(minDate)} · ${format(maxDate)}`;
  };

  return (
    <main className="px-6 py-24">
      <div className="max-w-4xl mx-auto">
          <div className="rounded-2xl border border-cosmic-gold/20 bg-cosmic-bg/40 p-8 text-center shadow-[0_0_40px_rgba(209,184,127,0.12)] backdrop-blur">
          {/* Success Icon */}
          <div className="mb-6">
            <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-12 h-12 text-green-400" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">
              {t("checkout.success.title")}
            </h1>
            <p className="text-cosmic-fog text-lg">
              {t("checkout.success.subtitle")}
            </p>
          </div>

          {/* Order Details */}
          <div className="bg-white/5 rounded-xl p-6 mb-6 border border-cosmic-gold/10">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Package className="w-5 h-5 text-cosmic-gold" />
              <h2 className="text-xl font-semibold text-white">
                {t("checkout.success.order_details_title")}
              </h2>
            </div>

            <div className="space-y-2 text-sm text-cosmic-fog">
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

            <div className="text-sm text-cosmic-fog">
              {t("checkout.success.confirmation_note")}
            </div>
          </div>

          {/* Order Summary */}
          <div className="bg-white/5 rounded-xl p-6 mb-6 text-left border border-cosmic-gold/10">
            <div className="flex items-center gap-2 mb-4">
              <Receipt className="w-5 h-5 text-cosmic-gold" />
              <h2 className="text-lg font-semibold text-white">
                {t("checkout.success.summary_title")}
              </h2>
            </div>

            {summaryLoading ? (
              <p className="text-sm text-cosmic-fog">{t("checkout.loading")}</p>
            ) : summary?.items?.length ? (
              <div className="space-y-4">
                <div className="space-y-3">
                  {summary.items.map((item, index) => (
                    <div
                      key={`${item.cocktail_name}-${index}`}
                      className="flex items-center justify-between text-sm text-cosmic-fog"
                    >
                      <div>
                        <div className="font-medium text-white">
                          {item.cocktail_name}
                        </div>
                        <div className="text-xs text-cosmic-fog">
                          {item.size_name} · {t("order.quantity")}:{" "}
                          {item.quantity}
                        </div>
                      </div>
                      <div className="text-cosmic-fog">
                        €{Number(item.item_total || 0).toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t border-white/10 pt-3 space-y-2 text-sm text-cosmic-fog">
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
                  <div className="flex items-center justify-between text-cosmic-gold font-semibold">
                    <span>{t("checkout.total")}</span>
                    <span>€{Number(summary.total || 0).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-sm text-cosmic-fog">
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
                <div className="w-6 h-6 bg-cosmic-gold/15 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-cosmic-gold">1</span>
                </div>
                <div>
                  <p className="text-white font-medium">
                    {t("checkout.success.step1_title")}
                  </p>
                  <p className="text-cosmic-fog text-sm">
                    {t("checkout.success.step1_description")}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-cosmic-gold/15 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-cosmic-gold">2</span>
                </div>
                <div>
                  <p className="text-white font-medium">
                    {t("checkout.success.step2_title")}
                  </p>
                  <p className="text-cosmic-fog text-sm">
                    {t("checkout.success.step2_description")}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-cosmic-gold/15 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-cosmic-gold">3</span>
                </div>
                <div>
                  <p className="text-white font-medium">
                    {t("checkout.success.step3_title")}
                  </p>
                  <p className="text-cosmic-fog text-sm">
                    {t("checkout.success.step3_description")}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {orderId && user && (
              <Link
                href={`/order/${orderId}`}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-medium rounded-lg transition-all duration-200 border border-white/20"
              >
                <Package className="w-4 h-4" />
                {t("checkout.success.view_order")}
              </Link>
            )}
            {user && (
              <Link
                href="/account?tab=orders"
                className="flex items-center justify-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-medium rounded-lg transition-all duration-200 border border-white/20"
              >
                <Receipt className="w-4 h-4" />
                {t("checkout.success.view_orders")}
              </Link>
            )}
            <Link
              href="/shop"
              className="flex items-center justify-center gap-2 px-6 py-3 bg-cosmic-gold text-black font-medium rounded-lg transition-all duration-200 hover:bg-cosmic-gold/80"
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
            <p className="text-sm text-cosmic-fog">
              {t("checkout.success.support_text")}{" "}
              <a
                href="mailto:support@cosmococktails.com"
                className="text-cosmic-gold hover:text-cosmic-gold/80 underline"
              >
                {t("checkout.success.contact_us")}
              </a>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
