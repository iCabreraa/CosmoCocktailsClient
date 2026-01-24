import { supabase } from "@/lib/supabaseClient";
import ShopClient from "./ShopClient";
import { mapCocktailsWithPrices } from "./utils";

const PAGE_SIZE = 12;

export const revalidate = 60;

async function getInitialShopData() {
  const { data, error, count } = await supabase
    .from("cocktails")
    .select(
      `
        id,
        name,
        description,
        image_url,
        is_available,
        alcohol_percentage,
        has_non_alcoholic_version,
        cocktail_sizes (
          id,
          price,
          sizes_id,
          available,
          stock_quantity,
          sizes (
            id,
            name,
            volume_ml
          )
        )
      `,
      { count: "exact" }
    )
    .eq("is_available", true)
    .order("name", { ascending: true })
    .range(0, PAGE_SIZE - 1);

  if (error) {
    console.error("Error loading shop data:", error);
    return { cocktails: [], totalCount: 0, hasMore: false };
  }

  const ids = (data ?? []).map(row => row.id);
  const tagsByCocktail: Record<string, string[]> = {};

  if (ids.length > 0) {
    const { data: tagRows, error: tagError } = await supabase
      .from("cocktail_tags")
      .select("cocktail_id, tags(name)")
      .in("cocktail_id", ids);

    if (tagError) {
      console.warn("Error loading cocktail tags:", tagError);
    } else {
      (tagRows ?? []).forEach((row: any) => {
        const name = row?.tags?.name;
        if (!name) return;
        if (!tagsByCocktail[row.cocktail_id]) {
          tagsByCocktail[row.cocktail_id] = [];
        }
        tagsByCocktail[row.cocktail_id].push(name);
      });
    }
  }

  const cocktails = mapCocktailsWithPrices(
    (data ?? []) as any[],
    tagsByCocktail
  );
  const totalCount = typeof count === "number" ? count : cocktails.length;
  const hasMore =
    typeof count === "number"
      ? cocktails.length < count
      : cocktails.length === PAGE_SIZE;

  return { cocktails, totalCount, hasMore };
}

export default async function ShopPage() {
  const { cocktails, totalCount, hasMore } = await getInitialShopData();

  return (
    <ShopClient
      initialCocktails={cocktails}
      initialTotalCount={totalCount}
      initialHasMore={hasMore}
    />
  );
}
