import { createClient } from "@supabase/supabase-js";
import { envServer } from "@/lib/env-server";
import {
  normalizeOrderItems,
  type NormalizedOrderItem,
  type OrderItemInput,
} from "@/types/order-item-utils";

type Args = {
  paymentIntentId: string;
  amountReceived: number;
  metadata: Record<string, string>;
};

// Creates order and decrements stock in a best-effort atomic way using Postgres RPC
export async function handlePaymentSucceeded({
  paymentIntentId,
  amountReceived,
  metadata,
}: Args): Promise<void> {
  const supabase = createClient(
    envServer.NEXT_PUBLIC_SUPABASE_URL,
    envServer.SUPABASE_SERVICE_ROLE_KEY
  );

  if (paymentIntentId) {
    const { data: existingOrder, error: existingError } = await (supabase as any)
      .from("orders")
      .select("id")
      .eq("payment_intent_id", paymentIntentId)
      .maybeSingle();

    if (existingError) {
      await (supabase as any).from("security_events").insert({
        type: "payment_intent_succeeded_order_check_error",
        payload: {
          payment_intent_id: paymentIntentId,
          error: existingError.message,
        },
      });
    }

    if (existingOrder) {
      return;
    }
  }

  // Parse items from metadata (created earlier)
  let items: OrderItemInput[] = [];
  try {
    if (metadata.items) {
      items = JSON.parse(metadata.items.replace(/\.\.\.__truncated$/, ""));
    }
  } catch {
    items = [];
  }

  let normalizedItems: NormalizedOrderItem[] = [];
  try {
    normalizedItems = normalizeOrderItems(items);
  } catch {
    normalizedItems = [];
  }

  // Fallback: if items missing, do nothing but record event
  if (!normalizedItems.length) {
    await (supabase as any).from("security_events").insert({
      type: "payment_intent_succeeded_no_items",
      payload: { payment_intent_id: paymentIntentId, amount: amountReceived },
    });
    return;
  }

  const { data: order, error: orderError } = await (supabase as any)
    .from("orders")
    .insert({
      total_amount: amountReceived / 100,
      status: "paid",
      is_paid: true,
      payment_intent_id: paymentIntentId,
    })
    .select()
    .single();

  if (orderError) {
    await (supabase as any).from("security_events").insert({
      type: "payment_intent_succeeded_order_error",
      payload: { payment_intent_id: paymentIntentId, error: orderError.message },
    });
    throw new Error(orderError.message);
  }

  const orderItems = normalizedItems.map(item => ({
    order_id: order.id,
    cocktail_id: item.cocktail_id,
    size_id: item.sizes_id,
    quantity: item.quantity,
    unit_price: item.unit_price,
    item_total: item.item_total ?? item.unit_price * item.quantity,
  }));

  const { error: itemsError } = await (supabase as any)
    .from("order_items")
    .insert(orderItems);

  if (itemsError) {
    await (supabase as any).from("security_events").insert({
      type: "payment_intent_succeeded_items_error",
      payload: { payment_intent_id: paymentIntentId, error: itemsError.message },
    });
    throw new Error(itemsError.message);
  }

  for (const item of normalizedItems) {
    const { data: currentStock, error: fetchError } = await (supabase as any)
      .from("cocktail_sizes")
      .select("stock_quantity")
      .eq("cocktail_id", item.cocktail_id)
      .eq("sizes_id", item.sizes_id)
      .single();

    if (fetchError) {
      await (supabase as any).from("security_events").insert({
        type: "payment_intent_succeeded_stock_fetch_error",
        payload: { payment_intent_id: paymentIntentId, error: fetchError.message },
      });
      continue;
    }

    const newStock = (currentStock?.stock_quantity || 0) - item.quantity;
    const isAvailable = newStock > 0;

    const { error: stockError } = await (supabase as any)
      .from("cocktail_sizes")
      .update({ stock_quantity: newStock, available: isAvailable })
      .eq("cocktail_id", item.cocktail_id)
      .eq("sizes_id", item.sizes_id);

    if (stockError) {
      await (supabase as any).from("security_events").insert({
        type: "payment_intent_succeeded_stock_update_error",
        payload: { payment_intent_id: paymentIntentId, error: stockError.message },
      });
    }
  }

  // No necesitamos actualizar de 'ordered' a 'paid' porque ahora creamos directamente en 'paid'
  // El RPC ya crea el pedido con status 'paid'
}
