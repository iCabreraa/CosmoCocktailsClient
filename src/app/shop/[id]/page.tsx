"use client";

import Image from "next/image";
import Link from "next/link";
import { createPublicClient } from "@/lib/supabase/public-client";
import { envClient } from "@/lib/env-client";
import { useLanguage } from "@/contexts/LanguageContext";
import { useCart } from "@/store/cart";
import { useToast } from "@/components/feedback/ToastProvider";
import {
  AlertTriangle,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Droplet,
  Flame,
  Maximize2,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Star,
  Sun,
  Timer,
  Truck,
  Wine,
  Snowflake,
  X,
} from "lucide-react";
import type { KeyboardEvent as ReactKeyboardEvent } from "react";
import { useEffect, useLayoutEffect, useRef, useState } from "react";

interface CocktailSizeRow {
  id: string;
  price: number;
  available: boolean;
  stock_quantity: number | null;
  sizes_id: string;
}

type SizeCatalogRow = {
  id: string;
  name: string | null;
  volume_ml: number | null;
};

type SizeOption = {
  id: string;
  name: string | null;
  volume_ml: number | null;
  price: number | null;
  status: "available" | "out" | "coming";
  stock_quantity: number | null;
};

type CocktailRow = {
  id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  alcohol_percentage: number;
  has_non_alcoholic_version: boolean | null;
};

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
    id: string;
    name: string;
    icon: string | null;
    description: string | null;
  } | null;
};

type AllergenCatalogRow = {
  id: string;
  name: string;
  icon: string | null;
  description: string | null;
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

type DetailTab =
  | "overview"
  | "story"
  | "serving"
  | "shipping"
  | "reviews";

const DETAIL_TABS: DetailTab[] = [
  "overview",
  "story",
  "serving",
  "shipping",
  "reviews",
];

const withTimeout = async <T,>(
  promise: PromiseLike<T>,
  label: string,
  ms = 10000
): Promise<T> => {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  const timeout = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new Error(`[PDP] ${label} timed out after ${ms}ms`));
    }, ms);
  });

  try {
    const safePromise = Promise.resolve(promise);
    return await Promise.race([safePromise, timeout]);
  } finally {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
  }
};

export default function CocktailDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const { t } = useLanguage();
  const supabase = createPublicClient();
  const addToCart = useCart(state => state.addToCart);
  const { notify } = useToast();

  const [cocktail, setCocktail] = useState<CocktailRow | null>(null);
  const [sizeOptions, setSizeOptions] = useState<SizeOption[]>([]);
  const [profile, setProfile] = useState<CocktailProfile | null>(null);
  const [flavorProfile, setFlavorProfile] = useState<FlavorProfile | null>(null);
  const [serving, setServing] = useState<CocktailServing | null>(null);
  const [servingSteps, setServingSteps] = useState<CocktailServingStep[]>([]);
  const [ingredients, setIngredients] = useState<CocktailIngredientRow[]>([]);
  const [allergens, setAllergens] = useState<CocktailAllergenRow[]>([]);
  const [allAllergens, setAllAllergens] = useState<AllergenCatalogRow[]>([]);
  const [warnings, setWarnings] = useState<CocktailWarningRow[]>([]);
  const [tags, setTags] = useState<CocktailTagRow[]>([]);
  const [media, setMedia] = useState<CocktailMediaRow[]>([]);
  const [activeMedia, setActiveMedia] = useState<string | null>(null);
  const [relatedCocktails, setRelatedCocktails] = useState<RelatedCocktailRow[]>([]);
  const [selectedSizeId, setSelectedSizeId] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<DetailTab>("overview");
  const [openAccordion, setOpenAccordion] = useState<DetailTab>("overview");
  const [showStickyBar, setShowStickyBar] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fetchNonce, setFetchNonce] = useState(0);
  const [detailsHeight, setDetailsHeight] = useState<number | null>(null);
  const [tagPopoverOpen, setTagPopoverOpen] = useState(false);
  const [hoverAllergenId, setHoverAllergenId] = useState<string | null>(null);
  const [pinnedAllergenId, setPinnedAllergenId] = useState<string | null>(null);
  const [openFaqIndex, setOpenFaqIndex] = useState(0);
  const [showLightbox, setShowLightbox] = useState(false);
  const [activeRelatedIndex, setActiveRelatedIndex] = useState(0);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewTitle, setReviewTitle] = useState("");
  const [reviewText, setReviewText] = useState("");
  const [flavorAnimated, setFlavorAnimated] = useState(false);

  const buyBoxRef = useRef<HTMLDivElement | null>(null);
  const detailsRef = useRef<HTMLDivElement | null>(null);
  const tagPopoverRef = useRef<HTMLDivElement | null>(null);
  const tabMeasureRefs = useRef<Record<DetailTab, HTMLDivElement | null>>({
    overview: null,
    story: null,
    serving: null,
    shipping: null,
    reviews: null,
  });

  const activeAllergenId = pinnedAllergenId ?? hoverAllergenId;

  useEffect(() => {
    let isMounted = true;

    async function fetchCocktail() {
      setLoading(true);
      setError(null);
      try {
        const { data: cocktailDataRaw, error: cocktailError } =
          (await withTimeout(
            supabase
              .from("cocktails")
              .select(
                "id, name, description, image_url, alcohol_percentage, has_non_alcoholic_version"
              )
              .eq("id", params.id)
              .single(),
            "cocktails"
          )) as {
            data: CocktailRow | null;
            error: unknown;
          };
        let cocktailData = cocktailDataRaw as CocktailRow | null;

        if (!cocktailData) {
          try {
            const restUrl = new URL(
              "/rest/v1/cocktails",
              envClient.NEXT_PUBLIC_SUPABASE_URL
            );
            restUrl.searchParams.set("id", `eq.${params.id}`);
            restUrl.searchParams.set(
              "select",
              "id,name,description,image_url,alcohol_percentage,has_non_alcoholic_version"
            );

            const restResponse = await fetch(restUrl.toString(), {
              headers: {
                apikey: envClient.NEXT_PUBLIC_SUPABASE_ANON_KEY,
                Authorization: `Bearer ${envClient.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
              },
            });

            if (restResponse.ok) {
              const restData = (await restResponse.json()) as CocktailRow[];
              cocktailData = restData?.[0] ?? null;
            } else {
              // eslint-disable-next-line no-console
              console.error(
                "[PDP] REST cocktail fallback failed:",
                restResponse.status,
                restResponse.statusText
              );
            }
          } catch (fallbackError) {
            // eslint-disable-next-line no-console
            console.error("[PDP] REST cocktail fallback error:", fallbackError);
          }
        }

        if (!cocktailData) {
          if (cocktailError) {
            // eslint-disable-next-line no-console
            console.error("[PDP] cocktails query error:", cocktailError);
          }
          if (isMounted) {
            setError("Cocktail not found");
          }
          return;
        }

        if (cocktailError) {
          // eslint-disable-next-line no-console
          console.warn("[PDP] cocktails query error (ignored):", cocktailError);
        }

        const queryLabels = [
          "cocktail_sizes",
          "sizes",
          "cocktail_profiles",
          "cocktail_flavor_profiles",
          "cocktail_serving",
          "cocktail_serving_steps",
          "cocktail_ingredients",
          "cocktail_allergens",
          "allergens",
          "cocktail_warnings",
          "cocktail_tags",
          "cocktail_media",
        ];

        const queryPromises = [
          withTimeout(
            supabase
              .from("cocktail_sizes")
              .select("id, price, available, sizes_id, stock_quantity")
              .eq("cocktail_id", params.id),
            "cocktail_sizes"
          ),
          withTimeout(
            supabase
              .from("sizes")
              .select("id, name, volume_ml")
              .order("volume_ml", { ascending: true }),
            "sizes"
          ),
          withTimeout(
            supabase
              .from("cocktail_profiles")
              .select("summary, why_love, story")
              .eq("cocktail_id", params.id)
              .maybeSingle(),
            "cocktail_profiles"
          ),
          withTimeout(
            supabase
              .from("cocktail_flavor_profiles")
              .select("sweet, bitter, sour, tropical")
              .eq("cocktail_id", params.id)
              .maybeSingle(),
            "cocktail_flavor_profiles"
          ),
          withTimeout(
            supabase
              .from("cocktail_serving")
              .select("glassware, ice, garnish, notes")
              .eq("cocktail_id", params.id)
              .maybeSingle(),
            "cocktail_serving"
          ),
          withTimeout(
            supabase
              .from("cocktail_serving_steps")
              .select("step_number, instruction")
              .eq("cocktail_id", params.id)
              .order("step_number", { ascending: true }),
            "cocktail_serving_steps"
          ),
          withTimeout(
            supabase
              .from("cocktail_ingredients")
              .select(
                "amount, is_garnish, display_order, ingredients(name, description)"
              )
              .eq("cocktail_id", params.id)
              .order("display_order", { ascending: true }),
            "cocktail_ingredients"
          ),
          withTimeout(
            supabase
              .from("cocktail_allergens")
              .select("presence, allergens(id, name, icon, description)")
              .eq("cocktail_id", params.id),
            "cocktail_allergens"
          ),
          withTimeout(
            supabase
              .from("allergens")
              .select("id, name, icon, description")
              .order("name", { ascending: true }),
            "allergens"
          ),
          withTimeout(
            supabase
              .from("cocktail_warnings")
              .select("warnings(title, description)")
              .eq("cocktail_id", params.id),
            "cocktail_warnings"
          ),
          withTimeout(
            supabase
              .from("cocktail_tags")
              .select("tags(id, name, category)")
              .eq("cocktail_id", params.id),
            "cocktail_tags"
          ),
          withTimeout(
            supabase
              .from("cocktail_media")
              .select("url, alt_text, is_primary, sort_order")
              .eq("cocktail_id", params.id)
              .order("is_primary", { ascending: false })
              .order("sort_order", { ascending: true }),
            "cocktail_media"
          ),
        ];

        const settled = await Promise.allSettled(queryPromises);
        const [
          sizesResponse,
          sizeCatalogResponse,
          profileResponse,
          flavorResponse,
          servingResponse,
          servingStepsResponse,
          ingredientsResponse,
          allergensResponse,
          allAllergensResponse,
          warningsResponse,
          tagsResponse,
          mediaResponse,
        ] = settled.map((result, index) => {
          if (result.status === "fulfilled") {
            return result.value;
          }
          // eslint-disable-next-line no-console
          console.error(
            `[PDP] ${queryLabels[index]} failed:`,
            result.reason
          );
          return { data: null, error: result.reason };
        });

        const responsesWithLabels = [
          sizesResponse,
          sizeCatalogResponse,
          profileResponse,
          flavorResponse,
          servingResponse,
          servingStepsResponse,
          ingredientsResponse,
          allergensResponse,
          allAllergensResponse,
          warningsResponse,
          tagsResponse,
          mediaResponse,
        ];

        responsesWithLabels.forEach((response, index) => {
          if (response?.error) {
            // eslint-disable-next-line no-console
            console.error(
              `[PDP] ${queryLabels[index]} error:`,
              response.error
            );
          }
        });

        const sizeCatalog = (sizeCatalogResponse.data ?? []) as SizeCatalogRow[];
        const cocktailSizes = (sizesResponse.data ?? []) as CocktailSizeRow[];

        const sizeOptionsData = sizeCatalog.length
          ? sizeCatalog.map(size => {
              const match = cocktailSizes.find(row => row.sizes_id === size.id);
              const stockQty =
                typeof match?.stock_quantity === "number"
                  ? match.stock_quantity
                  : null;
              const isAvailable =
                !!match && match.available && (stockQty === null || stockQty > 0);
              const status = match ? (isAvailable ? "available" : "out") : "coming";
              return {
                id: size.id,
                name: size.name,
                volume_ml: size.volume_ml,
                price: match?.price ?? null,
                status,
                stock_quantity: stockQty,
              } satisfies SizeOption;
            })
          : cocktailSizes.map(row => {
              const stockQty =
                typeof row.stock_quantity === "number" ? row.stock_quantity : null;
              const isAvailable =
                row.available && (stockQty === null || stockQty > 0);
              return {
                id: row.sizes_id,
                name: null,
                volume_ml: null,
                price: row.price ?? null,
                status: isAvailable ? "available" : "out",
                stock_quantity: stockQty,
              } satisfies SizeOption;
            });

        const mediaData = (mediaResponse.data ?? []) as CocktailMediaRow[];
        const primaryMedia =
          mediaData.find(item => item.is_primary) ?? mediaData[0] ?? null;
        const tagsData = (tagsResponse.data ?? []) as CocktailTagRow[];

        let relatedData: RelatedCocktailRow[] = [];
        const tagIds =
          tagsData.map(item => item.tags?.id).filter(Boolean) ?? [];
        if (tagIds.length > 0) {
          const relatedResponse = await supabase
            .from("cocktail_tags")
            .select("cocktail_id, cocktails(id, name, image_url)")
            .in("tag_id", tagIds)
            .neq("cocktail_id", params.id);
          relatedData = (relatedResponse.data ?? []) as RelatedCocktailRow[];
        }

        if (!isMounted) {
          return;
        }

        setCocktail(cocktailData);
        setSizeOptions(sizeOptionsData);
        setProfile((profileResponse.data ?? null) as CocktailProfile | null);
        setFlavorProfile((flavorResponse.data ?? null) as FlavorProfile | null);
        setServing((servingResponse.data ?? null) as CocktailServing | null);
        setServingSteps(
          (servingStepsResponse.data ?? []) as CocktailServingStep[]
        );
        setIngredients(
          (ingredientsResponse.data ?? []) as CocktailIngredientRow[]
        );
        setAllergens((allergensResponse.data ?? []) as CocktailAllergenRow[]);
        setAllAllergens(
          (allAllergensResponse.data ?? []) as AllergenCatalogRow[]
        );
        setWarnings((warningsResponse.data ?? []) as CocktailWarningRow[]);
        setTags(tagsData);
        setMedia(mediaData);
        setActiveMedia(primaryMedia?.url ?? cocktailData.image_url ?? null);

        const uniqueRelated = new Map<string, RelatedCocktailRow>();
        relatedData.forEach(item => {
          if (item.cocktails?.id && !uniqueRelated.has(item.cocktails.id)) {
            uniqueRelated.set(item.cocktails.id, item);
          }
        });
        setRelatedCocktails(Array.from(uniqueRelated.values()));
      } catch (err) {
        if (isMounted) {
          setError("Error loading cocktail");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchCocktail();
    return () => {
      isMounted = false;
    };
  }, [params.id, supabase, fetchNonce]);

  useEffect(() => {
    const selected = sizeOptions.find(option => option.id === selectedSizeId);
    if (!selected || selected.status !== "available") {
      const firstAvailable = sizeOptions.find(option => option.status === "available");
      setSelectedSizeId(firstAvailable?.id ?? null);
    }
  }, [sizeOptions, selectedSizeId]);

  useEffect(() => {
    function handleScroll() {
      setShowStickyBar(window.scrollY > 320);
    }
    window.addEventListener("scroll", handleScroll);
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setTagPopoverOpen(false);
        setPinnedAllergenId(null);
        setShowLightbox(false);
      }
    }

    function handlePointer(event: MouseEvent) {
      if (
        tagPopoverRef.current &&
        !tagPopoverRef.current.contains(event.target as Node)
      ) {
        setTagPopoverOpen(false);
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("mousedown", handlePointer);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handlePointer);
    };
  }, []);

  useEffect(() => {
    if (relatedCocktails.length === 0) {
      return;
    }
    if (activeRelatedIndex >= relatedCocktails.length) {
      setActiveRelatedIndex(0);
    }
  }, [relatedCocktails.length, activeRelatedIndex]);

  useEffect(() => {
    if (relatedCocktails.length < 2) {
      return;
    }
    const interval = window.setInterval(() => {
      setActiveRelatedIndex(prev =>
        (prev + 1) % relatedCocktails.length
      );
    }, 5200);
    return () => window.clearInterval(interval);
  }, [relatedCocktails.length]);

  useEffect(() => {
    if (activeTab !== "overview") {
      setFlavorAnimated(false);
      return;
    }

    const timer = window.setTimeout(() => setFlavorAnimated(true), 120);
    return () => window.clearTimeout(timer);
  }, [activeTab, flavorProfile]);

  useLayoutEffect(() => {
    if (!cocktail) {
      return;
    }

    const heights = DETAIL_TABS.map(tab => {
      const node = tabMeasureRefs.current[tab];
      return node ? node.scrollHeight : 0;
    });

    const maxHeight = Math.max(...heights, 0);
    if (maxHeight && maxHeight !== detailsHeight) {
      setDetailsHeight(maxHeight);
    }
  }, [
    cocktail,
    profile,
    flavorProfile,
    serving,
    servingSteps,
    ingredients,
    allergens,
    allAllergens,
    warnings,
    tags,
    sizeOptions,
    detailsHeight,
  ]);

  useEffect(() => {
    function handleResize() {
      const heights = DETAIL_TABS.map(tab => {
        const node = tabMeasureRefs.current[tab];
        return node ? node.scrollHeight : 0;
      });
      const maxHeight = Math.max(...heights, 0);
      if (maxHeight && maxHeight !== detailsHeight) {
        setDetailsHeight(maxHeight);
      }
    }

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [detailsHeight]);

  const detailTabs = [
    { key: "overview" as const, label: t("cocktail.tab_overview") },
    { key: "story" as const, label: t("cocktail.tab_story") },
    { key: "serving" as const, label: t("cocktail.tab_serving") },
    { key: "shipping" as const, label: t("cocktail.tab_shipping") },
    { key: "reviews" as const, label: t("cocktail.tab_reviews") },
  ];

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cosmic-gold"></div>
      </div>
    );
  }

  if (error || !cocktail) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <p className="text-cosmic-silver">{t("cocktail.not_found")}</p>
        <button
          type="button"
          onClick={() => setFetchNonce(prev => prev + 1)}
          className="rounded-full border border-cosmic-gold/40 px-4 py-2 text-xs uppercase tracking-[0.2em] text-cosmic-gold"
        >
          {t("common.retry")}
        </button>
      </div>
    );
  }

  const heroImage = activeMedia ?? cocktail.image_url ?? "/images/placeholder.webp";
  const gallery = media.filter(item => item.url !== heroImage).slice(0, 4);
  const baseIngredients = ingredients.filter(item => !item.is_garnish);
  const garnishIngredients = ingredients.filter(item => item.is_garnish);
  const featuredTags =
    tags.map(item => item.tags).filter(Boolean) as NonNullable<
      CocktailTagRow["tags"]
    >[];

  const primaryTags = (() => {
    const selected: NonNullable<CocktailTagRow["tags"]>[] = [];
    const base = featuredTags.find(tag => tag.category === "base");
    const style = featuredTags.find(tag => tag.category === "style");
    if (base) selected.push(base);
    if (style && style.id !== base?.id) selected.push(style);
    featuredTags.forEach(tag => {
      if (selected.length >= 2) return;
      if (!selected.find(item => item.id === tag.id)) {
        selected.push(tag);
      }
    });
    return selected.slice(0, 2);
  })();

  const extraTags = featuredTags.filter(
    tag => !primaryTags.find(item => item.id === tag.id)
  );
  const extraTagsCount = extraTags.length;
  const allergenPresenceById = new Map<
    string,
    CocktailAllergenRow["presence"]
  >();
  allergens.forEach(item => {
    if (item.allergens?.id) {
      allergenPresenceById.set(item.allergens.id, item.presence);
    }
  });
  const allergenCatalog = allAllergens.length
    ? allAllergens
    : allergens
        .filter(item => item.allergens)
        .map(item => ({
          id: item.allergens!.id,
          name: item.allergens!.name,
          icon: item.allergens!.icon,
          description: item.allergens!.description,
        }));
  const resolveAllergenIcon = (
    icon: string | null | undefined,
    name: string
  ) => {
    if (icon) {
      if (icon.startsWith("http") || icon.startsWith("/")) return icon;
      const filename = icon.includes(".") ? icon : `${icon}.svg`;
      return `/icons/allergens/${filename}`;
    }

    const normalized = name.toLowerCase();
    if (normalized.includes("egg")) return "/icons/allergens/eggs-allergen.svg";
    if (normalized.includes("milk")) return "/icons/allergens/milk-allergen.svg";
    if (normalized.includes("gluten"))
      return "/icons/allergens/gluten-allergen.svg";
    if (normalized.includes("sesame"))
      return "/icons/allergens/sesame-allergen.svg";
    if (normalized.includes("celery"))
      return "/icons/allergens/celery-allergen.svg";
    if (normalized.includes("soy") || normalized.includes("soya"))
      return "/icons/allergens/soya-allergen.svg";
    if (normalized.includes("sulphite") || normalized.includes("sulfite"))
      return "/icons/allergens/sulfur-dioxide-sulphites-allergen.svg";
    if (normalized.includes("walnut"))
      return "/icons/allergens/walnut-allergen.svg";
    if (normalized.includes("cashew"))
      return "/icons/allergens/cashew-allergen.svg";
    if (normalized.includes("nut"))
      return "/icons/allergens/nuts-allergen.svg";
    if (normalized.includes("orange"))
      return "/icons/allergens/orange-allergen.svg";
    return null;
  };

  const tagTones: Record<string, string> = {
    flavor: "border-emerald-400/40 bg-emerald-500/10 text-emerald-200",
    season: "border-sky-400/40 bg-sky-500/10 text-sky-200",
    base: "border-amber-400/40 bg-amber-500/10 text-amber-200",
    occasion: "border-fuchsia-400/40 bg-fuchsia-500/10 text-fuchsia-200",
    style: "border-cosmic-gold/30 bg-white/5 text-cosmic-gold/80",
  };

  const selectedSize = sizeOptions.find(option => option.id === selectedSizeId) ?? null;
  const canAddToCart = selectedSize?.status === "available";
  const selectedPrice = selectedSize?.price ?? null;
  const selectedVolume = selectedSize?.volume_ml ?? null;
  const displayVolume =
    selectedVolume ??
    sizeOptions.find(option => option.status === "available")?.volume_ml ??
    sizeOptions[0]?.volume_ml ??
    null;
  const totalPrice = selectedPrice ? selectedPrice * quantity : null;

  const tastingLabels = [
    t("cocktail.tasting_nose"),
    t("cocktail.tasting_palate"),
    t("cocktail.tasting_finish"),
  ];

  const tastingFallback = baseIngredients
    .map(item => item.ingredients?.name)
    .filter(Boolean);
  const flavorTags = featuredTags
    .filter(tag => tag.category === "flavor")
    .map(tag => tag.name);
  const tastingNotes = (flavorTags.length > 0 ? flavorTags : tastingFallback).slice(
    0,
    3
  );

  const whyLoveText =
    profile?.why_love || profile?.summary || cocktail.description || "";
  const whyLoveItems = whyLoveText
    .split(/\n|•|- /)
    .map(item => item.trim())
    .filter(Boolean);

  const storyCopy =
    profile?.story || profile?.summary || cocktail.description || "";

  const quickServeSteps = servingSteps.length
    ? servingSteps
    : [
        { step_number: 1, instruction: t("cocktail.quick_serve_step1") },
        { step_number: 2, instruction: t("cocktail.quick_serve_step2") },
        { step_number: 3, instruction: t("cocktail.quick_serve_step3") },
      ];

  const deliveryRange = "2-4";
  const shippingCost = 4.99;
  const freeShippingThreshold = 50;

  const faqItems = [
    { question: t("cocktail.faq_storage_q"), answer: t("cocktail.faq_storage_a") },
    { question: t("cocktail.faq_chilled_q"), answer: t("cocktail.faq_chilled_a") },
    { question: t("cocktail.faq_serves_q"), answer: t("cocktail.faq_serves_a") },
    { question: t("cocktail.faq_gift_q"), answer: t("cocktail.faq_gift_a") },
  ];

  const flavorRows = [
    { key: "sweet", label: t("cocktail.flavor_sweet"), Icon: Sparkles },
    { key: "sour", label: t("cocktail.flavor_sour"), Icon: Droplet },
    { key: "bitter", label: t("cocktail.flavor_bitter"), Icon: Flame },
    { key: "tropical", label: t("cocktail.flavor_tropical"), Icon: Sun },
  ];

  const relatedCount = relatedCocktails.length;
  const relatedSlots: Array<{
    index: number;
    position: "left" | "center" | "right";
  }> = relatedCount
    ? relatedCount === 1
      ? [{ index: 0, position: "center" }]
      : relatedCount === 2
        ? [
            { index: activeRelatedIndex, position: "center" },
            {
              index: (activeRelatedIndex + 1) % relatedCount,
              position: "right",
            },
          ]
        : [
            {
              index: (activeRelatedIndex - 1 + relatedCount) % relatedCount,
              position: "left",
            },
            { index: activeRelatedIndex, position: "center" },
            {
              index: (activeRelatedIndex + 1) % relatedCount,
              position: "right",
            },
          ]
    : [];

  const handleAddToCart = () => {
    if (!selectedSize || selectedSize.status !== "available") {
      buyBoxRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }
    addToCart({
      cocktail_id: cocktail.id,
      sizes_id: selectedSize.id,
      quantity,
      unit_price: selectedSize.price ?? 0,
      cocktail_name: cocktail.name,
      size_name: selectedSize.name ?? `${selectedVolume ?? 0}ml`,
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
    setOpenAccordion(prev => (prev === tab ? prev : tab));
  };

  const handleTabKeyDown = (
    event: ReactKeyboardEvent<HTMLButtonElement>,
    currentIndex: number
  ) => {
    if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") {
      return;
    }

    event.preventDefault();
    const nextIndex =
      event.key === "ArrowRight" ? currentIndex + 1 : currentIndex - 1;
    const normalizedIndex =
      nextIndex < 0
        ? detailTabs.length - 1
        : nextIndex >= detailTabs.length
        ? 0
        : nextIndex;
    const nextTab = detailTabs[normalizedIndex];
    setActiveTab(nextTab.key);
  };

  const renderTabContent = (tab: DetailTab, isMeasure = false) => {
    switch (tab) {
      case "overview":
        return (
          <div className={`space-y-8 ${isMeasure ? "pointer-events-none" : ""}`}>
            <div className="grid gap-6 lg:grid-cols-2">
              <div className="rounded-[18px] border border-white/10 bg-black/30 p-4 space-y-4">
                <p className="text-xs uppercase tracking-[0.3em] text-cosmic-gold/70">
                  {t("cocktail.ingredients")}
                </p>
                <div className="grid gap-4 md:grid-cols-2 text-sm text-cosmic-silver">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.2em] text-cosmic-gold/60 mb-2">
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
                    <p className="text-[10px] uppercase tracking-[0.2em] text-cosmic-gold/60 mb-2">
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
                {warnings.length > 0 && (
                  <div className="space-y-2 text-xs text-cosmic-fog">
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

              <div className="rounded-[18px] border border-white/10 bg-black/30 p-4 space-y-4">
                <p className="text-xs uppercase tracking-[0.3em] text-cosmic-gold/70">
                  {t("cocktail.allergens")}
                </p>
                <div className="grid gap-3 sm:grid-cols-3">
                  {allergenCatalog.map(allergen => {
                    const presence = allergenPresenceById.get(allergen.id);
                    const isPresent = Boolean(presence);
                    const isActive = activeAllergenId === allergen.id;
                    const isPinned = pinnedAllergenId === allergen.id;
                    const iconSrc = resolveAllergenIcon(
                      allergen.icon,
                      allergen.name
                    );
                    return (
                      <div
                        key={allergen.id}
                        className="relative"
                        onMouseEnter={() => setHoverAllergenId(allergen.id)}
                        onMouseLeave={() => setHoverAllergenId(null)}
                      >
                        <button
                          type="button"
                          onClick={() =>
                            setPinnedAllergenId(prev =>
                              prev === allergen.id ? null : allergen.id
                            )
                          }
                          className={`flex w-full flex-col items-center gap-2 rounded-[16px] border px-3 py-3 text-center text-[10px] uppercase tracking-[0.18em] ${
                            isPresent
                              ? "border-red-500/40 bg-red-500/10 text-red-100"
                              : "border-white/10 bg-white/5 text-cosmic-fog/70"
                          }`}
                          aria-expanded={isActive}
                          aria-describedby={`allergen-${allergen.id}`}
                        >
                          <span
                            className={`flex h-10 w-10 items-center justify-center rounded-full border ${
                              isPresent
                                ? "border-red-500/50 bg-red-500/10 text-red-200"
                                : "border-white/10 bg-white/5 text-cosmic-fog/60"
                            }`}
                          >
                            {iconSrc ? (
                              <span
                                className="h-6 w-6 bg-current"
                                style={{
                                  maskImage: `url(${iconSrc})`,
                                  WebkitMaskImage: `url(${iconSrc})`,
                                  maskRepeat: "no-repeat",
                                  WebkitMaskRepeat: "no-repeat",
                                  maskPosition: "center",
                                  WebkitMaskPosition: "center",
                                  maskSize: "contain",
                                  WebkitMaskSize: "contain",
                                }}
                              />
                            ) : (
                              <span className="text-xs">
                                {allergen.name.slice(0, 1)}
                              </span>
                            )}
                          </span>
                          <span className="text-[11px] text-cosmic-text">
                            {allergen.name}
                          </span>
                          {isPresent && (
                            <span className="text-[9px] uppercase tracking-[0.2em] text-red-200">
                              {presence === "contains"
                                ? t("cocktail.contains")
                                : t("cocktail.may_contain")}
                            </span>
                          )}
                        </button>
                        {isActive && (
                          <div
                            id={`allergen-${allergen.id}`}
                            role="tooltip"
                            className="absolute left-1/2 top-full z-10 mt-2 w-52 -translate-x-1/2 rounded-[14px] border border-white/10 bg-black/80 p-3 text-[11px] text-cosmic-silver"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <p>
                                {allergen.description ??
                                  t("cocktail.allergen_details_fallback")}
                              </p>
                              {isPinned && (
                                <button
                                  type="button"
                                  onClick={() => setPinnedAllergenId(null)}
                                  className="text-cosmic-gold/70 hover:text-cosmic-gold"
                                >
                                  <X className="h-3 w-3" />
                                </button>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="rounded-[18px] border border-white/10 bg-black/30 p-4 space-y-4">
                <p className="text-xs uppercase tracking-[0.3em] text-cosmic-gold/70">
                  {t("cocktail.flavor_profile")}
                </p>
                <div className="space-y-3">
                  {flavorRows.map(({ key, label, Icon }) => {
                    const value = flavorProfile
                      ? flavorProfile[key as keyof FlavorProfile]
                      : 0;
                    return (
                      <div key={key} className="space-y-1">
                        <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.2em] text-cosmic-silver">
                          <span className="flex items-center gap-2 text-cosmic-text">
                            <Icon className="h-4 w-4 text-cosmic-gold/80" />
                            {label}
                          </span>
                          <span className="text-cosmic-gold/80">{value}%</span>
                        </div>
                        <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-cosmic-gold/80 via-cosmic-gold/50 to-transparent transition-all duration-500"
                            style={{
                              width: flavorAnimated ? `${value}%` : "0%",
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="rounded-[18px] border border-white/10 bg-black/30 p-4 space-y-4">
                <p className="text-xs uppercase tracking-[0.3em] text-cosmic-gold/70">
                  {t("cocktail.tasting_notes")}
                </p>
                <div className="space-y-2">
                  {tastingLabels.map((label, index) => (
                    <div
                      key={label}
                      className="flex items-center justify-between rounded-[16px] border border-white/10 bg-black/30 px-4 py-3"
                    >
                      <span className="text-[11px] uppercase tracking-[0.2em] text-cosmic-gold/70">
                        {label}
                      </span>
                      <span className="text-sm text-cosmic-text">
                        {tastingNotes[index] ?? t("cocktail.tasting_default")}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );
      case "story":
        return (
          <div className="grid gap-6 lg:grid-cols-[0.45fr_0.55fr]">
            <div className="rounded-[18px] border border-white/10 bg-black/30 p-4 space-y-3">
              <p className="text-xs uppercase tracking-[0.3em] text-cosmic-gold/70">
                {t("cocktail.summary_title")}
              </p>
              <p className="text-sm text-cosmic-silver leading-relaxed">
                {profile?.summary || cocktail.description}
              </p>
            </div>
            <div className="rounded-[18px] border border-white/10 bg-black/30 p-4 space-y-3">
              <p className="text-xs uppercase tracking-[0.3em] text-cosmic-gold/70">
                {t("cocktail.story")}
              </p>
              <p className="text-sm text-cosmic-silver leading-relaxed">
                {storyCopy || t("cocktail.story_fallback")}
              </p>
              <div className="pt-3 border-t border-white/10 text-xs text-cosmic-fog">
                <span className="text-cosmic-gold/70">
                  {t("cocktail.story_origin")}
                </span>{" "}
                · {t("cocktail.story_origin_fallback", { name: cocktail.name })}
              </div>
            </div>
          </div>
        );
      case "serving":
        return (
          <div className="grid gap-8 lg:grid-cols-[0.45fr_0.55fr]">
            <div className="space-y-3">
              <div className="rounded-[18px] border border-white/10 bg-black/30 p-4">
                <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-cosmic-gold/70">
                  <Wine className="h-4 w-4 text-cosmic-gold/80" />
                  {t("cocktail.glassware")}
                </div>
                <p className="mt-2 text-cosmic-text">{serving?.glassware ?? t("cocktail.spec_unknown")}</p>
              </div>
              <div className="rounded-[18px] border border-white/10 bg-black/30 p-4">
                <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-cosmic-gold/70">
                  <Snowflake className="h-4 w-4 text-cosmic-gold/80" />
                  {t("cocktail.ice")}
                </div>
                <p className="mt-2 text-cosmic-text">{serving?.ice ?? t("cocktail.spec_unknown")}</p>
              </div>
              <div className="rounded-[18px] border border-white/10 bg-black/30 p-4">
                <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-cosmic-gold/70">
                  <Sparkles className="h-4 w-4 text-cosmic-gold/80" />
                  {t("cocktail.garnish")}
                </div>
                <p className="mt-2 text-cosmic-text">{serving?.garnish ?? t("cocktail.spec_unknown")}</p>
              </div>
              <div className="rounded-[18px] border border-white/10 bg-black/30 p-4">
                <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-cosmic-gold/70">
                  <Timer className="h-4 w-4 text-cosmic-gold/80" />
                  {t("cocktail.ready_in")}
                </div>
                <p className="mt-2 text-cosmic-text">{t("cocktail.ready_time")}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-xs uppercase tracking-[0.3em] text-cosmic-gold/70">
                  {t("cocktail.serving_guide")}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    const text = quickServeSteps
                      .map(step => `${step.step_number}. ${step.instruction}`)
                      .join("\n");
                    navigator.clipboard.writeText(text).catch(() => undefined);
                  }}
                  className="text-[10px] uppercase tracking-[0.2em] text-cosmic-gold/70 hover:text-cosmic-gold"
                >
                  {t("cocktail.copy_steps")}
                </button>
              </div>
              <div className="space-y-4">
                {quickServeSteps.map(step => (
                  <div key={step.step_number} className="flex gap-4">
                    <div className="relative">
                      <span className="flex h-8 w-8 items-center justify-center rounded-full border border-cosmic-gold/40 text-xs text-cosmic-gold">
                        {step.step_number}
                      </span>
                      <span className="absolute left-1/2 top-9 h-8 w-px -translate-x-1/2 bg-cosmic-gold/30" />
                    </div>
                    <div className="rounded-[16px] border border-white/10 bg-black/30 px-4 py-3 text-sm text-cosmic-silver">
                      <p className="text-cosmic-text">{step.instruction}</p>
                      {serving?.notes && step.step_number === 1 && (
                        <p className="mt-2 text-xs text-cosmic-gold/80">
                          {t("cocktail.pro_tip")}: {serving.notes}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      case "shipping":
        return (
          <div className="grid gap-6 lg:grid-cols-[0.45fr_0.55fr]">
            <div className="space-y-4">
              <p className="text-xs uppercase tracking-[0.3em] text-cosmic-gold/70">
                {t("cocktail.shipping_title")}
              </p>
              <div className="space-y-3">
                <div className="rounded-[18px] border border-white/10 bg-black/30 p-4">
                  <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-cosmic-gold/70">
                    <Truck className="h-4 w-4 text-cosmic-gold/80" />
                    {t("cocktail.shipping_delivery", { range: deliveryRange })}
                  </div>
                  <p className="mt-2 text-sm text-cosmic-silver">
                    {t("cocktail.shipping_delivery_detail")}
                  </p>
                </div>
                <div className="rounded-[18px] border border-white/10 bg-black/30 p-4">
                  <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-cosmic-gold/70">
                    <ShieldCheck className="h-4 w-4 text-cosmic-gold/80" />
                    {t("cocktail.shipping_costs", {
                      cost: shippingCost.toFixed(2),
                      threshold: freeShippingThreshold,
                    })}
                  </div>
                  <p className="mt-2 text-sm text-cosmic-silver">
                    {t("cocktail.shipping_costs_detail")}
                  </p>
                </div>
                <div className="rounded-[18px] border border-white/10 bg-black/30 p-4">
                  <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-cosmic-gold/70">
                    <RotateCcw className="h-4 w-4 text-cosmic-gold/80" />
                    {t("cocktail.shipping_returns")}
                  </div>
                  <p className="mt-2 text-sm text-cosmic-silver">
                    {t("cocktail.shipping_returns_detail")}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <p className="text-xs uppercase tracking-[0.3em] text-cosmic-gold/70">
                {t("cocktail.faq_title")}
              </p>
              <div className="space-y-3">
                {faqItems.map((item, index) => {
                  const isOpen = openFaqIndex === index;
                  return (
                    <div
                      key={item.question}
                      className="rounded-[16px] border border-white/10 bg-black/30"
                    >
                      <button
                        type="button"
                        onClick={() => setOpenFaqIndex(index)}
                        className="flex w-full items-center justify-between px-4 py-3 text-left text-sm text-cosmic-gold/70"
                        aria-expanded={isOpen}
                      >
                        <span className="font-medium tracking-[0.02em] text-cosmic-gold/70">
                          {item.question}
                        </span>
                        <ChevronDown
                          className={`h-4 w-4 transition ${
                            isOpen ? "rotate-180" : ""
                          }`}
                        />
                      </button>
                      {isOpen && (
                        <p className="px-4 pb-4 text-sm text-cosmic-silver">
                          {item.answer}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        );
      case "reviews":
        return (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3 text-sm text-cosmic-silver">
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <Star
                      key={`summary-star-${index}`}
                      className="h-4 w-4 text-cosmic-gold/30"
                    />
                  ))}
                </div>
                <span>{t("cocktail.reviews_empty")}</span>
              </div>
              <span className="text-xs text-cosmic-fog">
                {t("cocktail.reviews_verified")}
              </span>
            </div>

            <div className="grid gap-6 lg:grid-cols-[0.45fr_0.55fr]">
              <div className="rounded-[18px] border border-white/10 bg-black/30 p-4 space-y-4">
                <p className="text-xs uppercase tracking-[0.2em] text-cosmic-gold/70">
                  {t("cocktail.reviews_rate")}
                </p>
                <div className="flex items-center gap-2">
                  {Array.from({ length: 5 }).map((_, index) => {
                    const value = index + 1;
                    return (
                      <button
                        key={`rating-${value}`}
                        type="button"
                        onClick={() => setReviewRating(value)}
                        className="text-cosmic-gold"
                      >
                        <Star
                          className="h-5 w-5"
                          fill={reviewRating >= value ? "currentColor" : "none"}
                        />
                      </button>
                    );
                  })}
                </div>
                <div className="grid gap-3">
                  <input
                    value={reviewTitle}
                    onChange={event => setReviewTitle(event.target.value)}
                    placeholder={t("cocktail.reviews_title_placeholder")}
                    className="rounded-[14px] border border-white/10 bg-black/30 px-4 py-2 text-sm text-cosmic-text placeholder:text-cosmic-fog"
                  />
                  <textarea
                    value={reviewText}
                    onChange={event => setReviewText(event.target.value)}
                    placeholder={t("cocktail.reviews_body_placeholder")}
                    rows={4}
                    className="rounded-[14px] border border-white/10 bg-black/30 px-4 py-2 text-sm text-cosmic-text placeholder:text-cosmic-fog"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (!reviewRating) {
                      return;
                    }
                    setReviewRating(0);
                    setReviewTitle("");
                    setReviewText("");
                    notify({
                      type: "success",
                      title: t("cocktail.reviews_thanks_title"),
                      message: t("cocktail.reviews_thanks_message"),
                    });
                  }}
                  disabled={!reviewRating}
                  className="rounded-full bg-cosmic-gold px-4 py-2 text-xs uppercase tracking-[0.2em] text-cosmic-bg disabled:opacity-60"
                >
                  {t("cocktail.reviews_post")}
                </button>
              </div>

              <div className="rounded-[18px] border border-white/10 bg-black/30 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-cosmic-gold/70">
                  {t("cocktail.reviews_title")}
                </p>
                <div className="mt-4 space-y-3 text-sm text-cosmic-silver">
                  <p>{t("cocktail.reviews_empty")}</p>
                </div>
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

      {showLightbox && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-6">
          <button
            type="button"
            onClick={() => setShowLightbox(false)}
            className="absolute right-6 top-6 rounded-full border border-white/20 p-2 text-white"
          >
            <X className="h-4 w-4" />
          </button>
          <div className="relative h-[80vh] w-full max-w-4xl rounded-[24px] border border-white/10 bg-black/40">
            <Image
              src={heroImage}
              alt={cocktail.name}
              fill
              className="object-contain"
            />
          </div>
        </div>
      )}

      <div className="max-w-[1200px] mx-auto space-y-16">
        <nav className="text-xs text-cosmic-fog" aria-label="Breadcrumb">
          <ol className="flex flex-wrap items-center gap-2">
            <li>
              <Link href="/shop" className="hover:text-cosmic-silver transition">
                {t("cocktail.breadcrumb_shop")}
              </Link>
            </li>
            <li className="text-cosmic-fog">/</li>
            <li className="text-cosmic-silver">{cocktail.name}</li>
          </ol>
        </nav>

        <div className="grid gap-10 lg:grid-cols-12 items-start">
          <div className="lg:col-span-7 space-y-4">
            <div className="relative z-30 aspect-[4/5] w-full overflow-hidden rounded-[24px] border border-white/10 bg-white/5 shadow-[0_12px_30px_rgba(0,0,0,0.45)]">
              <Image
                src={heroImage}
                alt={cocktail.name}
                fill
                className="object-cover"
                priority
              />
              <button
                type="button"
                onClick={() => setShowLightbox(true)}
                className="absolute right-4 top-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/40 px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-white/80 transition hover:text-white"
              >
                <Maximize2 className="h-3 w-3" />
                {t("cocktail.view_larger")}
              </button>
            </div>
            {gallery.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {gallery.map(item => (
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

          <div className="lg:col-span-5 relative">
            <div
              ref={buyBoxRef}
              className="lg:sticky lg:top-[92px]"
            >
              <div className="relative z-20 rounded-[24px] border border-white/10 bg-white/5 p-6 shadow-[0_12px_30px_rgba(0,0,0,0.45)] space-y-6 lg:-translate-x-7">
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-3">
                    <h1 className="text-3xl md:text-[36px] font-[--font-unica] text-cosmic-gold tracking-[0.02em]">
                      {cocktail.name}
                    </h1>
                    <span className="inline-flex items-center rounded-full border border-cosmic-gold/35 bg-cosmic-gold/10 px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-cosmic-gold">
                      {cocktail.alcohol_percentage}% ABV
                    </span>
                  </div>
                  {cocktail.has_non_alcoholic_version && (
                    <div className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-sky-200">
                      <Sparkles className="h-3.5 w-3.5 text-sky-200" />
                      {t("cocktail.non_alcoholic_available")}
                    </div>
                  )}

                  {(primaryTags.length > 0 || extraTagsCount > 0) && (
                    <div className="flex flex-wrap items-center gap-2">
                      {primaryTags.map(tag => (
                        <span
                          key={tag.id}
                          className={`rounded-full border px-3 py-1 text-[10px] uppercase tracking-[0.18em] ${
                            tagTones[tag.category] ?? tagTones.style
                          }`}
                        >
                          {tag.name}
                        </span>
                      ))}
                      {extraTagsCount > 0 && (
                        <div className="relative" ref={tagPopoverRef}>
                          <button
                            type="button"
                            onClick={() => setTagPopoverOpen(prev => !prev)}
                            className="rounded-full border border-white/10 px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-cosmic-silver"
                          >
                            +{extraTagsCount} {t("cocktail.tags_more")}
                          </button>
                          {tagPopoverOpen && (
                            <div className="absolute right-0 mt-2 w-52 rounded-[16px] border border-white/10 bg-black/80 p-3 shadow-[0_12px_30px_rgba(0,0,0,0.45)]">
                              <p className="text-[10px] uppercase tracking-[0.2em] text-cosmic-gold/70">
                                {t("cocktail.tags_label")}
                              </p>
                              <div className="mt-2 flex flex-wrap gap-2">
                                {extraTags.map(tag => (
                                  <span
                                    key={tag.id}
                                    className={`rounded-full border px-3 py-1 text-[10px] uppercase tracking-[0.18em] ${
                                      tagTones[tag.category] ?? tagTones.style
                                    }`}
                                  >
                                    {tag.name}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
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
                  <div role="radiogroup" className="space-y-2">
                    {sizeOptions.map(option => {
                      const isSelected = selectedSizeId === option.id;
                      const isDisabled = option.status !== "available";
                      const priceLabel =
                        option.status === "coming"
                          ? t("cocktail.price_placeholder")
                          : option.price != null
                          ? `€${option.price.toFixed(2)}`
                          : t("cocktail.price_placeholder");
                      return (
                        <button
                          key={option.id}
                          type="button"
                          role="radio"
                          aria-checked={isSelected}
                          disabled={isDisabled}
                          onClick={() => !isDisabled && setSelectedSizeId(option.id)}
                          className={`relative flex w-full items-center justify-between overflow-hidden rounded-[14px] border px-4 py-3 text-left text-sm transition ${
                            isSelected
                              ? "border-cosmic-gold/55 shadow-[0_0_0_1px_rgba(242,178,76,0.25),0_0_18px_rgba(242,178,76,0.12)]"
                              : "border-white/10 hover:border-white/20"
                          } ${isDisabled ? "opacity-60 cursor-not-allowed" : ""}`}
                        >
                          <div>
                            <p className="text-xs uppercase tracking-[0.2em] text-cosmic-silver">
                              {option.name ?? t("cocktail.size_selection")}
                            </p>
                            <p className="text-[11px] text-cosmic-fog">
                              {option.volume_ml
                                ? `${option.volume_ml}ml`
                                : t("cocktail.size_volume_unknown")}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-cosmic-gold">{priceLabel}</p>
                            {option.status === "out" && (
                              <p className="text-[10px] uppercase tracking-[0.2em] text-red-300">
                                {t("cocktail.size_unavailable")}
                              </p>
                            )}
                          </div>
                          {option.status === "out" && (
                            <span className="pointer-events-none absolute -right-6 top-2 rotate-45 whitespace-nowrap bg-red-500/90 px-8 py-0.5 text-[9px] uppercase tracking-[0.2em] text-white">
                              {t("shop.out_of_stock_short")}
                            </span>
                          )}
                          {option.status === "coming" && (
                            <span className="pointer-events-none absolute -right-6 top-2 rotate-45 whitespace-nowrap bg-gradient-to-r from-cosmic-gold/80 via-sky-200/80 to-cosmic-gold/80 px-8 py-0.5 text-[9px] uppercase tracking-[0.2em] text-black">
                              {t("shop.coming_soon_short")}
                            </span>
                          )}
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

                  <div className="flex-1 text-right">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-cosmic-gold/70">
                      {t("cocktail.total_price")}
                    </p>
                    <p className="text-lg text-cosmic-gold">
                      {totalPrice ? `€${totalPrice.toFixed(2)}` : "—"}
                    </p>
                    <p className="text-[11px] text-cosmic-fog">
                      {selectedSize?.name
                        ? `${selectedSize.name}${selectedVolume ? ` · ${selectedVolume}ml` : ""}`
                        : t("cocktail.select_size_hint")}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleAddToCart}
                  disabled={!canAddToCart}
                  className="w-full rounded-[14px] bg-cosmic-gold px-4 py-3 text-center text-sm font-semibold text-cosmic-bg shadow-[0_0_0_1px_rgba(242,178,76,0.25),0_0_18px_rgba(242,178,76,0.12)] transition hover:translate-y-[-1px] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {t("cocktail.add_to_cart")}
                </button>

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
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <button
            type="button"
            onClick={() => handleJumpToDetails("serving")}
            className="rounded-[18px] border border-white/10 bg-white/5 p-4 text-left transition hover:border-cosmic-gold/40"
          >
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-cosmic-gold/70">
              <Timer className="h-4 w-4 text-cosmic-gold/80" />
              {t("cocktail.at_glance_ready")}
            </div>
            <p className="mt-3 text-sm text-cosmic-text">{t("cocktail.ready_time")}</p>
          </button>
          <button
            type="button"
            onClick={() => handleJumpToDetails("serving")}
            className="rounded-[18px] border border-white/10 bg-white/5 p-4 text-left transition hover:border-cosmic-gold/40"
          >
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-cosmic-gold/70">
              <Wine className="h-4 w-4 text-cosmic-gold/80" />
              {t("cocktail.at_glance_glass")}
            </div>
            <p className="mt-3 text-sm text-cosmic-text">
              {serving?.glassware ?? t("cocktail.spec_unknown")}
            </p>
          </button>
          <button
            type="button"
            onClick={() => handleJumpToDetails("overview")}
            className="rounded-[18px] border border-white/10 bg-white/5 p-4 text-left transition hover:border-cosmic-gold/40"
          >
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-cosmic-gold/70">
              <Sparkles className="h-4 w-4 text-cosmic-gold/80" />
              {t("cocktail.at_glance_taste")}
            </div>
            <p className="mt-3 text-sm text-cosmic-text">
              {flavorTags.length
                ? flavorTags.slice(0, 2).join(" • ")
                : t("cocktail.taste_fallback")}
            </p>
          </button>
          <button
            type="button"
            onClick={() => handleJumpToDetails("overview")}
            className="rounded-[18px] border border-white/10 bg-white/5 p-4 text-left transition hover:border-cosmic-gold/40"
          >
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-cosmic-gold/70">
              <AlertTriangle className="h-4 w-4 text-cosmic-gold/80" />
              {t("cocktail.at_glance_allergens")}
            </div>
            <div className="mt-3 flex flex-wrap gap-2 text-[11px] text-cosmic-silver">
              {allergens.length === 0 && (
                <span>{t("cocktail.no_allergens")}</span>
              )}
              {allergens.slice(0, 3).map(item => (
                <span
                  key={`glance-${item.allergens?.name}`}
                  className="rounded-full border border-red-500/30 bg-red-500/10 px-2 py-1 text-red-200"
                >
                  {item.allergens?.name}
                </span>
              ))}
              {allergens.length > 3 && (
                <span className="rounded-full border border-white/10 px-2 py-1 text-cosmic-silver">
                  +{allergens.length - 3}
                </span>
              )}
            </div>
          </button>
        </div>

        <div
          ref={detailsRef}
          className="rounded-[24px] border border-white/10 bg-white/5"
        >
          <div
            className="hidden lg:flex items-center justify-center gap-8 border-b border-white/10 px-6"
            role="tablist"
            aria-label={t("cocktail.details_tabs")}
          >
            {detailTabs.map((tab, index) => (
              <button
                key={tab.key}
                type="button"
                role="tab"
                aria-selected={activeTab === tab.key}
                aria-controls={`panel-${tab.key}`}
                onClick={() => setActiveTab(tab.key)}
                onKeyDown={event => handleTabKeyDown(event, index)}
                className={`relative py-4 text-sm uppercase tracking-[0.2em] transition focus:outline-none ${
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

          <div className="relative hidden lg:block">
            <div
              className="absolute inset-0 opacity-0 pointer-events-none"
              aria-hidden="true"
            >
              {DETAIL_TABS.map(tab => (
                <div
                  key={`measure-${tab}`}
                  ref={node => {
                    tabMeasureRefs.current[tab] = node;
                  }}
                  className="px-6 py-6"
                >
                  {renderTabContent(tab, true)}
                </div>
              ))}
            </div>

            <div
              className="px-6 py-6"
              style={detailsHeight ? { height: detailsHeight } : undefined}
            >
              <div
                id={`panel-${activeTab}`}
                role="tabpanel"
                className="h-full overflow-y-auto pr-2 [scrollbar-width:thin] [scrollbar-color:rgba(242,178,76,0.45)_transparent]"
              >
                {renderTabContent(activeTab)}
              </div>
            </div>
          </div>

          <div className="lg:hidden divide-y divide-white/10">
            {detailTabs.map(tab => (
              <div key={tab.key}>
                <button
                  type="button"
                  onClick={() => handleAccordionToggle(tab.key)}
                  className="flex w-full items-center justify-between px-5 py-4 text-left text-sm uppercase tracking-[0.2em] text-cosmic-gold"
                  aria-expanded={openAccordion === tab.key}
                  aria-controls={`mobile-panel-${tab.key}`}
                >
                  {tab.label}
                  <ChevronDown
                    className={`h-4 w-4 transition ${
                      openAccordion === tab.key ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {openAccordion === tab.key && (
                  <div id={`mobile-panel-${tab.key}`} className="px-5 pb-5">
                    {renderTabContent(tab.key)}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {relatedCocktails.length > 0 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-[--font-unica] text-cosmic-gold">
                {t("cocktail.related_cocktails")}
              </h3>
              {relatedCount > 1 && (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setActiveRelatedIndex(prev =>
                        prev === 0 ? relatedCount - 1 : prev - 1
                      )
                    }
                    className="rounded-full border border-white/10 p-2 text-cosmic-gold transition hover:border-cosmic-gold/40"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setActiveRelatedIndex(prev => (prev + 1) % relatedCount)
                    }
                    className="rounded-full border border-white/10 p-2 text-cosmic-gold transition hover:border-cosmic-gold/40"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
            <div className="relative h-72 overflow-hidden">
              {relatedSlots.map(slot => {
                const item = relatedCocktails[slot.index];
                if (!item?.cocktails) return null;
                const positionStyles =
                  slot.position === "center"
                    ? {
                        transform: "translate(-50%, -50%) scale(1)",
                        opacity: 1,
                        filter: "none",
                        zIndex: 20,
                      }
                    : slot.position === "left"
                      ? {
                          transform: "translate(-135%, -50%) scale(0.88)",
                          opacity: 0.55,
                          filter: "blur(2px)",
                          zIndex: 10,
                        }
                      : {
                          transform: "translate(35%, -50%) scale(0.88)",
                          opacity: 0.55,
                          filter: "blur(2px)",
                          zIndex: 10,
                        };
                return (
                  <Link
                    key={`${item.cocktail_id}-${slot.position}`}
                    href={`/shop/${item.cocktails.id}`}
                    prefetch={false}
                    className="absolute left-1/2 top-1/2 w-52 sm:w-60 rounded-[22px] border border-white/10 bg-white/5 p-4 shadow-[0_20px_40px_rgba(0,0,0,0.35)] backdrop-blur-md transition-[transform,opacity,filter] duration-700 ease-out"
                    style={positionStyles}
                  >
                    <div className="relative h-44 w-full overflow-hidden rounded-[18px] border border-white/10">
                      <Image
                        src={item.cocktails.image_url ?? "/images/placeholder.webp"}
                        alt={item.cocktails.name ?? "Cocktail"}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <p className="mt-3 text-center text-sm text-cosmic-text">
                      {item.cocktails.name}
                    </p>
                  </Link>
                );
              })}
            </div>
            {relatedCount > 1 && (
              <div className="flex items-center justify-center gap-2">
                {relatedCocktails.map((_, index) => (
                  <button
                    key={`related-dot-${index}`}
                    type="button"
                    onClick={() => setActiveRelatedIndex(index)}
                    className={`h-2 w-2 rounded-full transition ${
                      index === activeRelatedIndex
                        ? "bg-cosmic-gold"
                        : "bg-white/20 hover:bg-white/40"
                    }`}
                    aria-label={`Go to related cocktail ${index + 1}`}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <div
        className={`lg:hidden fixed bottom-4 left-4 right-4 z-40 rounded-[18px] border border-white/10 bg-white/10 p-3 shadow-[0_12px_30px_rgba(0,0,0,0.45)] transition ${
          showStickyBar
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-6 pointer-events-none"
        }`}
      >
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-cosmic-gold/70">
              {selectedSize?.name ?? t("cocktail.choose_size")}
            </p>
            <p className="text-sm text-cosmic-silver">
              {selectedPrice ? `€${selectedPrice.toFixed(2)}` : "—"}
            </p>
          </div>
          <button
            type="button"
            onClick={handleAddToCart}
            disabled={!canAddToCart}
            className="rounded-[14px] bg-cosmic-gold px-4 py-3 text-sm font-semibold text-cosmic-bg disabled:opacity-60"
          >
            {t("cocktail.add_to_cart")}
          </button>
        </div>
      </div>
    </section>
  );
}
