import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { queryKeys, getQueryConfig } from "@/lib/query-client";
import { Cocktail } from "@/types/shared";

const supabase = createClient();

// Hook para obtener todos los productos
export function useProducts() {
  return useQuery({
    queryKey: queryKeys.products.all,
    queryFn: async () => {
      const { data, error } = await supabase
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
          tags
        `
        )
        .eq("is_available", true)
        .order("name");

      if (error) {
        throw new Error(`Error fetching products: ${error.message}`);
      }

      return data as any[];
    },
    ...getQueryConfig("products"),
  });
}

// Hook para obtener un producto específico
export function useProduct(productId: string) {
  return useQuery({
    queryKey: queryKeys.products.byId(productId),
    queryFn: async () => {
      const { data, error } = await supabase
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
          tags
        `
        )
        .eq("id", productId)
        .single();

      if (error) {
        throw new Error(`Error fetching product: ${error.message}`);
      }

      return data as any;
    },
    enabled: !!productId,
    ...getQueryConfig("products"),
  });
}

// Hook para buscar productos
export function useProductSearch(query: string) {
  return useQuery({
    queryKey: queryKeys.products.search(query),
    queryFn: async () => {
      if (!query.trim()) return [];

      const { data, error } = await supabase
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
          tags
        `
        )
        .eq("is_available", true)
        .or(
          `name.ilike.%${query}%,description.ilike.%${query}%,tags.cs.{${query}}`
        )
        .order("name")
        .limit(20);

      if (error) {
        throw new Error(`Error searching products: ${error.message}`);
      }

      return data as any[];
    },
    enabled: !!query.trim(),
    ...getQueryConfig("products"),
  });
}

// Hook para obtener productos por categoría/tag
export function useProductsByCategory(category: string) {
  return useQuery({
    queryKey: queryKeys.products.byCategory(category),
    queryFn: async () => {
      const { data, error } = await supabase
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
          tags
        `
        )
        .eq("is_available", true)
        .contains("tags", [category])
        .order("name");

      if (error) {
        throw new Error(
          `Error fetching products by category: ${error.message}`
        );
      }

      return data as any[];
    },
    enabled: !!category,
    ...getQueryConfig("products"),
  });
}

// Hook para obtener productos destacados
export function useFeaturedProducts() {
  return useQuery({
    queryKey: ["products", "featured"],
    queryFn: async () => {
      const { data, error } = await supabase
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
          tags
        `
        )
        .eq("is_available", true)
        .contains("tags", ["featured"])
        .order("name")
        .limit(6);

      if (error) {
        throw new Error(`Error fetching featured products: ${error.message}`);
      }

      return data as any[];
    },
    ...getQueryConfig("products"),
  });
}

// Hook para obtener productos sin alcohol
export function useNonAlcoholicProducts() {
  return useQuery({
    queryKey: ["products", "non-alcoholic"],
    queryFn: async () => {
      const { data, error } = await supabase
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
          tags
        `
        )
        .eq("is_available", true)
        .eq("has_non_alcoholic_version", true)
        .order("name");

      if (error) {
        throw new Error(
          `Error fetching non-alcoholic products: ${error.message}`
        );
      }

      return data as any[];
    },
    ...getQueryConfig("products"),
  });
}

// Hook para obtener estadísticas de productos
export function useProductStats() {
  return useQuery({
    queryKey: ["products", "stats"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cocktails")
        .select("is_available, alcohol_percentage, has_non_alcoholic_version");

      if (error) {
        throw new Error(`Error fetching product stats: ${error.message}`);
      }

      const typedData = data as Array<{
        is_available: boolean;
        alcohol_percentage: number;
        has_non_alcoholic_version: boolean;
      }> | null;

      const stats = {
        totalProducts: typedData?.length || 0,
        availableProducts: typedData?.filter(p => p.is_available).length || 0,
        nonAlcoholicProducts:
          typedData?.filter(p => p.has_non_alcoholic_version).length || 0,
        averageAlcoholPercentage:
          typedData?.reduce((sum, p) => sum + p.alcohol_percentage, 0) /
            (typedData?.length || 1) || 0,
      };

      return stats;
    },
    ...getQueryConfig("products"),
  });
}
