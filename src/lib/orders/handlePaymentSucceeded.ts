import { createClient } from "@supabase/supabase-js";
import { envServer } from "@/lib/env-server";
import {
  normalizeOrderItems,
  toOrderItemMetadata,
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

  const payloadItems = normalizedItems.map(item => toOrderItemMetadata(item));

  // Use a single RPC to ensure stock decrement is conditional (stock >= quantity)
  const { error } = await (supabase as any).rpc(
    "decrement_stock_and_create_order",
    {
      p_payment_intent_id: paymentIntentId,
      p_total_amount: amountReceived / 100,
      p_items: payloadItems,
    }
  );

  if (error) {
    await (supabase as any).from("security_events").insert({
      type: "payment_intent_succeeded_order_error",
      payload: { payment_intent_id: paymentIntentId, error: error.message },
    });
    throw new Error(error.message);
  }

  // No necesitamos actualizar de 'ordered' a 'paid' porque ahora creamos directamente en 'paid'
  // El RPC ya crea el pedido con status 'paid'
}
