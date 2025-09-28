import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("user_id");

    if (!userId) {
      return NextResponse.json(
        { error: "user_id is required" },
        { status: 400 }
      );
    }

    const supabase = createClient();

    // Fetch orders and their items for this user
    const { data: orders, error } = await supabase
      .from("orders")
      .select(
        `id, total_amount, status, order_date, delivery_date,
         order_items (
           quantity, unit_price,
           cocktails ( name, image_url ),
           sizes ( name )
         )`
      )
      .eq("user_id", userId)
      .order("order_date", { ascending: false });

    if (error) {
      console.error("Error fetching orders:", error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const mapped = (orders || []).map((o: any) => ({
      id: o.id,
      total_amount: o.total_amount,
      status: o.status,
      created_at: o.order_date || o.created_at,
      delivery_date: o.delivery_date,
      items: (o.order_items || []).map((it: any) => ({
        cocktail_name: it.cocktails?.name,
        size_name: it.sizes?.name,
        quantity: it.quantity,
        unit_price: it.unit_price,
        image_url: it.cocktails?.image_url,
      })),
    }));

    return NextResponse.json({ orders: mapped });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("/api/orders error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
