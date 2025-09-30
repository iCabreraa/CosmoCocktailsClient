"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { CartItem } from "@/types/shared";

interface InventoryStatus {
  cocktail_id: string;
  sizes_id: string; // Corregido: en la BD real es sizes_id, no size_id
  available: boolean;
  stock_quantity?: number;
  max_quantity?: number;
}

interface UseInventoryValidationReturn {
  validateInventory: (items: CartItem[]) => Promise<InventoryStatus[]>;
  checkItemAvailability: (
    cocktailId: string,
    sizeId: string
  ) => Promise<boolean>;
  getMaxQuantity: (cocktailId: string, sizeId: string) => Promise<number>;
  isLoading: boolean;
  error: string | null;
}

export function useInventoryValidation(): UseInventoryValidationReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  const checkItemAvailability = useCallback(
    async (cocktailId: string, sizeId: string): Promise<boolean> => {
      try {
        const { data, error } = await supabase
          .from("cocktail_sizes")
          .select("available, stock_quantity")
          .eq("cocktail_id", cocktailId)
          .eq("sizes_id", sizeId)
          .single();

        if (error) {
          console.error("Error checking availability:", error);
          return false;
        }

        const typedData = data as {
          available: boolean;
          stock_quantity: number;
        } | null;
        return (
          Boolean(typedData?.available) && (typedData?.stock_quantity || 0) > 0
        );
      } catch (err) {
        console.error("Error in checkItemAvailability:", err);
        return false;
      }
    },
    [supabase]
  );

  const getMaxQuantity = useCallback(
    async (cocktailId: string, sizeId: string): Promise<number> => {
      try {
        const { data, error } = await supabase
          .from("cocktail_sizes")
          .select("stock_quantity")
          .eq("cocktail_id", cocktailId)
          .eq("sizes_id", sizeId)
          .single();

        if (error) {
          console.error("Error getting max quantity:", error);
          return 0;
        }

        const typedData = data as { stock_quantity: number } | null;
        return typedData?.stock_quantity || 0;
      } catch (err) {
        console.error("Error in getMaxQuantity:", err);
        return 0;
      }
    },
    [supabase]
  );

  const validateInventory = useCallback(
    async (items: CartItem[]): Promise<InventoryStatus[]> => {
      setIsLoading(true);
      setError(null);

      try {
        const validationPromises = items.map(async item => {
          const available = await checkItemAvailability(
            item.cocktail_id,
            item.sizes_id
          );
          const maxQuantity = await getMaxQuantity(
            item.cocktail_id,
            item.sizes_id
          );

          return {
            cocktail_id: item.cocktail_id,
            sizes_id: item.sizes_id,
            available,
            stock_quantity: maxQuantity,
            max_quantity: maxQuantity,
          };
        });

        const results = await Promise.all(validationPromises);
        return results;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Error validating inventory";
        setError(errorMessage);
        console.error("Error validating inventory:", err);
        return [];
      } finally {
        setIsLoading(false);
      }
    },
    [checkItemAvailability, getMaxQuantity]
  );

  return {
    validateInventory,
    checkItemAvailability,
    getMaxQuantity,
    isLoading,
    error,
  };
}
