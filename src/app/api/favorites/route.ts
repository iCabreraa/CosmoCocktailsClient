import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const parsePositiveInt = (value: string | null) => {
  if (!value) return null;
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) return null;
  return Math.floor(parsed);
};

export async function GET(request: NextRequest) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const mode = request.nextUrl.searchParams.get("mode");
  const page = parsePositiveInt(request.nextUrl.searchParams.get("page"));
  const pageSize = parsePositiveInt(
    request.nextUrl.searchParams.get("pageSize")
  );

  if (mode === "ids") {
    const { data, error } = await supabase
      .from("user_favorites")
      .select("cocktail_id, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ favorites: data ?? [] });
  }

  let favoritesQuery = supabase
    .from("user_favorites")
    .select("cocktail_id, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (page && page >= 1) {
    const size = pageSize && pageSize > 0 ? pageSize : 5;
    const from = (page - 1) * size;
    const to = from + size - 1;
    favoritesQuery = favoritesQuery.range(from, to);
  }

  const totalsQuery = (supabase as any)
    .from("user_favorites")
    .select("cocktail_id", { count: "exact", head: true })
    .eq("user_id", user.id);

  const [favoritesResult, totalsResult] = await Promise.all([
    favoritesQuery,
    totalsQuery,
  ]);

  const { data: favoritesRows, error: favoritesError } = favoritesResult;

  if (favoritesError)
    return NextResponse.json(
      { error: favoritesError.message },
      { status: 500 }
    );

  const cocktailIds =
    favoritesRows?.map(row => row.cocktail_id).filter(Boolean) ?? [];

  if (cocktailIds.length === 0) {
    return NextResponse.json({ favorites: [] });
  }

  const { data: cocktailsData, error: cocktailsError } = await supabase
    .from("cocktails")
    .select(
      `
      id,
      name,
      description,
      image_url,
      alcohol_percentage,
      cocktail_sizes(
        id,
        sizes_id,
        available,
        stock_quantity,
        price,
        sizes(id, name, volume_ml)
      )
      `
    )
    .in("id", cocktailIds);

  if (cocktailsError)
    return NextResponse.json(
      { error: cocktailsError.message },
      { status: 500 }
    );

  const cocktailsById = new Map(
    (cocktailsData ?? []).map((cocktail: any) => [
      cocktail.id,
      cocktail,
    ])
  );

  const favorites = (favoritesRows || [])
    .map((row: any) => {
      const cocktail = cocktailsById.get(row.cocktail_id);
      if (!cocktail) return null;

      // Obtener el precio minimo de todos los tamaños disponibles
      const prices =
        cocktail.cocktail_sizes?.map((cs: any) => cs.price) || [];
      const minPrice = prices.length > 0 ? Math.min(...prices) : 0;

      // Preparar tamaños disponibles
      const sizes =
        cocktail.cocktail_sizes?.map((cs: any) => ({
          id: cs.id,
          sizes_id: cs.sizes_id ?? cs.sizes?.id,
          name: cs.sizes?.name || "Tamaño",
          volume_ml: cs.sizes?.volume_ml || 0,
          price: cs.price,
          available: cs.available,
          stock_quantity: cs.stock_quantity,
        })) || [];

      return {
        id: row.cocktail_id,
        name: cocktail.name,
        description: cocktail.description,
        image_url: cocktail.image_url,
        alcohol_percentage: cocktail.alcohol_percentage ?? 0,
        price: minPrice,
        category:
          cocktail.alcohol_percentage > 0 ? "Alcohólico" : "Sin alcohol",
        added_at: row.created_at,
        sizes: sizes,
      };
    })
    .filter(Boolean);

  const totalFavorites =
    typeof totalsResult?.count === "number"
      ? totalsResult.count
      : favoritesRows?.length ?? 0;
  const pageSizeValue = page ? (pageSize && pageSize > 0 ? pageSize : 5) : null;
  const hasNext =
    page && pageSizeValue ? page * pageSizeValue < totalFavorites : null;

  return NextResponse.json({
    favorites,
    meta: {
      total_favorites: totalFavorites,
      page: page ?? null,
      page_size: pageSizeValue,
      has_next: hasNext,
    },
  });
}

export async function POST(request: NextRequest) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { cocktail_id } = await request.json();
  if (!cocktail_id)
    return NextResponse.json(
      { error: "cocktail_id required" },
      { status: 400 }
    );

  const { error } = await (supabase as any)
    .from("user_favorites")
    .insert({ user_id: user.id, cocktail_id });

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}

export async function DELETE(request: NextRequest) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const cocktail_id = searchParams.get("cocktail_id");
  if (!cocktail_id)
    return NextResponse.json(
      { error: "cocktail_id required" },
      { status: 400 }
    );

  const { error } = await supabase
    .from("user_favorites")
    .delete()
    .eq("user_id", user.id)
    .eq("cocktail_id", cocktail_id);

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
