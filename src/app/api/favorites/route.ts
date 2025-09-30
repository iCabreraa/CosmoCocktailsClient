import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await supabase
    .from("user_favorites")
    .select(
      `
      cocktail_id, 
      created_at, 
      cocktails(
        name, 
        description, 
        image_url, 
        alcohol_percentage,
        cocktail_sizes(
          id,
          price,
          sizes(id, name, volume_ml)
        )
      )
      `
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });

  const favorites = (data || []).map((row: any) => {
    // Obtener el precio mínimo de todos los tamaños disponibles
    const prices =
      row.cocktails?.cocktail_sizes?.map((cs: any) => cs.price) || [];
    const minPrice = prices.length > 0 ? Math.min(...prices) : 0;

    // Preparar tamaños disponibles
    const sizes =
      row.cocktails?.cocktail_sizes?.map((cs: any) => ({
        id: cs.id,
        name: cs.sizes?.name || "Tamaño",
        volume_ml: cs.sizes?.volume_ml || 0,
        price: cs.price,
      })) || [];

    return {
      id: row.cocktail_id,
      name: row.cocktails?.name,
      description: row.cocktails?.description,
      image_url: row.cocktails?.image_url,
      price: minPrice,
      category:
        row.cocktails?.alcohol_percentage > 0 ? "Alcohólico" : "Sin alcohol",
      added_at: row.created_at,
      sizes: sizes,
    };
  });

  return NextResponse.json({ favorites });
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

  // @ts-expect-error - Supabase types issue in build environments
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
