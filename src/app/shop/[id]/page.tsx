"use client";

import Image from "next/image";
import AddToCartWithQuantity from "@/components/cart/AddToCartWithQuantity";
import { createClient } from "@/lib/supabase/client";
import { cocktailFlavorMap, FlavorProfile } from "@/data/cocktailInfo";
import { useLanguage } from "@/contexts/LanguageContext";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

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

export default function CocktailDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const { t } = useLanguage();
  const [cocktail, setCocktail] = useState<any>(null);
  const [sizes, setSizes] = useState<CocktailSize[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    async function fetchCocktail() {
      try {
        // Cocktail principal
        const { data: cocktailData, error: cocktailError } = await supabase
          .from("cocktails")
          .select(
            `id, name, description, image_url, alcohol_percentage, has_non_alcoholic_version`
          )
          .eq("id", params.id)
          .single();

        if (!cocktailData || cocktailError) {
          setError("Cocktail not found");
          return;
        }

        // Cocktail_sizes sin join
        const { data: rawSizes } = await supabase
          .from("cocktail_sizes")
          .select("id, price, available, sizes_id")
          .eq("cocktail_id", params.id)
          .eq("available", true);

        const sizeIds =
          rawSizes?.map(s => (s as any).sizes_id).filter(Boolean) ?? [];

        // Info de tamaños desde la tabla sizes
        const { data: sizeDetails } = await supabase
          .from("sizes")
          .select("id, name, volume_ml")
          .in("id", sizeIds);

        // Unión manual
        const sizesData: CocktailSize[] =
          rawSizes?.map(s => ({
            id: (s as any).id,
            price: (s as any).price,
            available: (s as any).available,
            sizes_id: (s as any).sizes_id,
            size:
              sizeDetails?.find(d => (d as any).id === (s as any).sizes_id) ??
              null,
          })) ?? [];

        setCocktail(cocktailData);
        setSizes(sizesData);
      } catch (err) {
        setError("Error loading cocktail");
      } finally {
        setLoading(false);
      }
    }

    fetchCocktail();
  }, [params.id, supabase]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cosmic-gold"></div>
      </div>
    );
  }

  if (error || !cocktail) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <p className="text-cosmic-silver">{t("cocktail.not_found")}</p>
      </div>
    );
  }

  const flavor: FlavorProfile | undefined = cocktailFlavorMap[cocktail.id];

  return (
    <section className="py-24 px-6">
      <div className="max-w-5xl mx-auto">
        {/* Back button */}
        <Link
          href="/shop"
          className="inline-flex items-center gap-2 text-cosmic-gold hover:text-white transition mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          {t("cocktail.back_to_shop")}
        </Link>

        <div className="grid md:grid-cols-2 gap-8">
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
                {t("cocktail.non_alcoholic_available")}
              </p>
            )}

            {/* Alcohol strength */}
            <div>
              <p className="text-sm text-cosmic-silver mb-1">
                {t("cocktail.alcohol_strength")}
              </p>
              <div className="w-full bg-cosmic-sky/40 h-3 rounded">
                <div
                  className="h-3 bg-cosmic-gold rounded"
                  style={{ width: `${cocktail.alcohol_percentage}%` }}
                />
              </div>
              <p className="text-xs text-cosmic-fog mt-1">
                {t("cocktail.alcohol_content")}: {cocktail.alcohol_percentage}%
              </p>
            </div>

            {/* Flavor profile */}
            {flavor && (
              <div className="space-y-2">
                <p className="text-sm text-cosmic-silver">
                  {t("cocktail.flavor_profile")}
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
                  {t("cocktail.available_sizes")}
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
                      cocktailImage={
                        cocktail.image_url ?? "/images/placeholder.webp"
                      }
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
      </div>
    </section>
  );
}
