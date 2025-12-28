import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe/server";
import { createClient } from "@/lib/supabase/server";
import {
  normalizeOrderItems,
  toOrderItemMetadata,
} from "@/types/order-item-utils";

export async function POST(request: NextRequest) {
  try {
    console.log("🔍 Creating payment intent...");
    const { items } = await request.json();

    if (!items || items.length === 0) {
      console.log("❌ No items provided");
      return NextResponse.json({ error: "No items provided" }, { status: 400 });
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

    const sanitizedItems = normalizedItems
      .map(item => ({
        ...item,
        unit_price: Number(item.unit_price),
        quantity: Number(item.quantity),
      }))
      .filter(
        item =>
          Number.isFinite(item.unit_price) &&
          Number.isFinite(item.quantity) &&
          item.unit_price >= 0 &&
          item.quantity > 0
      );

    if (sanitizedItems.length === 0) {
      return NextResponse.json(
        { error: "No valid order items provided" },
        { status: 400 }
      );
    }

    // Calcular total
    const subtotal = sanitizedItems.reduce(
      (acc, item) => acc + item.unit_price * item.quantity,
      0
    );
    const vat = subtotal * 0.21;
    const shipping = subtotal >= 50 ? 0 : 4.99;
    const total = Math.round((subtotal + vat + shipping) * 100); // Convertir a céntimos

    if (!Number.isFinite(total) || total <= 0) {
      return NextResponse.json(
        {
          error: "Invalid order total",
          details: { subtotal, vat, shipping, total },
        },
        { status: 400 }
      );
    }

    console.log("💰 Total calculation:", { subtotal, vat, shipping, total });

    // Crear Payment Intent
    console.log("💳 Creating Stripe payment intent...");

    // Simplificar metadatos para evitar el límite de 500 caracteres
    const simplifiedItems = sanitizedItems.map(item =>
      toOrderItemMetadata(item)
    );

    // Stripe limita cada valor de metadata a 500 chars aprox.
    // Compactamos y acotamos el string para evitar 500s en carritos grandes
    const itemsJson = JSON.stringify(simplifiedItems);
    const MAX_METADATA_VALUE = 480; // margen de seguridad
    const itemsMeta =
      itemsJson.length > MAX_METADATA_VALUE
        ? itemsJson.slice(0, MAX_METADATA_VALUE - 20) + "...__truncated"
        : itemsJson;

    const paymentIntent = await stripe.paymentIntents.create({
      amount: total,
      currency: "eur",
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        items_count: sanitizedItems.length.toString(),
        subtotal: subtotal.toString(),
        vat: vat.toString(),
        shipping: shipping.toString(),
        items: itemsMeta, // Compacto y truncado si excede límite
      },
    });

    console.log("✅ Payment intent created:", paymentIntent.id);
    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (error) {
    console.error("❌ Error creating payment intent:", error);
    return NextResponse.json(
      {
        error: "Failed to create payment intent",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
