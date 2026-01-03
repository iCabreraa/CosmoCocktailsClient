import { NextRequest, NextResponse } from "next/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { envServer } from "@/lib/env-server";

export const dynamic = "force-dynamic";

const parsePositiveInt = (value: string | null) => {
  if (!value) return null;
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) return null;
  return Math.floor(parsed);
};

export async function GET(request: NextRequest) {
  try {
    const supabaseAuth = createServerClient();
    const {
      data: { user },
      error: authError,
    } = await supabaseAuth.auth.getUser();

    if (authError || !user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = user.id;

    const supabase = createAdminClient(
      envServer.NEXT_PUBLIC_SUPABASE_URL,
      envServer.SUPABASE_SERVICE_ROLE_KEY
    );

    const searchParams = request.nextUrl.searchParams;
    const summary = searchParams.get("summary") === "1";
    const includeItems = searchParams.get("includeItems") !== "0";
    const limit = parsePositiveInt(searchParams.get("limit"));
    const page = parsePositiveInt(searchParams.get("page"));
    const pageSize = parsePositiveInt(searchParams.get("pageSize"));

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

    const totalsQuery = summary
      ? (supabase as any)
          .from("orders")
          .select("total_amount", { count: "exact" })
          .eq("user_id", userId)
      : null;

    const [ordersResult, totalsResult] = await Promise.all([
      query,
      totalsQuery ??
        Promise.resolve({
          data: null,
          error: null,
          count: null,
        }),
    ]);

    const { data: orders, error } = ordersResult;

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

    let meta = undefined;
    if (summary) {
      if (totalsResult?.error) {
        console.warn("Error fetching order summary:", totalsResult.error);
      }

      const totalOrders =
        typeof totalsResult?.count === "number"
          ? totalsResult.count
          : orders?.length ?? 0;
      const totalSpent = Array.isArray(totalsResult?.data)
        ? totalsResult.data.reduce(
            (sum: number, row: any) => sum + Number(row?.total_amount ?? 0),
            0
          )
        : 0;

      let hasNext: boolean | null = null;
      if (typeof totalOrders === "number") {
        if (page && pageSize) {
          hasNext = page * pageSize < totalOrders;
        } else if (limit) {
          hasNext = limit < totalOrders;
        }
      }

      meta = {
        total_orders: totalOrders,
        total_spent: totalSpent,
        page: page ?? null,
        page_size: pageSize ?? null,
        has_next: hasNext,
      };
    }

    return NextResponse.json(meta ? { orders: mapped, meta } : { orders: mapped });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("/api/orders error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
