import { createClient } from "@supabase/supabase-js";
import { envServer } from "@/lib/env-server";

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

  // Parse items from metadata (created earlier)
  let items: Array<{
    cocktail_id: string; // UUID
    size_id: string; // UUID
    quantity: number;
    unit_price: number;
  }> = [];
  try {
    if (metadata.items) {
      items = JSON.parse(metadata.items.replace(/\.\.\.__truncated$/, ""));
    }
  } catch {
    items = [];
  }

  // Fallback: if items missing, do nothing but record event
  if (!items.length) {
    await (supabase as any).from("security_events").insert({
      type: "payment_intent_succeeded_no_items",
      payload: { payment_intent_id: paymentIntentId, amount: amountReceived },
    });
    return;
  }

  // Use a single RPC to ensure stock decrement is conditional (stock >= quantity)
  const { error } = await (supabase as any).rpc(
    "decrement_stock_and_create_order",
    {
      p_payment_intent_id: paymentIntentId,
      p_total_amount: amountReceived / 100,
      p_items: items,
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
