import { createClient } from "@supabase/supabase-js";
import { envServer } from "@/lib/env-server";

type FailureArgs = {
  paymentIntentId: string;
  amount: number;
  metadata: Record<string, string>;
  reason?: string | null;
};

async function markOrderCancelled(
  eventType: "failed" | "canceled",
  { paymentIntentId, amount, metadata, reason }: FailureArgs
): Promise<void> {
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
      event_type: `payment_intent_${eventType}_order_check_error`,
      details: {
        payment_intent_id: paymentIntentId,
        amount,
        metadata,
        reason,
        error: orderError.message,
      },
    });
    return;
  }

  if (!order) {
    await (supabase as any).from("security_events").insert({
      event_type: `payment_intent_${eventType}_missing_order`,
      details: {
        payment_intent_id: paymentIntentId,
        amount,
        metadata,
        reason,
      },
    });
    return;
  }

  if (order.is_paid === true) {
    await (supabase as any).from("security_events").insert({
      event_type: `payment_intent_${eventType}_already_paid`,
      details: {
        payment_intent_id: paymentIntentId,
        amount,
        metadata,
        reason,
      },
    });
    return;
  }

  const updates: Record<string, unknown> = {};
  if (order.status !== "cancelled") {
    updates.status = "cancelled";
  }
  if (order.is_paid !== false) {
    updates.is_paid = false;
  }

  if (Object.keys(updates).length === 0) {
    return;
  }

  const { error: updateError } = await (supabase as any)
    .from("orders")
    .update(updates)
    .eq("id", order.id);

  if (updateError) {
    await (supabase as any).from("security_events").insert({
      event_type: `payment_intent_${eventType}_order_update_error`,
      details: {
        payment_intent_id: paymentIntentId,
        amount,
        metadata,
        reason,
        error: updateError.message,
      },
    });
  }
}

export async function handlePaymentFailed(args: FailureArgs): Promise<void> {
  await markOrderCancelled("failed", args);
}

export async function handlePaymentCanceled(args: FailureArgs): Promise<void> {
  await markOrderCancelled("canceled", args);
}
