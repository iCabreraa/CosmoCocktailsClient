"use client";

import { useState, useCallback } from "react";
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

export function useInventoryValidationServer(): UseInventoryValidationReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkItemAvailability = useCallback(
    async (cocktailId: string, sizeId: string): Promise<boolean> => {
      try {
        const response = await fetch("/api/check-inventory", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            cocktail_id: cocktailId,
            sizes_id: sizeId,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to check availability");
        }

        const data = await response.json();
        return data.available && (data.stock_quantity || 0) > 0;
      } catch (err) {
        console.error("Error checking availability:", err);
        return false;
      }
    },
    []
  );

  const getMaxQuantity = useCallback(
    async (cocktailId: string, sizeId: string): Promise<number> => {
      try {
        const response = await fetch("/api/check-inventory", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            cocktail_id: cocktailId,
            sizes_id: sizeId,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to get max quantity");
        }

        const data = await response.json();
        return data.stock_quantity || 0;
      } catch (err) {
        console.error("Error getting max quantity:", err);
        return 0;
      }
    },
    []
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
