import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { envServer } from "@/lib/env-server";
import { stripe } from "@/lib/stripe/server";
import { createClient as createServerClient } from "@/lib/supabase/server";
import {
  normalizeOrderItems,
} from "@/types/order-item-utils";

const supabase = createClient(
  envServer.NEXT_PUBLIC_SUPABASE_URL,
  envServer.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      items,
      total,
      shipping_address,
      payment_intent_id,
      contact_email,
    } = body;

    const supabaseAuth = createServerClient();
    const {
      data: { user },
    } = await supabaseAuth.auth.getUser();
    const resolvedUserId = user?.id ?? null;

    // Validaciones básicas
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "Items are required" },
        { status: 400 }
      );
    }

    if (!total || total <= 0) {
      return NextResponse.json(
        { error: "Valid total is required" },
        { status: 400 }
      );
    }

    if (!shipping_address) {
      return NextResponse.json(
        { error: "Shipping address is required" },
        { status: 400 }
      );
    }

    if (!payment_intent_id) {
      return NextResponse.json(
        { error: "Payment intent is required" },
        { status: 400 }
      );
    }

    const { data: existingOrder, error: existingError } = await supabase
      .from("orders")
      .select("id, order_ref, is_paid")
      .eq("payment_intent_id", payment_intent_id)
      .maybeSingle();

    if (existingError) {
      console.error("❌ Error checking existing order:", existingError);
    }

    if (existingOrder) {
      if (existingOrder.is_paid) {
        return NextResponse.json({
          id: existingOrder.id,
          order_ref: existingOrder.order_ref,
        });
      }

      const { data: finalizedRows, error: finalizeError } = await supabase.rpc(
        "finalize_paid_order",
        {
          p_payment_intent_id: payment_intent_id,
        }
      );

      if (finalizeError) {
        console.error("❌ Error finalizing order (RPC):", finalizeError);
        return NextResponse.json(
          { error: "Failed to finalize order", details: finalizeError.message },
          { status: 500 }
        );
      }

      const finalizedRow = Array.isArray(finalizedRows)
        ? finalizedRows[0]
        : finalizedRows;
      if (!finalizedRow?.order_id) {
        return NextResponse.json(
          { error: "Failed to finalize order" },
          { status: 500 }
        );
      }

      return NextResponse.json({
        id: finalizedRow.order_id,
        order_ref: finalizedRow.order_ref,
      });
    }

    let normalizedItems;
    try {
      normalizedItems = normalizeOrderItems(items);
    } catch (error) {
      return NextResponse.json(
        { error: "Invalid order items" },
        { status: 400 }
      );
    }
    let paymentIntent;
    try {
      paymentIntent = await stripe.paymentIntents.retrieve(payment_intent_id);
    } catch (error) {
      return NextResponse.json(
        { error: "Failed to verify payment intent" },
        { status: 502 }
      );
    }

    if (!paymentIntent) {
      return NextResponse.json(
        { error: "Payment intent not found" },
        { status: 404 }
      );
    }

    if (paymentIntent.status !== "succeeded") {
      return NextResponse.json(
        { error: "Payment not completed", status: paymentIntent.status },
        { status: 409 }
      );
    }

    const expectedAmount = Math.round(total * 100);
    const receivedAmount =
      paymentIntent.amount_received || paymentIntent.amount || 0;

    if (receivedAmount !== expectedAmount) {
      return NextResponse.json(
        {
          error: "Payment amount mismatch",
          expected: expectedAmount,
          received: receivedAmount,
        },
        { status: 409 }
      );
    }

    let resolvedShippingAddress = shipping_address;
    if (typeof shipping_address === "string") {
      try {
        resolvedShippingAddress = JSON.parse(shipping_address);
      } catch (error) {
        return NextResponse.json(
          { error: "Invalid shipping address" },
          { status: 400 }
        );
      }
    }

    const rpcItems = normalizedItems.map(item => ({
      cocktail_id: item.cocktail_id,
      size_id: item.sizes_id,
      quantity: item.quantity,
      unit_price: item.unit_price,
    }));

    const { data: orderRows, error: orderError } = await supabase.rpc(
      "decrement_stock_and_create_order",
      {
        p_payment_intent_id: payment_intent_id,
        p_total_amount: total,
        p_user_id: resolvedUserId,
        p_shipping_address: resolvedShippingAddress ?? null,
        p_items: rpcItems,
      }
    );

    if (orderError) {
      console.error("❌ Error creating order (RPC):", orderError);
      const message = orderError.message || "Failed to create order";
      const isStockError = message.toLowerCase().includes("stock");
      return NextResponse.json(
        { error: message },
        { status: isStockError ? 409 : 500 }
      );
    }

    const orderRow = Array.isArray(orderRows) ? orderRows[0] : orderRows;
    if (!orderRow?.order_id) {
      return NextResponse.json(
        { error: "Failed to create order" },
        { status: 500 }
      );
    }

    if (contact_email) {
      await sendOrderConfirmation({
        email: contact_email,
        orderId: orderRow.order_id,
        orderRef: orderRow.order_ref,
        total,
        itemCount: normalizedItems.length,
      });
    }

    return NextResponse.json({
      id: orderRow.order_id,
      order_ref: orderRow.order_ref,
    });
  } catch (error) {
    console.error("❌ Error creating order:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

function maskEmail(email: string) {
  const [name, domain] = email.split("@");
  if (!domain) return "***";
  return `${name.slice(0, 2)}***@${domain}`;
}

async function sendOrderConfirmation(data: {
  email: string;
  orderId: string;
  orderRef?: string | null;
  total: number;
  itemCount: number;
}) {
  try {
    // Placeholder for real email delivery (Resend/SendGrid/etc.).
    console.log("📧 Order confirmation queued:", {
      email: maskEmail(data.email),
      orderId: data.orderId,
      orderRef: data.orderRef,
      total: data.total,
      itemCount: data.itemCount,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("❌ Error queueing order confirmation:", error);
  }
}
