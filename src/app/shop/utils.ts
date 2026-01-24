import type { CocktailWithPrice } from "@/types";

type RawSize = {
  id: string;
  price: number;
  sizes_id: string | null;
  available: boolean | null;
  stock_quantity?: number | null;
  sizes: {
    id: string;
    name: string | null;
    volume_ml: number | null;
  } | null;
};

type RawCocktail = {
  id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  alcohol_percentage: number;
  has_non_alcoholic_version: boolean | null;
  cocktail_sizes?: RawSize[] | null;
};

export function mapCocktailsWithPrices(
  rows: RawCocktail[],
  tagsByCocktail: Record<string, string[]> = {}
): CocktailWithPrice[] {
  return rows.map(cocktail => {
    const sizes =
      cocktail.cocktail_sizes
        ?.filter(size => Boolean(size))
        .filter(size => Boolean(size.sizes_id))
        .map(size => ({
          id: size.id,
          price: size.price,
          sizes_id: size.sizes_id as string,
          size_name: size.sizes?.name ?? null,
          volume_ml: size.sizes?.volume_ml ?? null,
          available: size.available ?? true,
          stock_quantity: size.stock_quantity ?? null,
        })) ?? [];

    sizes.sort((a, b) => a.price - b.price);

    const inStockSizes = sizes.filter(
      size =>
        size.available !== false &&
        (size.stock_quantity === null || size.stock_quantity > 0)
    );
    const minSize = inStockSizes[0];

    return {
      id: cocktail.id,
      name: cocktail.name,
      description: cocktail.description,
      image_url: cocktail.image_url,
      min_price: minSize ? minSize.price : null,
      min_size_id: minSize ? minSize.id : null,
      alcohol_percentage: cocktail.alcohol_percentage ?? 0,
      has_non_alcoholic_version: Boolean(
        cocktail.has_non_alcoholic_version
      ),
      sizes,
      tags: tagsByCocktail[cocktail.id] ?? [],
    };
  });
}
