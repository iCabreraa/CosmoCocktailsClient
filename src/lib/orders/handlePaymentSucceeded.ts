import { createClient } from "@supabase/supabase-js";
import { envServer } from "@/lib/env-server";

type Args = {
  paymentIntentId: string;
  amountReceived: number;
  metadata: Record<string, string>;
};

// Webhook handler: ensure the existing order is marked as paid (no order creation here)
export async function handlePaymentSucceeded({
  paymentIntentId,
  amountReceived,
  metadata,
}: Args): Promise<void> {
  const supabase = createClient(
    envServer.NEXT_PUBLIC_SUPABASE_URL,
    envServer.SUPABASE_SERVICE_ROLE_KEY
  );

  if (!paymentIntentId) {
    return;
  }

  const { data: order, error: orderError } = await (supabase as any)
    .from("orders")
    .select("id, status, is_paid")
    .eq("payment_intent_id", paymentIntentId)
    .maybeSingle();

  if (orderError) {
    await (supabase as any).from("security_events").insert({
      type: "payment_intent_succeeded_order_check_error",
      payload: { payment_intent_id: paymentIntentId, error: orderError.message },
    });
    return;
  }

  if (!order) {
    await (supabase as any).from("security_events").insert({
      type: "payment_intent_succeeded_missing_order",
      payload: { payment_intent_id: paymentIntentId, amount: amountReceived, metadata },
    });
    return;
  }

  const updates: Record<string, unknown> = {};
  if (order.is_paid !== true) {
    updates.is_paid = true;
  }
  if (order.status !== "paid") {
    updates.status = "paid";
  }

  if (Object.keys(updates).length > 0) {
    const { error: updateError } = await (supabase as any)
      .from("orders")
      .update(updates)
      .eq("id", order.id);

    if (updateError) {
      await (supabase as any).from("security_events").insert({
        type: "payment_intent_succeeded_order_update_error",
        payload: { payment_intent_id: paymentIntentId, error: updateError.message },
      });
    }
  }
}
