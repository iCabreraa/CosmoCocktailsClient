import Image from "next/image";
import AddToCartButton from "@/components/cart/AddToCartButton";
import { supabase } from "@/lib/supabaseClient";

interface CocktailSize {
  id: string;
  label: string | null;
  volume_ml: number | null;
  price: number;
}

export default async function CocktailDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const { data: cocktail, error } = await supabase
    .from("cocktails")
    .select(`id, name, description, image_url`)
    .eq("id", params.id)
    .single();

  if (!cocktail || error) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <p className="text-cosmic-silver">Cocktail not found.</p>
      </div>
    );
  }

  const { data: sizes } = await supabase
    .from("cocktail_sizes")
    .select("id, label, volume_ml, price, available")
    .eq("cocktail_id", params.id)
    .eq("available", true);

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

          {sizes && sizes.length > 0 && (
            <div className="space-y-4">
              {sizes.map((size: CocktailSize) => (
                <div
                  key={size.id}
                  className="flex justify-between items-center border-b border-cosmic-gold/20 pb-2"
                >
                  <div>
                    <p className="font-[--font-josefin]">
                      {size.label ?? `${size.volume_ml}ml`}
                    </p>
                    <p className="text-sm text-cosmic-fog">
                      €{size.price.toFixed(2)}
                    </p>
                  </div>
                  <AddToCartButton
                    product={{
                      id: size.id,
                      name: `${cocktail.name} (${
                        size.label ?? `${size.volume_ml}ml`
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
