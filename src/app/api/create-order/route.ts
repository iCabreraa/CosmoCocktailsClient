import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { envServer } from "@/lib/env-server";
import {
  normalizeOrderItems,
  toOrderItemInserts,
} from "@/types/order-item-utils";

const supabase = createClient(
  envServer.NEXT_PUBLIC_SUPABASE_URL,
  envServer.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(request: NextRequest) {
  try {
    console.log("🔍 Creating order...");

    const body = await request.json();
    console.log("📦 Request body:", body);

    const { items, total, user_id, shipping_address, payment_intent_id } = body;

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

    let normalizedItems;
    try {
      normalizedItems = normalizeOrderItems(items);
    } catch (error) {
      return NextResponse.json(
        { error: "Invalid order items" },
        { status: 400 }
      );
    }

    console.log("📦 Order data:", {
      items,
      total,
      user_id,
      shipping_address,
      payment_intent_id,
    });

    // Crear el pedido
    console.log("💳 Creating order in database...");
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        user_id: user_id || null,
        total_amount: total,
        status: "paid", // Pago confirmado directamente
        payment_intent_id: payment_intent_id || null,
        shipping_address: JSON.stringify(shipping_address),
      })
      .select()
      .single();

    if (orderError) {
      console.error("❌ Error creating order:", orderError);
      return NextResponse.json(
        { error: "Failed to create order", details: orderError.message },
        { status: 500 }
      );
    }

    console.log("✅ Order created:", order.id);

    // Crear los items del pedido
    console.log("📝 Creating order items...");
    const orderItems = toOrderItemInserts(normalizedItems, order.id);

    console.log("📦 Order items to insert:", orderItems);

    const { error: itemsError } = await supabase
      .from("order_items")
      .insert(orderItems);

    if (itemsError) {
      console.error("❌ Error creating order items:", itemsError);
      return NextResponse.json(
        { error: "Failed to create order items", details: itemsError.message },
        { status: 500 }
      );
    }

    console.log("✅ Order items created successfully");

    // Actualizar stock - método correcto para Supabase
    console.log("📦 Updating stock...");
    for (const item of normalizedItems) {
      console.log(
        `🔄 Updating stock for cocktail ${item.cocktail_id}, size ${item.sizes_id}, quantity ${item.quantity}`
      );

      // Primero obtener el stock actual
      const { data: currentStock, error: fetchError } = await supabase
        .from("cocktail_sizes")
        .select("stock_quantity")
        .eq("cocktail_id", item.cocktail_id)
        .eq("sizes_id", item.sizes_id)
        .single();

      if (fetchError) {
        console.error("❌ Error fetching current stock:", fetchError);
        continue;
      }

      const newStock = (currentStock.stock_quantity || 0) - item.quantity;
      const isAvailable = newStock > 0;

      console.log(
        `📊 Stock update: ${currentStock.stock_quantity} - ${item.quantity} = ${newStock} (available: ${isAvailable})`
      );

      const { error: stockError } = await supabase
        .from("cocktail_sizes")
        .update({
          stock_quantity: newStock,
          available: isAvailable,
        })
        .eq("cocktail_id", item.cocktail_id)
        .eq("sizes_id", item.sizes_id);

      if (stockError) {
        console.error("❌ Error updating stock:", stockError);
      } else {
        console.log("✅ Stock updated successfully");
      }
    }

    console.log("🎉 Order creation completed successfully");
    return NextResponse.json({ id: order.id, order_ref: order.order_ref });
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
