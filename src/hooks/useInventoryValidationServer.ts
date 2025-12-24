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
            items: [{ cocktail_id: cocktailId, sizes_id: sizeId }],
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to check availability");
        }

        const data = await response.json();
        const result = Array.isArray(data?.results) ? data.results[0] : data;
        return result?.available && (result?.stock_quantity || 0) > 0;
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
            items: [{ cocktail_id: cocktailId, sizes_id: sizeId }],
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to get max quantity");
        }

        const data = await response.json();
        const result = Array.isArray(data?.results) ? data.results[0] : data;
        return result?.stock_quantity || 0;
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
        if (items.length === 0) {
          return [];
        }

        const response = await fetch("/api/check-inventory", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            items: items.map(item => ({
              cocktail_id: item.cocktail_id,
              sizes_id: item.sizes_id,
            })),
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to validate inventory");
        }

        const data = await response.json();
        const results = Array.isArray(data?.results) ? data.results : [];

        return results.map((result: InventoryStatus) => ({
          cocktail_id: result.cocktail_id,
          sizes_id: result.sizes_id,
          available: Boolean(result.available),
          stock_quantity: result.stock_quantity ?? 0,
          max_quantity: result.stock_quantity ?? 0,
        }));
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
