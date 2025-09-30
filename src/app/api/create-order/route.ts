import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { envServer } from "@/lib/env-server";

const supabase = createClient(
  envServer.NEXT_PUBLIC_SUPABASE_URL,
  envServer.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(request: NextRequest) {
  try {
    console.log("🔍 Creating order...");
    const { items, total, user_id, shipping_address, payment_intent_id } =
      await request.json();

    console.log("📦 Order data:", {
      items,
      total,
      user_id,
      shipping_address,
      payment_intent_id,
    });

    if (!items || items.length === 0) {
      console.log("❌ No items provided");
      return NextResponse.json({ error: "No items provided" }, { status: 400 });
    }

    // Crear el pedido
    console.log("💳 Creating order in database...");
    const { data: order, error: orderError } = await (supabase as any)
      .from("orders")
      .insert({
        user_id: user_id || null,
        total_amount: total,
        status: "pending",
        payment_intent_id: payment_intent_id || null,
        shipping_address: shipping_address
          ? JSON.stringify(shipping_address)
          : null,
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
    const orderItems = items.map((item: any) => ({
      order_id: order.id,
      cocktail_id: item.cocktail_id,
      size_id: item.sizes_id,
      quantity: item.quantity,
      unit_price: item.unit_price,
      item_total: item.unit_price * item.quantity, // Usar item_total que es el nombre correcto
    }));

    console.log("📦 Order items to insert:", orderItems);

    const { error: itemsError } = await (supabase as any)
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
    for (const item of items) {
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

      const { error: stockError } = await (supabase as any)
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
    return NextResponse.json({
      success: true,
      order_id: order.id,
      message: "Order created successfully",
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
