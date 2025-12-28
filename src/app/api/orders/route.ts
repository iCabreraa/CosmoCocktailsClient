import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const summary = searchParams.get("summary") === "1";
    const includeItems = searchParams.get("includeItems") !== "0";
    const limitParam = searchParams.get("limit");
    const limit = limitParam ? Number(limitParam) : null;

    const baseSelect =
      "id, total_amount, status, order_date, delivery_date, created_at";
    const summarySelect = `${baseSelect},
         order_items ( id )`;

    const detailSelect = `${baseSelect},
         order_items (
           quantity, unit_price,
           cocktails ( name, image_url ),
           sizes ( name )
         )`;

    const selectClause =
      summary || !includeItems ? summarySelect : detailSelect;

    let query = supabase
      .from("orders")
      .select(selectClause)
      .eq("user_id", user.id)
      .order("order_date", { ascending: false });

    if (typeof limit === "number" && !Number.isNaN(limit)) {
      query = query.limit(limit);
    }

    const { data: orders, error } = await query;

    if (error) {
      console.error("Error fetching orders:", error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const mapped = (orders || []).map((o: any) => {
      const base = {
        id: o.id,
        total_amount: o.total_amount,
        status: o.status,
        created_at: o.order_date || o.created_at,
        delivery_date: o.delivery_date,
      };

      if (summary || !includeItems) {
        return {
          ...base,
          items: o.order_items || [],
        };
      }

      return {
        ...base,
        items: (o.order_items || []).map((it: any) => ({
          cocktail_name: it.cocktails?.name,
          size_name: it.sizes?.name,
          quantity: it.quantity,
          unit_price: it.unit_price,
          image_url: it.cocktails?.image_url,
        })),
      };
    });

    return NextResponse.json({ orders: mapped });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("/api/orders error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
