import { NextRequest, NextResponse } from "next/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { envServer } from "@/lib/env-server";
import { getAuthContext } from "@/lib/security/auth";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const supabaseAuth = createServerClient();
    const {
      data: { user },
      error: authError,
    } = await supabaseAuth.auth.getUser();

    let userId = user?.id ?? null;

    if (!userId) {
      const legacy = await getAuthContext();
      userId = legacy?.userId ?? null;
    }

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = createAdminClient(
      envServer.NEXT_PUBLIC_SUPABASE_URL,
      envServer.SUPABASE_SERVICE_ROLE_KEY
    );

    const searchParams = request.nextUrl.searchParams;
    const summary = searchParams.get("summary") === "1";
    const includeItems = searchParams.get("includeItems") !== "0";
    const limitParam = searchParams.get("limit");
    const limit = limitParam ? Number(limitParam) : null;
    const pageParam = searchParams.get("page");
    const pageSizeParam = searchParams.get("pageSize");
    const page = pageParam ? Number(pageParam) : null;
    const pageSize = pageSizeParam ? Number(pageSizeParam) : null;

    const baseSelect =
      "id, total_amount, status, order_date, delivery_date";
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

    let query = (supabase as any)
      .from("orders")
      .select(selectClause)
      .eq("user_id", userId)
      .order("order_date", { ascending: false });

    if (
      typeof page === "number" &&
      page >= 1 &&
      typeof pageSize === "number" &&
      pageSize > 0
    ) {
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      query = query.range(from, to);
    } else if (typeof limit === "number" && !Number.isNaN(limit)) {
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
        created_at: o.order_date,
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
