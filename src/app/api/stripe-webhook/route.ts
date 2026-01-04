import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { envServer } from "@/lib/env-server";
import { handlePaymentSucceeded } from "@/lib/orders/handlePaymentSucceeded";
import {
  handlePaymentCanceled,
  handlePaymentFailed,
} from "@/lib/orders/handlePaymentFailure";

export const runtime = "nodejs";

function bufferFromRequest(req: NextRequest): Promise<Buffer> {
  return new Response(req.body).arrayBuffer().then(ab => Buffer.from(ab));
}

export async function POST(req: NextRequest) {
  const sig = req.headers.get("stripe-signature");
  if (!sig) {
    return NextResponse.json(
      { error: "Missing stripe-signature" },
      { status: 400 }
    );
  }

  const stripe = new Stripe(envServer.STRIPE_SECRET_KEY, {
    apiVersion: "2025-08-27.basil",
  });
  const webhookSecret = envServer.STRIPE_WEBHOOK_SECRET;

  try {
    const buf = await bufferFromRequest(req);
    const event = stripe.webhooks.constructEvent(buf, sig, webhookSecret);

    switch (event.type) {
      case "payment_intent.succeeded": {
        const pi = event.data.object as Stripe.PaymentIntent;
        await handlePaymentSucceeded({
          paymentIntentId: pi.id,
          amountReceived: pi.amount_received ?? pi.amount ?? 0,
          metadata: (pi.metadata ?? {}) as Record<string, string>,
        });
        break;
      }
      case "payment_intent.payment_failed": {
        const pi = event.data.object as Stripe.PaymentIntent;
        await handlePaymentFailed({
          paymentIntentId: pi.id,
          amount: pi.amount ?? 0,
          metadata: (pi.metadata ?? {}) as Record<string, string>,
          reason: pi.last_payment_error?.message ?? null,
        });
        break;
      }
      case "payment_intent.canceled": {
        const pi = event.data.object as Stripe.PaymentIntent;
        await handlePaymentCanceled({
          paymentIntentId: pi.id,
          amount: pi.amount ?? 0,
          metadata: (pi.metadata ?? {}) as Record<string, string>,
          reason: pi.cancellation_reason ?? null,
        });
        break;
      }
      default:
        break;
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
