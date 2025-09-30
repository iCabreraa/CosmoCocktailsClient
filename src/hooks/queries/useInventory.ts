import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { queryKeys, getQueryConfig } from "@/lib/query-client";
import { CartItem } from "@/types/shared";
import { CocktailSizesRow, InventoryCheckRow } from "@/types";

const supabase = createClient();

// Hook para verificar inventario de un item específico
export function useInventoryCheck(cocktailId: string, sizeId: string) {
  return useQuery({
    queryKey: queryKeys.inventory.byCocktailSize(cocktailId, sizeId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cocktail_sizes")
        .select("available, stock_quantity, cocktail_id, sizes_id")
        .eq("cocktail_id", cocktailId)
        .eq("sizes_id", sizeId)
        .single();

      if (error) {
        throw new Error(`Error checking inventory: ${error.message}`);
      }

      const typedData = data as InventoryCheckRow | null;

      return {
        available: typedData?.available ?? false,
        stock_quantity: typedData?.stock_quantity ?? 0,
        cocktail_id: cocktailId,
        sizes_id: sizeId,
      };
    },
    enabled: !!cocktailId && !!sizeId,
    ...getQueryConfig("inventory"),
  });
}

// Hook para verificar inventario de múltiples items (carrito)
export function useInventoryValidation(items: CartItem[]) {
  return useQuery({
    queryKey: queryKeys.inventory.check(items),
    queryFn: async () => {
      if (!items.length) return [];

      // Verificar inventario de todos los items en paralelo
      const inventoryChecks = await Promise.all(
        items.map(async item => {
          const { data, error } = await supabase
            .from("cocktail_sizes")
            .select("available, stock_quantity")
            .eq("cocktail_id", item.cocktail_id)
            .eq("sizes_id", item.sizes_id)
            .single();

          if (error) {
            console.error(
              `Error checking inventory for ${item.cocktail_id}:`,
              error
            );
            return {
              cocktail_id: item.cocktail_id,
              sizes_id: item.sizes_id,
              available: false,
              stock_quantity: 0,
              requested_quantity: item.quantity,
              max_available: 0,
            };
          }

          const typedData = data as {
            available: boolean;
            stock_quantity: number;
          } | null;

          return {
            cocktail_id: item.cocktail_id,
            sizes_id: item.sizes_id,
            available: typedData?.available ?? false,
            stock_quantity: typedData?.stock_quantity ?? 0,
            requested_quantity: item.quantity,
            max_available: Math.min(
              typedData?.stock_quantity ?? 0,
              item.quantity
            ),
          };
        })
      );

      return inventoryChecks;
    },
    enabled: items.length > 0,
    ...getQueryConfig("inventory"),
  });
}

// Hook para obtener todos los tamaños de un cóctel
export function useCocktailSizes(cocktailId: string) {
  return useQuery({
    queryKey: queryKeys.inventory.byCocktail(cocktailId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cocktail_sizes")
        .select(
          `
          cocktail_id,
          sizes_id,
          price,
          available,
          stock_quantity,
          cocktails!inner(
            id,
            name,
            image_url
          ),
          sizes!inner(
            id,
            name,
            volume_ml
          )
        `
        )
        .eq("cocktail_id", cocktailId)
        .order("sizes(volume_ml)");

      if (error) {
        throw new Error(`Error fetching cocktail sizes: ${error.message}`);
      }

      return (data as CocktailSizesRow[]) || [];
    },
    enabled: !!cocktailId,
    ...getQueryConfig("inventory"),
  });
}

// Hook para actualizar stock (mutación)
export function useUpdateStock() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      cocktailId,
      sizeId,
      quantity,
    }: {
      cocktailId: string;
      sizeId: string;
      quantity: number;
    }) => {
      // Obtener stock actual
      const { data: currentStock, error: fetchError } = await supabase
        .from("cocktail_sizes")
        .select("stock_quantity")
        .eq("cocktail_id", cocktailId)
        .eq("sizes_id", sizeId)
        .single();

      if (fetchError) {
        throw new Error(`Error fetching current stock: ${fetchError.message}`);
      }

      const typedCurrentStock = currentStock as { stock_quantity: number } | null;

      const newStock = Math.max(
        0,
        (typedCurrentStock?.stock_quantity ?? 0) - quantity
      );

      // Actualizar stock
      const { error: updateError } = await supabase
        .from("cocktail_sizes")
        .update({ stock_quantity: newStock })
        .eq("cocktail_id", cocktailId)
        .eq("sizes_id", sizeId);

      if (updateError) {
        throw new Error(`Error updating stock: ${updateError.message}`);
      }

      return { cocktailId, sizeId, newStock };
    },
    onSuccess: data => {
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({
        queryKey: queryKeys.inventory.byCocktailSize(
          data.cocktailId,
          data.sizeId
        ),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.inventory.byCocktail(data.cocktailId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.inventory.all,
      });
    },
  });
}

// Hook para obtener estadísticas de inventario
export function useInventoryStats() {
  return useQuery({
    queryKey: ["inventory", "stats"],
    queryFn: async () => {
      const { data, error } = await supabase.from("cocktail_sizes").select(`
          available,
          stock_quantity,
          cocktails!inner(name),
          sizes!inner(name, volume_ml)
        `);

      if (error) {
        throw new Error(`Error fetching inventory stats: ${error.message}`);
      }

      const typedData = data as Array<{
        available: boolean;
        stock_quantity: number;
        cocktails: { name: string };
        sizes: { name: string; volume_ml: number };
      }> | null;

      const stats = {
        totalItems: typedData?.length || 0,
        availableItems: typedData?.filter(item => item.available).length || 0,
        outOfStockItems:
          typedData?.filter(
            item => !item.available || item.stock_quantity === 0
          ).length || 0,
        lowStockItems:
          typedData?.filter(
            item =>
              item.available &&
              item.stock_quantity > 0 &&
              item.stock_quantity < 10
          ).length || 0,
        totalStockValue: 0, // Price not available in this query
      };

      return stats;
    },
    ...getQueryConfig("inventory"),
  });
}
