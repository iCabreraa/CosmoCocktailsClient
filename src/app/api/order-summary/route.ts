import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { envServer } from "@/lib/env-server";
import { fromOrderItemRow, orderItemSelect } from "@/types/order-item-utils";

const VAT_RATE = 0.21;
const SHIPPING_THRESHOLD = 50;
const SHIPPING_COST = 4.99;

const supabase = createClient(
  envServer.NEXT_PUBLIC_SUPABASE_URL,
  envServer.SUPABASE_SERVICE_ROLE_KEY
);

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const orderId = searchParams.get("order_id");
  const orderRef = searchParams.get("order_ref");
  const paymentIntent = searchParams.get("payment_intent");

  if (!orderId && !paymentIntent) {
    return NextResponse.json(
      { error: "order_id or payment_intent is required" },
      { status: 400 }
    );
  }

  let query = supabase
    .from("orders")
    .select("id, order_ref, total_amount, order_date, payment_intent_id");

  if (orderId) {
    query = query.eq("id", orderId);
  }

  if (orderRef) {
    query = query.eq("order_ref", orderRef);
  }

  if (paymentIntent) {
    query = query.eq("payment_intent_id", paymentIntent);
  }

  const { data: order, error: orderError } = await query.single();

  if (orderError || !order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  const { data: itemsData, error: itemsError } = await supabase
    .from("order_items")
    .select(orderItemSelect)
    .eq("order_id", order.id);

  if (itemsError) {
    return NextResponse.json(
      { error: "Failed to load order items" },
      { status: 500 }
    );
  }

  const items = (itemsData || []).map(row => fromOrderItemRow(row as any));
  const subtotal = items.reduce(
    (sum: number, item: any) => sum + Number(item.item_total || 0),
    0
  );
  const vat_amount = subtotal * VAT_RATE;
  const shipping_cost = subtotal >= SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;
  const total = order.total_amount ?? subtotal + vat_amount + shipping_cost;

  return NextResponse.json({
    orderId: order.id,
    orderRef: order.order_ref ?? undefined,
    orderDate: order.order_date ?? undefined,
    items: items.map(item => ({
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
}
