import Image from "next/image";
import AddToCartWithQuantity from "@/components/cart/AddToCartWithQuantity";
import { supabase } from "@/lib/supabaseClient";
import {
  cocktailFlavorMap,
  FlavorProfile,
  cocktailDescriptions,
} from "@/data/cocktailInfo";
import { useLanguage } from "@/contexts/LanguageContext";
import ClientLabels from "./client-labels";

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
  // Server Component: we will localize static labels by reading current html lang
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
      <ClientLabels />
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

          {(() => {
            // Multilingual description fallback: DB -> map by lang -> DB default
            const lang =
              typeof document !== "undefined"
                ? document.documentElement.lang
                : "es";
            const byMap =
              cocktailDescriptions[cocktail.id]?.[lang as "es" | "en" | "nl"];
            const text = byMap || cocktail.description;
            return text ? <p className="text-cosmic-silver">{text}</p> : null;
          })()}

          {cocktail.has_non_alcoholic_version && (
            <p className="text-sm text-cosmic-gold">
              {/* localized by client */}
            </p>
          )}

          {/* Alcohol strength */}
          <div>
            <p className="text-sm text-cosmic-silver mb-1">
              {/* localized by client */}
            </p>
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
              <p className="text-sm text-cosmic-silver">
                {/* localized by client */}
              </p>
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
                    product={{
                      id: size.id,
                      name: `${cocktail.name} (${
                        size.size?.name ?? `${size.size?.volume_ml ?? 0}ml`
                      })`,
                      slug: cocktail.id,
                      image: cocktail.image_url ?? "/images/placeholder.webp",
                      description: cocktail.description ?? "",
                      price: size.price,
                    }}
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
