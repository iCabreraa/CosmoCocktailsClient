import Image from "next/image";
import AddToCartWithQuantity from "@/components/cart/AddToCartWithQuantity";
import { createClient } from "@/lib/supabase/server";
import { cocktailFlavorMap, FlavorProfile } from "@/data/cocktailInfo";

interface CocktailSize {
  id: string;
  price: number;
  available: boolean;
  sizes_id: string;
  size: {
    name: string | null;
    volume_ml: number | null;
  } | null;
}

export default async function CocktailDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createClient();
  // Cocktail principal
  const { data: cocktail, error } = await supabase
    .from("cocktails")
    .select(
      `id, name, description, image_url, alcohol_percentage, has_non_alcoholic_version`
    )
    .eq("id", params.id)
    .single();

  if (!cocktail || error) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <p className="text-cosmic-silver">Cocktail not found.</p>
      </div>
    );
  }

  // Cocktail_sizes sin join
  const { data: rawSizes } = await supabase
    .from("cocktail_sizes")
    .select("id, price, available, sizes_id")
    .eq("cocktail_id", params.id)
    .eq("available", true);

  const sizeIds = rawSizes?.map(s => s.sizes_id).filter(Boolean) ?? [];

  // Info de tamaños desde la tabla sizes
  const { data: sizeDetails } = await supabase
    .from("sizes")
    .select("id, name, volume_ml")
    .in("id", sizeIds);

  // Unión manual
  const sizes: CocktailSize[] =
    rawSizes?.map(s => ({
      id: s.id,
      price: s.price,
      available: s.available,
      sizes_id: s.sizes_id,
      size: sizeDetails?.find(d => d.id === s.sizes_id) ?? null,
    })) ?? [];

  const flavor: FlavorProfile | undefined = cocktailFlavorMap[cocktail.id];

  return (
    <section className="py-24 px-6">
      <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-8">
        <div className="relative h-72 md:h-96">
          <Image
            src={cocktail.image_url ?? "/images/placeholder.webp"}
            alt={cocktail.name}
            fill
            className="object-cover rounded-xl"
          />
        </div>

        <div className="flex flex-col gap-6">
          <h1 className="text-3xl md:text-4xl font-[--font-unica] text-cosmic-gold">
            {cocktail.name}
          </h1>

          {cocktail.description && (
            <p className="text-cosmic-silver">{cocktail.description}</p>
          )}

          {cocktail.has_non_alcoholic_version && (
            <p className="text-sm text-cosmic-gold">
              Non-alcoholic option available
            </p>
          )}

          {/* Alcohol strength */}
          <div>
            <p className="text-sm text-cosmic-silver mb-1">Alcohol strength</p>
            <div className="w-full bg-cosmic-sky/40 h-3 rounded">
              <div
                className="h-3 bg-cosmic-gold rounded"
                style={{ width: `${cocktail.alcohol_percentage}%` }}
              />
            </div>
            <p className="text-xs text-cosmic-fog mt-1">
              ABV: {cocktail.alcohol_percentage}%
            </p>
          </div>

          {/* Flavor profile */}
          {flavor && (
            <div className="space-y-2">
              <p className="text-sm text-cosmic-silver">Flavor profile</p>
              {Object.entries(flavor).map(([key, value]) => (
                <div key={key} className="flex items-center gap-2">
                  <span className="w-20 capitalize text-sm text-cosmic-fog">
                    {key}
                  </span>
                  <div className="flex-1 bg-cosmic-sky/40 h-2 rounded">
                    <div
                      className="h-2 bg-cosmic-gold rounded"
                      style={{ width: `${value}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Sizes */}
          {sizes.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-lg font-[--font-unica] text-cosmic-gold mb-2">
                Available Sizes
              </h2>

              {sizes.map(size => (
                <div
                  key={size.id}
                  className="flex justify-between items-center border-b border-cosmic-gold/20 pb-2"
                >
                  <div>
                    <p className="font-[--font-josefin]">
                      {size.size?.name}
                      {size.size?.volume_ml
                        ? ` (${size.size.volume_ml}ml)`
                        : ""}
                    </p>
                    <p className="text-sm text-cosmic-fog">
                      €{size.price.toFixed(2)}
                    </p>
                  </div>

                  <AddToCartWithQuantity
                    cocktailId={cocktail.id}
                    cocktailName={cocktail.name}
                    cocktailImage={cocktail.image_url ?? "/images/placeholder.webp"}
                    sizeId={size.sizes_id}
                    sizeName={size.size?.name ?? "Unknown"}
                    volumeMl={size.size?.volume_ml ?? 0}
                    price={size.price}
                    cocktailSizeId={size.id}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
