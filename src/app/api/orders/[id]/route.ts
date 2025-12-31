import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { envServer } from "@/lib/env-server";
import { fromOrderItemRow, orderItemSelect } from "@/types/order-item-utils";
import { getAuthContext } from "@/lib/security/auth";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await getAuthContext();
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createClient(
    envServer.NEXT_PUBLIC_SUPABASE_URL,
    envServer.SUPABASE_SERVICE_ROLE_KEY
  );

  const orderId = params.id;

  // Fetch order data first
  const { data: order, error: orderError } = await (supabase as any)
    .from("orders")
    .select(
      "id, order_ref, total_amount, status, is_paid, order_date, payment_intent_id, shipping_address, user_id"
    )
    .eq("id", orderId)
    .single();

  if (orderError || !order) {
    console.error("Order not found:", orderError);
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  if (!auth.isAdmin && order.user_id !== auth.userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Fetch user data separately if user_id exists
  let userData = null;
  if (order.user_id) {
    const { data: user } = await (supabase as any)
      .from("users")
      .select("full_name, email")
      .eq("id", order.user_id)
      .single();
    userData = user;
  }

  // Parse shipping address if it's stored as JSON string
  let shippingAddress: any = null;
  try {
    if (order.shipping_address) {
      shippingAddress =
        typeof order.shipping_address === "string"
          ? JSON.parse(order.shipping_address)
          : order.shipping_address;
    }
  } catch {
    shippingAddress = order.shipping_address;
  }

  const { data: rawItems } = await (supabase as any)
    .from("order_items")
    .select(orderItemSelect)
    .eq("order_id", orderId);

  const items = (rawItems || []).map((it: any) => fromOrderItemRow(it));

  return NextResponse.json({
    order: {
      ...order,
      shipping_address: shippingAddress,
      users: userData,
    },
    items,
  });
}
