"use client";

import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useCart } from "@/store/cart";
import { useToast } from "@/components/feedback/ToastProvider";
import {
  ArrowLeft,
  ChevronRight,
  RotateCcw,
  ShieldCheck,
  Truck,
} from "lucide-react";

interface CocktailSize {
  id: string;
  price: number;
  available: boolean;
  stock_quantity: number | null;
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

type DetailTab = "overview" | "story" | "serving" | "ingredients" | "shipping";

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
  const [selectedSizeId, setSelectedSizeId] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<DetailTab>("overview");
  const [openAccordion, setOpenAccordion] = useState<DetailTab | null>(
    "overview"
  );
  const [showStickyBar, setShowStickyBar] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { notify } = useToast();
  const addToCart = useCart(state => state.addToCart);
  const buyBoxRef = useRef<HTMLDivElement | null>(null);
  const detailsRef = useRef<HTMLDivElement | null>(null);
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
            .select("id, price, available, sizes_id, stock_quantity")
            .eq("cocktail_id", params.id),
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
            stock_quantity:
              typeof (s as any).stock_quantity === "number"
                ? (s as any).stock_quantity
                : null,
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

  useEffect(() => {
    if (!selectedSizeId && sizes.length > 0) {
      setSelectedSizeId(sizes[0].id);
    }
  }, [sizes, selectedSizeId]);

  useEffect(() => {
    function handleScroll() {
      setShowStickyBar(window.scrollY > 320);
    }
    window.addEventListener("scroll", handleScroll);
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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
    .map(item => item.tags)
    .filter(Boolean) as NonNullable<CocktailTagRow["tags"]>[];
  const visibleTags = featuredTags.slice(0, 6);
  const extraTagsCount = Math.max(0, featuredTags.length - visibleTags.length);
  const baseTag = featuredTags.find(tag => tag.category === "base")?.name;
  const styleTag = featuredTags.find(tag => tag.category === "style")?.name;
  const flavorTags = featuredTags
    .filter(tag => tag.category === "flavor")
    .map(tag => tag.name);
  const tagTones: Record<string, string> = {
    flavor: "border-emerald-400/40 bg-emerald-500/10 text-emerald-200",
    season: "border-sky-400/40 bg-sky-500/10 text-sky-200",
    base: "border-amber-400/40 bg-amber-500/10 text-amber-200",
    occasion: "border-fuchsia-400/40 bg-fuchsia-500/10 text-fuchsia-200",
    style: "border-cosmic-gold/30 bg-white/5 text-cosmic-gold/80",
  };
  const selectedSize =
    sizes.find(size => size.id === selectedSizeId) ?? null;
  const selectedPrice = selectedSize?.price ?? null;
  const selectedVolume = selectedSize?.size?.volume_ml ?? null;
  const tastingFallback = baseIngredients
    .map(item => item.ingredients?.name)
    .filter(Boolean);
  const tastingNotes = (flavorTags.length > 0
    ? flavorTags
    : tastingFallback
  ).slice(0, 3);
  const quickServeSteps = servingSteps.slice(0, 3);
  const fallbackServeSteps = [
    t("cocktail.quick_serve_step1"),
    t("cocktail.quick_serve_step2"),
    t("cocktail.quick_serve_step3"),
  ];
  const deliveryRange = "2-4";
  const shippingCost = 4.99;
  const freeShippingThreshold = 50;

  const detailTabs: Array<{ key: DetailTab; label: string }> = [
    { key: "overview", label: t("cocktail.tab_overview") },
    { key: "story", label: t("cocktail.tab_story") },
    { key: "serving", label: t("cocktail.tab_serving") },
    { key: "ingredients", label: t("cocktail.tab_ingredients") },
    { key: "shipping", label: t("cocktail.tab_shipping") },
  ];

  const faqItems = [
    {
      question: t("cocktail.faq_storage_q"),
      answer: t("cocktail.faq_storage_a"),
    },
    {
      question: t("cocktail.faq_chilled_q"),
      answer: t("cocktail.faq_chilled_a"),
    },
    {
      question: t("cocktail.faq_serves_q"),
      answer: t("cocktail.faq_serves_a"),
    },
    {
      question: t("cocktail.faq_gift_q"),
      answer: t("cocktail.faq_gift_a"),
    },
  ];

  const handleAddToCart = () => {
    if (!selectedSize) {
      buyBoxRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }
    addToCart({
      cocktail_id: cocktail.id,
      sizes_id: selectedSize.sizes_id,
      quantity,
      unit_price: selectedSize.price,
      cocktail_name: cocktail.name,
      size_name: selectedSize.size?.name ?? `${selectedVolume ?? 0}ml`,
      volume_ml: selectedVolume ?? 0,
      image_url: cocktail.image_url ?? "/images/placeholder.webp",
      is_alcoholic: cocktail.alcohol_percentage > 0,
    });
    notify({
      type: "success",
      title: t("feedback.cart_added_title"),
      message: t("feedback.cart_added_message", { name: cocktail.name }),
    });
  };

  const handleJumpToDetails = (tab: DetailTab) => {
    setActiveTab(tab);
    setOpenAccordion(tab);
    detailsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleAccordionToggle = (tab: DetailTab) => {
    setOpenAccordion(prev => (prev === tab ? null : tab));
  };

  const tastingLabels = [
    t("cocktail.tasting_nose"),
    t("cocktail.tasting_palate"),
    t("cocktail.tasting_finish"),
  ];

  const renderTabContent = (tab: DetailTab) => {
    switch (tab) {
      case "overview":
        return (
          <div className="space-y-6">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-cosmic-gold/70">
                {t("cocktail.why_love")}
              </p>
              <p className="mt-3 text-cosmic-silver leading-relaxed">
                {profile?.why_love ||
                  profile?.summary ||
                  cocktail.description}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-cosmic-gold/70">
                {t("cocktail.tasting_notes")}
              </p>
              {tastingNotes.length === 0 ? (
                <p className="mt-3 text-cosmic-silver leading-relaxed">
                  {t("cocktail.tasting_default")}
                </p>
              ) : (
                <div className="mt-3 space-y-2">
                  {tastingNotes.map((note, index) => (
                    <div
                      key={`${note}-${index}`}
                      className="flex items-center justify-between rounded-2xl border border-cosmic-gold/10 bg-black/30 px-4 py-3 text-sm text-cosmic-silver"
                    >
                      <span className="text-[11px] uppercase tracking-[0.2em] text-cosmic-gold/70">
                        {tastingLabels[index] ?? t("cocktail.tasting_notes")}
                      </span>
                      <span className="text-cosmic-text">{note}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-cosmic-gold/70">
                {t("cocktail.tech_specs")}
              </p>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-cosmic-gold/10 bg-black/30 px-4 py-3">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-cosmic-gold/60">
                    {t("cocktail.spec_abv")}
                  </p>
                  <p className="text-cosmic-text">
                    {cocktail.alcohol_percentage}%
                  </p>
                </div>
                <div className="rounded-2xl border border-cosmic-gold/10 bg-black/30 px-4 py-3">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-cosmic-gold/60">
                    {t("cocktail.spec_volume")}
                  </p>
                  <p className="text-cosmic-text">
                    {selectedVolume
                      ? `${selectedVolume}ml`
                      : t("cocktail.spec_unknown")}
                  </p>
                </div>
                <div className="rounded-2xl border border-cosmic-gold/10 bg-black/30 px-4 py-3">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-cosmic-gold/60">
                    {t("cocktail.spec_base")}
                  </p>
                  <p className="text-cosmic-text">
                    {baseTag ?? t("cocktail.spec_unknown")}
                  </p>
                </div>
                <div className="rounded-2xl border border-cosmic-gold/10 bg-black/30 px-4 py-3">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-cosmic-gold/60">
                    {t("cocktail.spec_style")}
                  </p>
                  <p className="text-cosmic-text">
                    {styleTag ?? t("cocktail.spec_unknown")}
                  </p>
                </div>
              </div>
            </div>
          </div>
        );
      case "story":
        return (
          <div className="space-y-4">
            <p className="text-cosmic-silver leading-relaxed">
              {profile?.story ||
                profile?.summary ||
                cocktail.description}
            </p>
          </div>
        );
      case "serving":
        return (
          <div className="grid gap-6 lg:grid-cols-[0.4fr_0.6fr]">
            <div className="space-y-3">
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
              {serving?.notes && (
                <div className="rounded-2xl border border-cosmic-gold/10 bg-black/30 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-cosmic-gold/70 mb-2">
                    {t("cocktail.instructions")}
                  </p>
                  <p className="text-cosmic-text">{serving.notes}</p>
                </div>
              )}
            </div>
            <ol className="space-y-4 text-sm text-cosmic-silver">
              {servingSteps.map(step => (
                <li key={step.step_number} className="flex gap-3">
                  <span className="mt-0.5 flex h-7 w-7 items-center justify-center rounded-full border border-cosmic-gold/40 text-[11px] text-cosmic-gold">
                    {step.step_number}
                  </span>
                  <span className="text-cosmic-text">{step.instruction}</span>
                </li>
              ))}
            </ol>
          </div>
        );
      case "ingredients":
        return (
          <div className="space-y-6">
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

            <div className="rounded-2xl border border-cosmic-gold/10 bg-black/30 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-cosmic-gold/70 mb-3">
                {t("cocktail.allergens")}
              </p>
              {allergens.length === 0 ? (
                <p className="text-cosmic-silver text-sm">
                  {t("cocktail.no_allergens")}
                </p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {allergens.map(item => {
                    const presenceTone =
                      item.presence === "contains"
                        ? "border-red-500/40 bg-red-500/10 text-red-200"
                        : "border-amber-400/40 bg-amber-400/10 text-amber-200";
                    return (
                      <span
                        key={`${item.allergens?.name}-${item.presence}`}
                        className={`rounded-full border px-3 py-1 text-[11px] uppercase tracking-[0.18em] ${presenceTone}`}
                      >
                        {item.allergens?.name}
                      </span>
                    );
                  })}
                </div>
              )}
              {warnings.length > 0 && (
                <div className="mt-4 space-y-2 text-xs text-cosmic-fog">
                  {warnings.map(item => (
                    <p key={item.warnings?.title}>
                      <span className="text-cosmic-gold/80">
                        {item.warnings?.title}
                      </span>
                      {item.warnings?.description
                        ? ` — ${item.warnings.description}`
                        : ""}
                    </p>
                  ))}
                </div>
              )}
            </div>
          </div>
        );
      case "shipping":
        return (
          <div className="space-y-6">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-cosmic-gold/70">
                {t("cocktail.shipping_title")}
              </p>
              <ul className="mt-4 space-y-3 text-sm text-cosmic-silver">
                <li>{t("cocktail.shipping_delivery", { range: deliveryRange })}</li>
                <li>
                  {t("cocktail.shipping_costs", {
                    cost: shippingCost.toFixed(2),
                    threshold: freeShippingThreshold,
                  })}
                </li>
                <li>{t("cocktail.shipping_returns")}</li>
              </ul>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-cosmic-gold/70">
                {t("cocktail.faq_title")}
              </p>
              <div className="mt-4 space-y-3">
                {faqItems.map(item => (
                  <details
                    key={item.question}
                    className="rounded-2xl border border-cosmic-gold/10 bg-black/30 px-4 py-3"
                  >
                    <summary className="cursor-pointer text-sm text-cosmic-text">
                      {item.question}
                    </summary>
                    <p className="mt-2 text-sm text-cosmic-silver">
                      {item.answer}
                    </p>
                  </details>
                ))}
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <section className="relative overflow-hidden pb-28 pt-24 px-6">
      <div className="pointer-events-none absolute -top-32 right-0 h-72 w-72 rounded-full bg-cosmic-gold/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 left-0 h-80 w-80 rounded-full bg-sky-400/10 blur-3xl" />
      <div className="max-w-6xl mx-auto space-y-16">
        <div className="flex flex-wrap items-center justify-between gap-4 text-xs text-cosmic-fog">
          <div className="flex flex-wrap items-center gap-2">
            <span className="hover:text-cosmic-silver transition">
              {t("cocktail.breadcrumb_shop")}
            </span>
            <span>/</span>
            <span className="hover:text-cosmic-silver transition">
              {t("cocktail.breadcrumb_cocktails")}
            </span>
            <span>/</span>
            <span className="text-cosmic-silver">{cocktail.name}</span>
          </div>
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 text-cosmic-gold hover:text-white transition"
          >
            <ArrowLeft className="w-4 h-4" />
            {t("cocktail.back_to_shop")}
          </Link>
        </div>

        <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-12 items-start">
          <div className="space-y-6">
            <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[28px] border border-white/10 bg-white/5 shadow-[0_12px_30px_rgba(0,0,0,0.45)]">
              <Image
                src={heroImage}
                alt={cocktail.name}
                fill
                className="object-cover"
                priority
              />
            </div>
            {gallery.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {gallery.slice(0, 4).map(item => (
                  <button
                    key={item.url}
                    type="button"
                    onClick={() => setActiveMedia(item.url)}
                    className={`relative h-14 w-14 overflow-hidden rounded-[14px] border transition ${
                      activeMedia === item.url
                        ? "border-cosmic-gold/60 shadow-[0_0_0_1px_rgba(242,178,76,0.25),0_0_18px_rgba(242,178,76,0.12)]"
                        : "border-white/10"
                    }`}
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

          <div
            ref={buyBoxRef}
            className="sticky top-24 rounded-[28px] border border-white/10 bg-white/5 p-6 shadow-[0_12px_30px_rgba(0,0,0,0.45)] space-y-6"
          >
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-4xl md:text-[36px] font-[--font-unica] text-cosmic-gold">
                  {cocktail.name}
                </h1>
                <span className="inline-flex items-center rounded-full border border-cosmic-gold/35 bg-cosmic-gold/10 px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-cosmic-gold">
                  ABV {cocktail.alcohol_percentage}%
                </span>
              </div>
              {cocktail.has_non_alcoholic_version && (
                <span className="inline-flex items-center rounded-full border border-sky-400/40 bg-sky-500/10 px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-sky-200">
                  {t("cocktail.non_alcoholic_available")}
                </span>
              )}
              {visibleTags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {visibleTags.map(tag => {
                    const tone = tagTones[tag.category] ?? tagTones.style;
                    return (
                      <span
                        key={tag.id}
                        className={`rounded-full border px-3 py-1 text-[10px] uppercase tracking-[0.18em] ${tone}`}
                      >
                        {tag.name}
                      </span>
                    );
                  })}
                  {extraTagsCount > 0 && (
                    <span className="rounded-full border border-white/10 px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-cosmic-silver">
                      +{extraTagsCount}
                    </span>
                  )}
                </div>
              )}
            </div>

            <p className="text-cosmic-silver text-sm leading-relaxed">
              {profile?.summary || cocktail.description}
            </p>

            <div className="space-y-3">
              <p className="text-[11px] uppercase tracking-[0.3em] text-cosmic-gold/70">
                {t("cocktail.choose_size")}
              </p>
              <div className="space-y-2">
                {sizes.map(size => {
                  const isSelected = selectedSizeId === size.id;
                  const isDisabled =
                    !size.available ||
                    (typeof size.stock_quantity === "number" &&
                      size.stock_quantity <= 0);
                  return (
                    <button
                      key={size.id}
                      type="button"
                      disabled={isDisabled}
                      onClick={() =>
                        !isDisabled && setSelectedSizeId(size.id)
                      }
                      className={`flex w-full items-center justify-between rounded-[14px] border px-4 py-3 text-left text-sm transition ${
                        isSelected
                          ? "border-cosmic-gold/55 shadow-[0_0_0_1px_rgba(242,178,76,0.25),0_0_18px_rgba(242,178,76,0.12)]"
                          : "border-white/10 hover:border-white/20"
                      } ${isDisabled ? "opacity-50 cursor-not-allowed" : ""}`}
                    >
                      <div>
                        <p className="text-xs uppercase tracking-[0.2em] text-cosmic-silver">
                          {size.size?.name ?? t("cocktail.size_selection")}
                        </p>
                        <p className="text-[11px] text-cosmic-fog">
                          {size.size?.volume_ml
                            ? `${size.size.volume_ml}ml`
                            : ""}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-cosmic-gold">
                          €{size.price.toFixed(2)}
                        </p>
                        {isDisabled && (
                          <p className="text-[10px] uppercase tracking-[0.2em] text-red-300">
                            {t("shop.out_of_stock_short")}
                          </p>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 rounded-[14px] border border-white/10 bg-black/30 px-3 py-2">
                <button
                  type="button"
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  className="h-8 w-8 rounded-full border border-white/10 text-cosmic-silver transition hover:border-cosmic-gold/50 hover:text-white"
                >
                  -
                </button>
                <span className="min-w-6 text-center text-cosmic-gold">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity(q => q + 1)}
                  className="h-8 w-8 rounded-full border border-white/10 text-cosmic-silver transition hover:border-cosmic-gold/50 hover:text-white"
                >
                  +
                </button>
              </div>
              <button
                type="button"
                onClick={handleAddToCart}
                className="flex-1 rounded-[14px] bg-cosmic-gold px-4 py-3 text-center text-sm font-semibold text-cosmic-bg shadow-[0_0_0_1px_rgba(242,178,76,0.25),0_0_18px_rgba(242,178,76,0.12)] transition hover:translate-y-[-1px]"
              >
                {t("cocktail.add_to_cart")}
              </button>
            </div>

            <div className="grid gap-3 text-[11px] text-cosmic-fog sm:grid-cols-3">
              <div className="flex items-center gap-2">
                <Truck className="h-4 w-4 text-cosmic-gold/80" />
                <span>
                  {t("cocktail.trust_delivery", { range: deliveryRange })}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-cosmic-gold/80" />
                <span>
                  {t("cocktail.trust_shipping", {
                    cost: shippingCost.toFixed(2),
                    threshold: freeShippingThreshold,
                  })}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <RotateCcw className="h-4 w-4 text-cosmic-gold/80" />
                <span>{t("cocktail.trust_returns")}</span>
              </div>
            </div>

            {flavor && (
              <div className="rounded-[18px] border border-white/10 bg-white/5 p-4 space-y-3">
                <p className="text-[11px] uppercase tracking-[0.3em] text-cosmic-gold/70">
                  {t("cocktail.flavor_profile")}
                </p>
                {Object.entries(flavor).map(([key, value]) => (
                  <div key={key} className="space-y-1">
                    <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.2em] text-cosmic-silver">
                      <span>{t(`cocktail.flavor_${key}`)}</span>
                      <span className="text-cosmic-gold/80">{value}%</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-white/10">
                      <div
                        className="h-1.5 rounded-full bg-cosmic-gold"
                        style={{ width: `${value}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          <div className="rounded-[24px] border border-white/10 bg-white/5 p-5 min-h-[180px] space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm uppercase tracking-[0.2em] text-cosmic-gold">
                {t("cocktail.quick_serve_title")}
              </h3>
            </div>
            <ul className="space-y-2 text-sm text-cosmic-silver">
              {(quickServeSteps.length > 0
                ? quickServeSteps.map(step => step.instruction)
                : fallbackServeSteps
              ).map(step => (
                <li key={step}>• {step}</li>
              ))}
            </ul>
            <div className="flex flex-wrap gap-2 text-[11px] text-cosmic-fog">
              {serving?.glassware && (
                <span className="rounded-full border border-white/10 px-2 py-1">
                  {t("cocktail.glassware")}: {serving.glassware}
                </span>
              )}
              {serving?.ice && (
                <span className="rounded-full border border-white/10 px-2 py-1">
                  {t("cocktail.ice")}: {serving.ice}
                </span>
              )}
            </div>
          </div>

          <div className="rounded-[24px] border border-white/10 bg-white/5 p-5 min-h-[180px] space-y-4">
            <h3 className="text-sm uppercase tracking-[0.2em] text-cosmic-gold">
              {t("cocktail.ingredients")}
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm text-cosmic-silver">
              <div className="space-y-2">
                <p className="text-[10px] uppercase tracking-[0.2em] text-cosmic-gold/70">
                  {t("cocktail.core_ingredients")}
                </p>
                {baseIngredients.slice(0, 6).map(item => (
                  <p key={`${item.ingredients?.name}-core`}>
                    {item.ingredients?.name}
                  </p>
                ))}
              </div>
              <div className="space-y-2">
                <p className="text-[10px] uppercase tracking-[0.2em] text-cosmic-gold/70">
                  {t("cocktail.garnish")}
                </p>
                {garnishIngredients.slice(0, 2).map(item => (
                  <p key={`${item.ingredients?.name}-garnish`}>
                    {item.ingredients?.name}
                  </p>
                ))}
              </div>
            </div>
            <button
              type="button"
              onClick={() => handleJumpToDetails("ingredients")}
              className="text-[11px] uppercase tracking-[0.2em] text-cosmic-gold/80 hover:text-cosmic-gold"
            >
              {t("cocktail.view_full_list")}
            </button>
          </div>

          <div className="rounded-[24px] border border-white/10 bg-white/5 p-5 min-h-[180px] space-y-4">
            <h3 className="text-sm uppercase tracking-[0.2em] text-cosmic-gold">
              {t("cocktail.allergens")}
            </h3>
            {allergens.length === 0 ? (
              <p className="text-sm text-cosmic-silver">
                {t("cocktail.no_allergens")}
              </p>
            ) : (
              <div className="flex flex-wrap gap-2 text-xs">
                {allergens.map(item => (
                  <span
                    key={`${item.allergens?.name}-${item.presence}`}
                    className="rounded-full border border-red-500/40 bg-red-500/10 px-3 py-1 text-red-200"
                  >
                    {item.allergens?.name}
                  </span>
                ))}
              </div>
            )}
            <button
              type="button"
              onClick={() => handleJumpToDetails("ingredients")}
              className="text-[11px] uppercase tracking-[0.2em] text-cosmic-gold/80 hover:text-cosmic-gold"
            >
              {t("cocktail.legal_details")}
            </button>
          </div>
        </div>

        <div
          ref={detailsRef}
          className="rounded-[24px] border border-white/10 bg-white/5"
        >
          <div className="hidden lg:flex items-center gap-6 border-b border-white/10 px-6">
            {detailTabs.map(tab => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`relative py-4 text-sm uppercase tracking-[0.2em] transition ${
                  activeTab === tab.key
                    ? "text-cosmic-gold"
                    : "text-cosmic-fog hover:text-cosmic-silver"
                }`}
              >
                {tab.label}
                {activeTab === tab.key && (
                  <span className="absolute bottom-0 left-0 h-0.5 w-full bg-cosmic-gold" />
                )}
              </button>
            ))}
          </div>
          <div className="hidden lg:block px-6 py-6">
            {renderTabContent(activeTab)}
          </div>

          <div className="lg:hidden divide-y divide-white/10">
            {detailTabs.map(tab => (
              <div key={tab.key}>
                <button
                  type="button"
                  onClick={() => handleAccordionToggle(tab.key)}
                  className="flex w-full items-center justify-between px-5 py-4 text-left text-sm uppercase tracking-[0.2em] text-cosmic-gold"
                >
                  {tab.label}
                  <ChevronRight
                    className={`h-4 w-4 transition ${
                      openAccordion === tab.key ? "rotate-90" : ""
                    }`}
                  />
                </button>
                {openAccordion === tab.key && (
                  <div className="px-5 pb-5">{renderTabContent(tab.key)}</div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[24px] border border-white/10 bg-white/5 p-6">
          <h3 className="text-lg font-[--font-unica] text-cosmic-gold mb-3">
            {t("cocktail.reviews_title")}
          </h3>
          <p className="text-sm text-cosmic-silver">
            {t("cocktail.reviews_empty")}
          </p>
        </div>

        {relatedCocktails.length > 0 && (
          <div className="rounded-[24px] border border-white/10 bg-white/5 p-6">
            <h3 className="text-lg font-[--font-unica] text-cosmic-gold mb-4">
              {t("cocktail.related_cocktails")}
            </h3>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {relatedCocktails.map(item => (
                <Link
                  key={item.cocktail_id}
                  href={`/shop/${item.cocktails?.id}`}
                  className="flex items-center gap-3 rounded-[18px] border border-white/10 bg-black/30 p-3 transition hover:border-cosmic-gold/40"
                >
                  <div className="relative h-12 w-12 overflow-hidden rounded-[14px] border border-white/10">
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
      </div>

      <div
        className={`lg:hidden fixed bottom-4 left-4 right-4 z-40 rounded-[18px] border border-white/10 bg-white/10 p-3 shadow-[0_12px_30px_rgba(0,0,0,0.45)] transition ${
          showStickyBar ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6 pointer-events-none"
        }`}
      >
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-cosmic-gold/70">
              {selectedSize?.size?.name ?? t("cocktail.choose_size")}
            </p>
            <p className="text-sm text-cosmic-silver">
              {selectedPrice ? `€${selectedPrice.toFixed(2)}` : "—"}
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              if (!selectedSize) {
                buyBoxRef.current?.scrollIntoView({
                  behavior: "smooth",
                  block: "start",
                });
                return;
              }
              handleAddToCart();
            }}
            className="rounded-[14px] bg-cosmic-gold px-4 py-3 text-sm font-semibold text-cosmic-bg"
          >
            {selectedSize ? t("cocktail.add_to_cart") : t("cocktail.choose_size")}
          </button>
        </div>
      </div>
    </section>
  );
}
