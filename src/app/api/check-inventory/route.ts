import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { envServer } from "@/lib/env-server";

const supabase = createClient(
  envServer.NEXT_PUBLIC_SUPABASE_URL,
  envServer.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { cocktail_id, sizes_id } = body || {};
    const items = Array.isArray(body?.items) ? body.items : null;

    console.log("🔍 [check-inventory] Request received:", {
      cocktail_id,
      sizes_id,
      items: items ? items.length : 0,
    });

    // Validar formato UUID
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (items) {
      const normalizedItems = items
        .map((item: any) => ({
          cocktail_id: item?.cocktail_id,
          sizes_id: item?.sizes_id,
        }))
        .filter((item: any) => item.cocktail_id && item.sizes_id);

      const validItems = normalizedItems.filter(
        (item: any) =>
          uuidRegex.test(item.cocktail_id) && uuidRegex.test(item.sizes_id)
      );

      if (normalizedItems.length === 0) {
        return NextResponse.json({ results: [] });
      }

      let inventoryRows: any[] = [];
      if (validItems.length > 0) {
        const orConditions = validItems
          .map(
            item =>
              `and(cocktail_id.eq.${item.cocktail_id},sizes_id.eq.${item.sizes_id})`
          )
          .join(",");

        const { data, error } = await supabase
          .from("cocktail_sizes")
          .select("available, stock_quantity, cocktail_id, sizes_id")
          .or(orConditions);

        if (error) {
          console.error("❌ [check-inventory] Supabase error:", error);
          return NextResponse.json(
            { error: "Failed to check inventory", details: error.message },
            { status: 500 }
          );
        }

        inventoryRows = data ?? [];
      }

      const results = normalizedItems.map(item => {
        const match = inventoryRows.find(
          row =>
            row.cocktail_id === item.cocktail_id &&
            row.sizes_id === item.sizes_id
        );
        return {
          cocktail_id: item.cocktail_id,
          sizes_id: item.sizes_id,
          available: match?.available ?? false,
          stock_quantity: match?.stock_quantity ?? 0,
        };
      });

      return NextResponse.json({ results });
    }

    if (!cocktail_id || !sizes_id) {
      console.error("❌ [check-inventory] Missing parameters:", {
        cocktail_id,
        sizes_id,
      });
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      );
    }

    if (!uuidRegex.test(cocktail_id) || !uuidRegex.test(sizes_id)) {
      console.error("❌ [check-inventory] Invalid UUID format:", {
        cocktail_id,
        sizes_id,
      });
      return NextResponse.json({
        available: false,
        stock_quantity: 0,
      });
    }

    console.log("🔍 [check-inventory] Querying cocktail_sizes table...");

    const { data, error } = await supabase
      .from("cocktail_sizes")
      .select("available, stock_quantity, cocktail_id, sizes_id")
      .eq("cocktail_id", cocktail_id)
      .eq("sizes_id", sizes_id);

    if (error) {
      console.error("❌ [check-inventory] Supabase error:", error);
      return NextResponse.json(
        { error: "Failed to check inventory", details: error.message },
        { status: 500 }
      );
    }

    console.log("📦 [check-inventory] Query result:", {
      dataCount: data?.length || 0,
      data: data,
    });

    // Si no hay datos, significa que no existe esa combinación
    if (!data || data.length === 0) {
      console.log(
        "⚠️ [check-inventory] No inventory record found for this combination"
      );

      // Debug: Verificar si existen los IDs en las tablas padre
      const { data: cocktailExists } = await supabase
        .from("cocktails")
        .select("id, name")
        .eq("id", cocktail_id)
        .single();

      const { data: sizeExists } = await supabase
        .from("sizes")
        .select("id, name")
        .eq("id", sizes_id)
        .single();

      console.log("🔍 [check-inventory] Parent table verification:", {
        cocktailExists: !!cocktailExists,
        cocktailName: cocktailExists?.name,
        sizeExists: !!sizeExists,
        sizeName: sizeExists?.name,
      });

      return NextResponse.json({
        available: false,
        stock_quantity: 0,
      });
    }

    const inventoryData = data[0];
    console.log("✅ [check-inventory] Inventory data found:", inventoryData);

    return NextResponse.json({
      available: inventoryData.available || false,
      stock_quantity: inventoryData.stock_quantity || 0,
    });
  } catch (error) {
    console.error("🚨 [check-inventory] Unexpected error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
