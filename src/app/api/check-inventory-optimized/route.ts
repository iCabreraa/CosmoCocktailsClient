import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { envServer } from "@/lib/env-server";

const supabase = createClient(
  envServer.NEXT_PUBLIC_SUPABASE_URL,
  envServer.SUPABASE_SERVICE_ROLE_KEY
);

// Caché simple en memoria para consultas frecuentes
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 30 * 1000; // 30 segundos

export async function POST(request: NextRequest) {
  try {
    const { cocktail_id, sizes_id } = await request.json();

    console.log("🔍 [check-inventory-optimized] Request received:", {
      cocktail_id,
      sizes_id,
    });

    if (!cocktail_id || !sizes_id) {
      console.error("❌ [check-inventory-optimized] Missing parameters:", {
        cocktail_id,
        sizes_id,
      });
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      );
    }

    // Validar formato UUID
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(cocktail_id) || !uuidRegex.test(sizes_id)) {
      console.error("❌ [check-inventory-optimized] Invalid UUID format:", {
        cocktail_id,
        sizes_id,
      });
      return NextResponse.json({
        available: false,
        stock_quantity: 0,
      });
    }

    // Verificar caché
    const cacheKey = `${cocktail_id}-${sizes_id}`;
    const cached = cache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      console.log("📦 [check-inventory-optimized] Cache hit:", cacheKey);
      return NextResponse.json(cached.data);
    }

    console.log(
      "🔍 [check-inventory-optimized] Querying cocktail_sizes table..."
    );

    // Consulta optimizada con índices
    const { data, error } = await supabase
      .from("cocktail_sizes")
      .select("available, stock_quantity, cocktail_id, sizes_id")
      .eq("cocktail_id", cocktail_id)
      .eq("sizes_id", sizes_id)
      .single(); // Usar single() para obtener un solo resultado

    if (error) {
      console.error("❌ [check-inventory-optimized] Supabase error:", error);
      return NextResponse.json(
        { error: "Failed to check inventory", details: error.message },
        { status: 500 }
      );
    }

    console.log("📦 [check-inventory-optimized] Query result:", {
      data,
    });

    const result = {
      available: data?.available ?? false,
      stock_quantity: data?.stock_quantity ?? 0,
      cocktail_id,
      sizes_id,
    };

    // Guardar en caché
    cache.set(cacheKey, {
      data: result,
      timestamp: Date.now(),
    });

    // Limpiar caché expirado
    for (const [key, value] of cache.entries()) {
      if (Date.now() - value.timestamp > CACHE_TTL) {
        cache.delete(key);
      }
    }

    console.log("✅ [check-inventory-optimized] Response:", result);

    return NextResponse.json(result);
  } catch (error) {
    console.error("❌ [check-inventory-optimized] Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Endpoint para limpiar caché (solo en desarrollo)
export async function DELETE() {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json(
      { error: "Not allowed in production" },
      { status: 403 }
    );
  }

  cache.clear();
  console.log("🧹 [check-inventory-optimized] Cache cleared");

  return NextResponse.json({ message: "Cache cleared successfully" });
}

// Endpoint para obtener estadísticas de caché
export async function GET() {
  const stats = {
    cacheSize: cache.size,
    cacheKeys: Array.from(cache.keys()),
    timestamp: Date.now(),
  };

  return NextResponse.json(stats);
}
