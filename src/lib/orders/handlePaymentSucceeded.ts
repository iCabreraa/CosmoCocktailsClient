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

  const { data: finalized, error: finalizeError } = await (supabase as any).rpc(
    "finalize_paid_order",
    {
      p_payment_intent_id: paymentIntentId,
    }
  );

  if (finalizeError) {
    console.error("❌ Error finalizing order:", finalizeError);
    await (supabase as any).from("security_events").insert({
      event_type: "payment_intent_finalize_error",
      details: {
        payment_intent_id: paymentIntentId,
        amount: amountReceived,
        metadata,
        error: finalizeError.message,
      },
    });
    return;
  }

  const finalizedRow = Array.isArray(finalized) ? finalized[0] : finalized;
  if (!finalizedRow?.order_id) {
    await (supabase as any).from("security_events").insert({
      event_type: "payment_intent_finalize_missing_order",
      details: { payment_intent_id: paymentIntentId, amount: amountReceived, metadata },
    });
  }
}
