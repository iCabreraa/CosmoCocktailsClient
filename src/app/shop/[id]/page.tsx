"use client";

import Image from "next/image";
import AddToCartWithQuantity from "@/components/cart/AddToCartWithQuantity";
import { createClient } from "@/lib/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Star } from "lucide-react";

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

type FlavorProfile = {
  sweet: number;
  bitter: number;
  sour: number;
  tropical: number;
};

type CocktailProfile = {
  summary: string | null;
  why_love: string | null;
  story: string | null;
};

type CocktailServing = {
  glassware: string | null;
  ice: string | null;
  garnish: string | null;
  notes: string | null;
};

type CocktailServingStep = {
  step_number: number;
  instruction: string;
};

type CocktailIngredientRow = {
  amount: string | null;
  is_garnish: boolean | null;
  display_order: number | null;
  ingredients: {
    name: string;
    description: string | null;
  } | null;
};

type CocktailAllergenRow = {
  presence: "contains" | "may_contain";
  allergens: {
    name: string;
    icon: string | null;
    description: string | null;
  } | null;
};

type CocktailWarningRow = {
  warnings: {
    title: string;
    description: string | null;
  } | null;
};

type CocktailTagRow = {
  tags: {
    id: string;
    name: string;
    category: string;
  } | null;
};

type CocktailMediaRow = {
  url: string;
  alt_text: string | null;
  is_primary: boolean | null;
  sort_order: number | null;
};

type RelatedCocktailRow = {
  cocktail_id: string;
  cocktails: {
    id: string;
    name: string;
    image_url: string | null;
  } | null;
};

export default function CocktailDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const { t } = useLanguage();
  const [cocktail, setCocktail] = useState<any>(null);
  const [sizes, setSizes] = useState<CocktailSize[]>([]);
  const [profile, setProfile] = useState<CocktailProfile | null>(null);
  const [flavorProfile, setFlavorProfile] = useState<FlavorProfile | null>(
    null
  );
  const [serving, setServing] = useState<CocktailServing | null>(null);
  const [servingSteps, setServingSteps] = useState<CocktailServingStep[]>([]);
  const [ingredients, setIngredients] = useState<CocktailIngredientRow[]>([]);
  const [allergens, setAllergens] = useState<CocktailAllergenRow[]>([]);
  const [warnings, setWarnings] = useState<CocktailWarningRow[]>([]);
  const [tags, setTags] = useState<CocktailTagRow[]>([]);
  const [media, setMedia] = useState<CocktailMediaRow[]>([]);
  const [activeMedia, setActiveMedia] = useState<string | null>(null);
  const [relatedCocktails, setRelatedCocktails] = useState<
    RelatedCocktailRow[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    async function fetchCocktail() {
      try {
        const { data: cocktailData, error: cocktailError } = await supabase
          .from("cocktails")
          .select(
            "id, name, description, image_url, alcohol_percentage, has_non_alcoholic_version"
          )
          .eq("id", params.id)
          .single();

        if (!cocktailData || cocktailError) {
          setError("Cocktail not found");
          return;
        }

        const [
          sizesResponse,
          profileResponse,
          flavorResponse,
          servingResponse,
          servingStepsResponse,
          ingredientsResponse,
          allergensResponse,
          warningsResponse,
          tagsResponse,
          mediaResponse,
        ] = await Promise.all([
          supabase
            .from("cocktail_sizes")
            .select("id, price, available, sizes_id")
            .eq("cocktail_id", params.id)
            .eq("available", true),
          supabase
            .from("cocktail_profiles")
            .select("summary, why_love, story")
            .eq("cocktail_id", params.id)
            .maybeSingle(),
          supabase
            .from("cocktail_flavor_profiles")
            .select("sweet, bitter, sour, tropical")
            .eq("cocktail_id", params.id)
            .maybeSingle(),
          supabase
            .from("cocktail_serving")
            .select("glassware, ice, garnish, notes")
            .eq("cocktail_id", params.id)
            .maybeSingle(),
          supabase
            .from("cocktail_serving_steps")
            .select("step_number, instruction")
            .eq("cocktail_id", params.id)
            .order("step_number", { ascending: true }),
          supabase
            .from("cocktail_ingredients")
            .select(
              "amount, is_garnish, display_order, ingredients(name, description)"
            )
            .eq("cocktail_id", params.id)
            .order("display_order", { ascending: true }),
          supabase
            .from("cocktail_allergens")
            .select("presence, allergens(name, icon, description)")
            .eq("cocktail_id", params.id),
          supabase
            .from("cocktail_warnings")
            .select("warnings(title, description)")
            .eq("cocktail_id", params.id),
          supabase
            .from("cocktail_tags")
            .select("tags(id, name, category)")
            .eq("cocktail_id", params.id),
          supabase
            .from("cocktail_media")
            .select("url, alt_text, is_primary, sort_order")
            .eq("cocktail_id", params.id)
            .order("is_primary", { ascending: false })
            .order("sort_order", { ascending: true }),
        ]);

        const rawSizes = sizesResponse.data ?? [];
        const sizeIds = rawSizes.map(s => (s as any).sizes_id).filter(Boolean);

        const { data: sizeDetails } = await supabase
          .from("sizes")
          .select("id, name, volume_ml")
          .in("id", sizeIds);

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

        const mediaData = (mediaResponse.data ?? []) as CocktailMediaRow[];
        const primaryMedia =
          mediaData.find(item => item.is_primary) ?? mediaData[0] ?? null;

        let relatedData: RelatedCocktailRow[] = [];
        const tagIds =
          (tagsResponse.data ?? [])
            .map(item => item.tags?.id)
            .filter(Boolean) ?? [];

        if (tagIds.length > 0) {
          const relatedResponse = await supabase
            .from("cocktail_tags")
            .select("cocktail_id, cocktails(id, name, image_url)")
            .in("tag_id", tagIds)
            .neq("cocktail_id", params.id);
          relatedData = (relatedResponse.data ?? []) as RelatedCocktailRow[];
        }

        setCocktail(cocktailData);
        setSizes(sizesData);
        setProfile((profileResponse.data ?? null) as CocktailProfile | null);
        setFlavorProfile(
          (flavorResponse.data ?? null) as FlavorProfile | null
        );
        setServing((servingResponse.data ?? null) as CocktailServing | null);
        setServingSteps(
          (servingStepsResponse.data ?? []) as CocktailServingStep[]
        );
        setIngredients(
          (ingredientsResponse.data ?? []) as CocktailIngredientRow[]
        );
        setAllergens((allergensResponse.data ?? []) as CocktailAllergenRow[]);
        setWarnings((warningsResponse.data ?? []) as CocktailWarningRow[]);
        setTags((tagsResponse.data ?? []) as CocktailTagRow[]);
        setMedia(mediaData);
        setActiveMedia(primaryMedia?.url ?? cocktailData.image_url ?? null);

        const uniqueRelated = new Map<string, RelatedCocktailRow>();
        relatedData.forEach(item => {
          if (item.cocktails?.id && !uniqueRelated.has(item.cocktails.id)) {
            uniqueRelated.set(item.cocktails.id, item);
          }
        });
        setRelatedCocktails(Array.from(uniqueRelated.values()).slice(0, 4));
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

  const flavor = flavorProfile;
  const heroImage = activeMedia ?? cocktail.image_url ?? "/images/placeholder.webp";
  const gallery =
    media.length > 1 ? media.filter(item => item.url !== heroImage) : [];
  const baseIngredients = ingredients.filter(item => !item.is_garnish);
  const garnishIngredients = ingredients.filter(item => item.is_garnish);
  const featuredTags = tags
    .map(item => item.tags?.name)
    .filter(Boolean) as string[];

  return (
    <section className="py-24 px-6">
      <div className="max-w-6xl mx-auto space-y-16">
        {/* Back button */}
        <Link
          href="/shop"
          className="inline-flex items-center gap-2 text-cosmic-gold hover:text-white transition mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          {t("cocktail.back_to_shop")}
        </Link>

        <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-10">
          <div className="space-y-6">
            <div className="relative aspect-[4/5] w-full overflow-hidden rounded-3xl border border-cosmic-gold/20 bg-black/40 shadow-[0_0_40px_rgba(219,184,99,0.2)]">
              <Image
                src={heroImage}
                alt={cocktail.name}
                fill
                className="object-cover"
                priority
              />
            </div>
            {gallery.length > 0 && (
              <div className="grid grid-cols-4 gap-3">
                {gallery.map(item => (
                  <button
                    key={item.url}
                    type="button"
                    onClick={() => setActiveMedia(item.url)}
                    className="relative aspect-square overflow-hidden rounded-2xl border border-cosmic-gold/20 bg-black/20 transition hover:border-cosmic-gold/60"
                  >
                    <Image
                      src={item.url}
                      alt={item.alt_text ?? cocktail.name}
                      fill
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-col gap-6">
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {featuredTags.map(tag => (
                  <span
                    key={tag}
                    className="rounded-full border border-cosmic-gold/40 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-cosmic-gold"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <h1 className="text-4xl font-[--font-unica] text-cosmic-gold">
              {cocktail.name}
            </h1>
            </div>

            <p className="text-cosmic-silver text-base leading-relaxed">
              {profile?.summary || cocktail.description}
            </p>

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

            {profile?.why_love && (
              <div className="rounded-2xl border border-cosmic-gold/20 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-cosmic-gold/80 mb-2">
                  {t("cocktail.why_love")}
                </p>
                <p className="text-cosmic-silver leading-relaxed">
                  {profile.why_love}
                </p>
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
                      isAlcoholic={cocktail.alcohol_percentage > 0}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="grid lg:grid-cols-[1fr_0.6fr] gap-10">
          <div className="space-y-8">
            <div className="rounded-3xl border border-cosmic-gold/15 bg-white/5 p-6">
              <h2 className="text-xl font-[--font-unica] text-cosmic-gold mb-4">
                {t("cocktail.ingredients")}
              </h2>
              <div className="grid md:grid-cols-2 gap-6 text-sm text-cosmic-silver">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-cosmic-gold/70 mb-3">
                    {t("cocktail.core_ingredients")}
                  </p>
                  <ul className="space-y-2">
                    {baseIngredients.map(item => (
                      <li key={`${item.ingredients?.name}-${item.amount}`}>
                        <span className="font-medium text-cosmic-text">
                          {item.ingredients?.name}
                        </span>
                        {item.amount && (
                          <span className="text-cosmic-fog">
                            {" "}
                            · {item.amount}
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-cosmic-gold/70 mb-3">
                    {t("cocktail.garnish")}
                  </p>
                  <ul className="space-y-2">
                    {garnishIngredients.map(item => (
                      <li key={`${item.ingredients?.name}-garnish`}>
                        <span className="font-medium text-cosmic-text">
                          {item.ingredients?.name}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-cosmic-gold/15 bg-white/5 p-6">
              <h2 className="text-xl font-[--font-unica] text-cosmic-gold mb-4">
                {t("cocktail.serving_guide")}
              </h2>
              <div className="grid md:grid-cols-3 gap-4 text-sm text-cosmic-silver mb-6">
                <div className="rounded-2xl border border-cosmic-gold/10 bg-black/30 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-cosmic-gold/70 mb-2">
                    {t("cocktail.glassware")}
                  </p>
                  <p className="text-cosmic-text">{serving?.glassware}</p>
                </div>
                <div className="rounded-2xl border border-cosmic-gold/10 bg-black/30 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-cosmic-gold/70 mb-2">
                    {t("cocktail.ice")}
                  </p>
                  <p className="text-cosmic-text">{serving?.ice}</p>
                </div>
                <div className="rounded-2xl border border-cosmic-gold/10 bg-black/30 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-cosmic-gold/70 mb-2">
                    {t("cocktail.garnish")}
                  </p>
                  <p className="text-cosmic-text">{serving?.garnish}</p>
                </div>
              </div>

              <ol className="space-y-3 text-sm text-cosmic-silver">
                {servingSteps.map(step => (
                  <li key={step.step_number} className="flex gap-3">
                    <span className="mt-0.5 flex h-6 w-6 items-center justify-center rounded-full border border-cosmic-gold/40 text-[11px] text-cosmic-gold">
                      {step.step_number}
                    </span>
                    <span className="text-cosmic-text">{step.instruction}</span>
                  </li>
                ))}
              </ol>
            </div>

            {profile?.story && (
              <div className="rounded-3xl border border-cosmic-gold/15 bg-white/5 p-6">
                <h2 className="text-xl font-[--font-unica] text-cosmic-gold mb-4">
                  {t("cocktail.story")}
                </h2>
                <p className="text-cosmic-silver leading-relaxed">
                  {profile.story}
                </p>
              </div>
            )}
          </div>

          <aside className="space-y-8">
            <div className="rounded-3xl border border-cosmic-gold/15 bg-black/40 p-6">
              <h3 className="text-lg font-[--font-unica] text-cosmic-gold mb-4 flex items-center gap-2">
                <Star className="h-4 w-4" />
                {t("cocktail.allergens")}
              </h3>
              {allergens.length === 0 ? (
                <p className="text-cosmic-silver text-sm">
                  {t("cocktail.no_allergens")}
                </p>
              ) : (
                <ul className="space-y-3 text-sm text-cosmic-silver">
                  {allergens.map(item => (
                    <li
                      key={`${item.allergens?.name}-${item.presence}`}
                      className="flex items-center justify-between gap-2 rounded-xl border border-cosmic-gold/10 bg-white/5 px-3 py-2"
                    >
                      <span className="text-cosmic-text">
                        {item.allergens?.name}
                      </span>
                      <span className="text-[11px] uppercase tracking-[0.16em] text-cosmic-gold/70">
                        {item.presence === "contains"
                          ? t("cocktail.contains")
                          : t("cocktail.may_contain")}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {warnings.length > 0 && (
              <div className="rounded-3xl border border-cosmic-gold/15 bg-black/40 p-6">
                <h3 className="text-lg font-[--font-unica] text-cosmic-gold mb-4">
                  {t("cocktail.warnings")}
                </h3>
                <ul className="space-y-3 text-sm text-cosmic-silver">
                  {warnings.map(item => (
                    <li
                      key={item.warnings?.title}
                      className="rounded-xl border border-cosmic-gold/10 bg-white/5 px-3 py-2"
                    >
                      <p className="text-cosmic-text font-medium">
                        {item.warnings?.title}
                      </p>
                      {item.warnings?.description && (
                        <p className="text-xs text-cosmic-fog">
                          {item.warnings.description}
                        </p>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {relatedCocktails.length > 0 && (
              <div className="rounded-3xl border border-cosmic-gold/15 bg-white/5 p-6">
                <h3 className="text-lg font-[--font-unica] text-cosmic-gold mb-4">
                  {t("cocktail.related_cocktails")}
                </h3>
                <div className="space-y-4">
                  {relatedCocktails.map(item => (
                    <Link
                      key={item.cocktail_id}
                      href={`/shop/${item.cocktails?.id}`}
                      className="flex items-center gap-3 rounded-2xl border border-cosmic-gold/10 bg-black/30 p-3 transition hover:border-cosmic-gold/60"
                    >
                      <div className="relative h-14 w-14 overflow-hidden rounded-xl border border-cosmic-gold/20">
                        <Image
                          src={
                            item.cocktails?.image_url ??
                            "/images/placeholder.webp"
                          }
                          alt={item.cocktails?.name ?? "Cocktail"}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div>
                        <p className="text-sm text-cosmic-text">
                          {item.cocktails?.name}
                        </p>
                        <p className="text-xs text-cosmic-fog">
                          {t("cocktail.discover")}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </aside>
        </div>
      </div>
    </section>
  );
}
