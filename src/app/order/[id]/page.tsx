"use client";

import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import OrderDetailActions from "@/components/order/OrderDetailActions";
import OrderTitle from "@/components/order/OrderTitle";
import OrderStatusTimeline from "@/components/order/OrderStatusTimeline";
import { useLanguage } from "@/contexts/LanguageContext";
import { useEffect, useState } from "react";
import { fromOrderItemRow, orderItemSelect } from "@/types/order-item-utils";

async function getOrder(id: string) {
  const supabase = createClient();

  // Fetch order data first
  const { data: order, error: orderError } = await supabase
    .from("orders")
    .select(
      "id, order_ref, total_amount, status, is_paid, order_date, payment_intent_id, shipping_address, user_id"
    )
    .eq("id", id)
    .single();

  if (orderError || !order) {
    console.error("Order not found:", orderError);
    return null;
  }

  // Fetch user data separately if user_id exists
  let userData = null;
  if (order && (order as any).user_id) {
    const { data: user } = await supabase
      .from("users")
      .select("name, email")
      .eq("id", (order as any).user_id)
      .single();
    userData = user;
  }

  // Parse shipping address if it's stored as JSON string
  let shippingAddress: any = null;
  try {
    if ((order as any).shipping_address) {
      shippingAddress =
        typeof (order as any).shipping_address === "string"
          ? JSON.parse((order as any).shipping_address)
          : (order as any).shipping_address;
    }
  } catch {
    shippingAddress = (order as any).shipping_address;
  }

  const { data: rawItems } = await supabase
    .from("order_items")
    .select(orderItemSelect)
    .eq("order_id", id);

  const items = (rawItems || []).map((it: any) => fromOrderItemRow(it));

  return {
    order: {
      ...(order as any),
      shipping_address: shippingAddress,
      users: userData,
    },
    items,
  };
}

export default function OrderDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const { t } = useLanguage();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchOrder() {
      try {
        const orderData = await getOrder(params.id);
        if (!orderData) {
          setError("Order not found");
        } else {
          setData(orderData);
        }
      } catch (err) {
        setError("Error loading order");
      } finally {
        setLoading(false);
      }
    }

    fetchOrder();
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cosmic-gold"></div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <main className="px-6 py-24 text-center">
        <h1 className="text-3xl font-[--font-unica] text-[#D8DAE3]">
          {t("order.not_found")}
        </h1>
        <p className="text-cosmic-silver mt-3">
          {t("order.not_found_description")}
        </p>
        <div className="mt-6 flex gap-4 justify-center">
          <Link href="/" className="btn btn-primary">
            {t("order.go_home")}
          </Link>
          <Link href="/shop" className="btn btn-secondary">
            {t("order.continue_shopping")}
          </Link>
        </div>
      </main>
    );
  }

  const { order, items } = data;

  return (
    <main className="px-6 py-16 max-w-5xl mx-auto">
      <section className="rounded-2xl p-6 md:p-10 shadow-[0_0_40px_rgba(209,184,127,0.08)] border border-cosmic-gold/10 bg-[radial-gradient(1200px_500px_at_50%_0%,rgba(209,184,127,0.08),transparent_60%)] bg-cosmic-bg/40 backdrop-blur">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
          <div>
            <OrderTitle id={order.id} orderRef={order.order_ref} />
            <div className="mt-3 flex items-center gap-3">
              {(
                ["ordered", "preparing", "on_the_way", "completed"] as string[]
              ).includes(order.status) && (
                <span className="inline-flex items-center px-3 py-1 rounded-full border border-emerald-400/40 text-emerald-300 text-xs font-[--font-josefin] bg-emerald-400/10">
                  {t("order.payment_confirmed")}
                </span>
              )}
            </div>
            <div className="mt-6">
              <OrderStatusTimeline status={order.status} />
            </div>
          </div>
          <div className="flex gap-8 text-sm font-[--font-josefin] md:mt-1">
            <Link
              href="/shop"
              className="text-cosmic-gold hover:opacity-80 underline-offset-4 hover:underline"
            >
              {t("order.continue_shopping")}
            </Link>
            <Link
              href="/account?tab=orders"
              className="text-cosmic-silver hover:text-cosmic-gold underline-offset-4 hover:underline"
            >
              {t("order.view_orders")}
            </Link>
          </div>
        </div>

        <div className="mt-10 grid gap-8">
          <div className="rounded-xl border border-cosmic-gold/10 p-4 bg-black/20 backdrop-blur">
            <h2 className="text-xl font-[--font-unica] text-[#D8DAE3] mb-3">
              {t("order.items")}
            </h2>
            <div className="divide-y divide-cosmic-gold/10">
              {items?.map((it: any, idx: number) => (
                <div
                  key={idx}
                  className="py-3 flex items-center justify-between text-cosmic-silver gap-4"
                >
                  <div className="flex items-center gap-4">
                    {it.cocktail_image && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={it.cocktail_image}
                        alt={it.cocktail_name ?? "cocktail"}
                        className="w-12 h-12 rounded-lg object-cover border border-cosmic-gold/20"
                      />
                    )}
                    <div>
                      <div className="font-[--font-josefin]">
                        {it.cocktail_name || it.cocktail_id} ·{" "}
                        {it.size_name || it.sizes_id}
                      </div>
                      <div className="text-sm opacity-75">
                        {t("order.quantity")}: {it.quantity}
                      </div>
                    </div>
                  </div>
                  <div className="font-[--font-josefin]">
                    €{Number(it.item_total).toFixed(2)}
                  </div>
                </div>
              ))}
              <div className="py-3 flex items-center justify-between text-cosmic-silver gap-4 border-t border-cosmic-gold/20">
                <div className="font-[--font-josefin] text-sm opacity-75">
                  {t("order.product_subtotal")}
                </div>
                <div className="font-[--font-josefin]">
                  €{((Number(order.total_amount) - 4.95) / 1.21).toFixed(2)}
                </div>
              </div>
              <div className="py-3 flex items-center justify-between text-cosmic-silver gap-4">
                <div className="font-[--font-josefin] text-sm opacity-75">
                  {t("order.vat")} (21%)
                </div>
                <div className="font-[--font-josefin]">
                  €
                  {(
                    ((Number(order.total_amount) - 4.95) / 1.21) *
                    0.21
                  ).toFixed(2)}
                </div>
              </div>
              <div className="py-3 flex items-center justify-between text-cosmic-silver gap-4">
                <div className="font-[--font-josefin] text-sm opacity-75">
                  {t("order.shipping_costs")}
                </div>
                <div className="font-[--font-josefin]">€4.95</div>
              </div>
              <div className="py-3 flex items-center justify-between text-cosmic-gold gap-4 border-t border-cosmic-gold/20">
                <div className="font-medium">{t("order.total")}</div>
                <div className="font-medium">
                  €{Number(order.total_amount).toFixed(2)}
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-cosmic-gold/10 p-4 bg-black/20 backdrop-blur">
            <h2 className="text-xl font-[--font-unica] text-[#D8DAE3] mb-3">
              {t("order.shipping_info")}
            </h2>
            <div className="text-cosmic-silver text-sm grid md:grid-cols-2 gap-x-8 gap-y-2 font-[--font-josefin]">
              <div>
                <span className="opacity-70">{t("order.name")}:</span>{" "}
                {order.shipping_address?.name ||
                  order.users?.name ||
                  t("order.user")}
              </div>
              <div>
                <span className="opacity-70">{t("order.phone")}:</span>{" "}
                {order.shipping_address?.phone ?? "-"}
              </div>
              <div className="md:col-span-2">
                <span className="opacity-70">{t("order.street")}:</span>{" "}
                {order.shipping_address?.street ?? "-"}
              </div>
              <div>
                <span className="opacity-70">{t("order.city")}:</span>{" "}
                {order.shipping_address?.city ?? "-"}
              </div>
              <div>
                <span className="opacity-70">{t("order.postal_code")}:</span>{" "}
                {order.shipping_address?.postal_code ?? "-"}
              </div>
              <div>
                <span className="opacity-70">{t("order.country")}:</span>{" "}
                {order.shipping_address?.country ?? "-"}
              </div>
            </div>
          </div>
        </div>

        {/* Nuevas acciones y información detallada */}
        <div className="mt-10">
          <OrderDetailActions
            orderId={order.id}
            orderRef={order.order_ref}
            status={order.status}
          />
        </div>
      </section>
    </main>
  );
}
