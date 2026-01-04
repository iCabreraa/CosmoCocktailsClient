import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { createHash } from "crypto";
import {
  normalizeOrderItems,
  toOrderItemMetadata,
} from "@/types/order-item-utils";
import { envServer } from "@/lib/env-server";

type InventoryCheckItem = {
  cocktail_id: string;
  sizes_id: string;
  quantity: number;
};

const supabaseAdmin = createSupabaseClient(
  envServer.NEXT_PUBLIC_SUPABASE_URL,
  envServer.SUPABASE_SERVICE_ROLE_KEY
);

const aggregateInventoryItems = (
  items: ReturnType<typeof normalizeOrderItems>
): InventoryCheckItem[] => {
  const grouped = new Map<string, InventoryCheckItem>();
  items.forEach(item => {
    const key = `${item.cocktail_id}:${item.sizes_id}`;
    const existing = grouped.get(key);
    if (existing) {
      existing.quantity += item.quantity;
      return;
    }
    grouped.set(key, {
      cocktail_id: item.cocktail_id,
      sizes_id: item.sizes_id,
      quantity: item.quantity,
    });
  });
  return Array.from(grouped.values());
};

export async function POST(request: NextRequest) {
  try {
    console.log("🔍 Creating payment intent...");
    const { items, privacyAccepted, address } = await request.json();

    if (!items || items.length === 0) {
      console.log("❌ No items provided");
      return NextResponse.json({ error: "No items provided" }, { status: 400 });
    }

    if (!privacyAccepted) {
      return NextResponse.json(
        { error: "Privacy consent required" },
        { status: 400 }
      );
    }

    if (!address) {
      return NextResponse.json(
        { error: "Shipping address is required" },
        { status: 400 }
      );
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

    const inventoryItems = aggregateInventoryItems(sanitizedItems);
    const inventoryFilters = inventoryItems
      .map(
        item =>
          `and(cocktail_id.eq.${item.cocktail_id},sizes_id.eq.${item.sizes_id})`
      )
      .join(",");

    const { data: inventoryRows, error: inventoryError } =
      await supabaseAdmin
        .from("cocktail_sizes")
        .select("available, stock_quantity, cocktail_id, sizes_id")
        .or(inventoryFilters);

    if (inventoryError) {
      console.error("❌ Inventory validation error:", inventoryError);
      return NextResponse.json(
        { error: "Failed to verify inventory" },
        { status: 500 }
      );
    }

    const unavailableItems = inventoryItems
      .map(item => {
        const row = (inventoryRows ?? []).find(
          inventory =>
            inventory.cocktail_id === item.cocktail_id &&
            inventory.sizes_id === item.sizes_id
        );
        const available = Boolean(row?.available);
        const stockQty =
          typeof row?.stock_quantity === "number"
            ? row.stock_quantity
            : null;
        const hasStock = stockQty === null || stockQty >= item.quantity;

        if (!row || !available || !hasStock) {
          return {
            cocktail_id: item.cocktail_id,
            sizes_id: item.sizes_id,
            requested_quantity: item.quantity,
            available,
            stock_quantity: stockQty ?? 0,
          };
        }
        return null;
      })
      .filter(
        (
          item
        ): item is {
          cocktail_id: string;
          sizes_id: string;
          requested_quantity: number;
          available: boolean;
          stock_quantity: number;
        } => Boolean(item)
      );

    if (unavailableItems.length > 0) {
      return NextResponse.json(
        {
          error: "Some items are no longer available",
          unavailable: unavailableItems,
        },
        { status: 409 }
      );
    }

    // Calcular total
    const subtotal = sanitizedItems.reduce(
      (acc, item) => acc + item.unit_price * item.quantity,
      0
    );
    const vat = subtotal * 0.21;
    const shipping = subtotal >= 50 ? 0 : 4.99;
    const totalAmount = subtotal + vat + shipping;
    const total = Math.round(totalAmount * 100); // Convertir a céntimos

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

    const supabaseAuth = createServerClient();
    const {
      data: { user },
    } = await supabaseAuth.auth.getUser();
    const resolvedUserId = user?.id ?? null;

    const addressKey =
      typeof address === "string" ? address : JSON.stringify(address ?? {});
    const sortedItems = [...sanitizedItems].sort((a, b) => {
      const keyA = `${a.cocktail_id}:${a.sizes_id}`;
      const keyB = `${b.cocktail_id}:${b.sizes_id}`;
      return keyA.localeCompare(keyB);
    });
    const idempotencyPayload = JSON.stringify({
      items: sortedItems.map(item => ({
        cocktail_id: item.cocktail_id,
        size_id: item.sizes_id,
        quantity: item.quantity,
        unit_price: item.unit_price,
      })),
      total_amount: totalAmount,
      user_id: resolvedUserId,
      shipping_address: addressKey,
    });
    const idempotencyKey = createHash("sha256")
      .update(idempotencyPayload)
      .digest("hex")
      .slice(0, 32);

    const paymentIntent = await stripe.paymentIntents.create(
      {
      amount: total,
      currency: "eur",
      payment_method_types: ["card", "ideal"],
      metadata: {
        items_count: sanitizedItems.length.toString(),
        subtotal: subtotal.toString(),
        vat: vat.toString(),
        shipping: shipping.toString(),
        items: itemsMeta, // Compacto y truncado si excede límite
      },
      },
      { idempotencyKey }
    );

    let resolvedAddress = address;
    if (typeof address === "string") {
      try {
        resolvedAddress = JSON.parse(address);
      } catch (error) {
        return NextResponse.json(
          { error: "Invalid shipping address" },
          { status: 400 }
        );
      }
    }

    const draftItems = sanitizedItems.map(item => ({
      cocktail_id: item.cocktail_id,
      size_id: item.sizes_id,
      quantity: item.quantity,
      unit_price: item.unit_price,
    }));

    const { data: draftRows, error: draftError } = await supabaseAdmin.rpc(
      "create_order_draft",
      {
        p_payment_intent_id: paymentIntent.id,
        p_total_amount: totalAmount,
        p_user_id: resolvedUserId,
        p_shipping_address: resolvedAddress,
        p_items: draftItems,
      }
    );

    if (draftError) {
      console.error("❌ Error creating order draft:", draftError);
      return NextResponse.json(
        { error: "Failed to create order draft", details: draftError.message },
        { status: 500 }
      );
    }

    const draftRow = Array.isArray(draftRows) ? draftRows[0] : draftRows;
    if (!draftRow?.order_id) {
      return NextResponse.json(
        { error: "Failed to create order draft" },
        { status: 500 }
      );
    }

    console.log("✅ Payment intent created:", paymentIntent.id);
    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      orderId: draftRow.order_id,
      orderRef: draftRow.order_ref ?? null,
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
